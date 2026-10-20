import { useEffect, useMemo, useState } from 'react';
import { CalendarCheck, Check, MapPin, MessageCircle, RefreshCw, Store, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { panelUpdateVisita, panelVisitas, waDe, type Visita, type VisitaCambios } from '@/lib/api';
import { Ficha } from '@/components/PanelInstalacion';

/**
 * Las visitas que pide la gente por WhatsApp. El bot no fija el día: las deja
 * acá y el equipo las confirma según su capacidad y su ruta. Por eso al lado
 * de cada solicitud se ve si ya vamos para ese municipio: una instalación en
 * Choloma el jueves es la excusa para pasar a cotizar a la vecina.
 *
 * Confirmar le manda el WhatsApp al cliente con día, hora y dirección. Cada
 * visita confirmada o hecha lleva su ficha y su bitácora (PanelInstalacion).
 */

const hoy = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Tegucigalpa' });

const dia = (f: string) =>
  new Date(`${f}T12:00:00Z`).toLocaleDateString('es-HN', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long' });

function hora(h: string): string {
  const [hh, mm] = h.split(':').map(Number);
  return `${((hh! + 11) % 12) + 1}:${String(mm).padStart(2, '0')} ${hh! < 12 ? 'a.m.' : 'p.m.'}`;
}

const mismoLugar = (a: string | null, b: string | null) =>
  !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();

export function PanelVisitas({ onConteo }: { onConteo: (n: number) => void }) {
  const [lista, setLista] = useState<Visita[] | null>(null);

  const cargar = () => {
    panelVisitas()
      .then(setLista)
      .catch((e) => toast.error(e instanceof Error ? e.message : 'No se pudieron cargar las visitas'));
  };
  useEffect(cargar, []);

  const todas = lista ?? [];
  const pendientes = todas.filter((v) => v.estado === 'pendiente');
  // La agenda que viene: confirmadas de hoy en adelante, por día.
  const agenda = useMemo(() => {
    const m = new Map<string, Visita[]>();
    for (const v of todas) {
      if (v.estado !== 'confirmada' || !v.fecha || v.fecha < hoy()) continue;
      m.set(v.fecha, [...(m.get(v.fecha) ?? []), v]);
    }
    return [...m.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [todas]);
  const hechas = todas.filter((v) => v.estado === 'realizada').slice(0, 60);
  const canceladas = todas.filter((v) => v.estado === 'cancelada').slice(0, 30);

  useEffect(() => {
    if (lista) onConteo(pendientes.length);
  }, [lista, pendientes.length, onConteo]);

  async function cambiar(v: Visita, c: VisitaCambios) {
    try {
      const r = await panelUpdateVisita(v.id, c);
      setLista((l) => (l ?? []).map((x) => (x.id === v.id ? r.visita : x)));
      if (r.whatsapp) {
        if (r.whatsapp.ok) toast.success(`Confirmada. A ${v.nombre} le llegó el WhatsApp.`);
        else toast.warning(`Confirmada, pero el WhatsApp no salió (${r.whatsapp.error ?? 'error'}). Escribile vos.`);
      } else if (c.estado === 'realizada') toast.success(`${v.nombre}: marcada como hecha.`);
      else if (c.estado === 'cancelada') toast(`${v.nombre}: cancelada. Al cliente no se le avisa.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar');
      throw e;
    }
  }

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="kzp-titulo">Visitas e instalaciones</h2>
          <p className="kzp-sub">El bot deja las solicitudes; vos ponés el día según la ruta y al cliente le llega la confirmación. Cada instalación guarda su ficha y su bitácora.</p>
        </div>
        <Button variant="outline" onClick={cargar}><RefreshCw /> Recargar</Button>
      </div>

      {/* ── Por confirmar ── */}
      <p className="kz-eyebrow">// por confirmar · {pendientes.length}</p>
      {!lista ? (
        <div className="mt-3 space-y-2.5">{Array.from({ length: 2 }, (_, i) => <div key={i} className="kzp-esqueleto h-[132px]" />)}</div>
      ) : pendientes.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Nada pendiente.</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {pendientes.map((v) => {
            // Si ya vamos para ese municipio, se dice: es la ruta que conviene.
            const cerca = agenda.filter(([, vs]) => vs.some((x) => mismoLugar(x.municipio, v.municipio))).map(([f]) => f);
            return (
              <li key={v.id} className="kz-card p-4">
                <Cabeza v={v} />
                {v.preferencia && (
                  <p className="mt-2 text-[13px]"><span className="text-muted-foreground">Le queda bien: </span>{v.preferencia}</p>
                )}
                {cerca.length > 0 && (
                  <p className="mt-2 text-[13px] font-medium text-accent-foreground">Ya vas por {v.municipio}: {cerca.map(dia).join(', ')}</p>
                )}
                <Programar
                  inicial={{ fecha: cerca[0] ?? '', hora: '' }}
                  boton="Confirmar y avisar"
                  nombre={v.nombre}
                  onGuardar={(f, h) => cambiar(v, { fecha: f, hora: h, estado: 'confirmada' })}
                  onCancelar={() => cambiar(v, { estado: 'cancelada' })}
                />
              </li>
            );
          })}
        </ul>
      )}

      {/* ── Agenda ── */}
      <p className="kz-eyebrow mt-10">// agenda</p>
      {agenda.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Sin visitas confirmadas.</p>
      ) : (
        <div className="mt-3 space-y-5">
          {agenda.map(([f, vs]) => (
            <div key={f}>
              <p className="flex flex-wrap items-baseline gap-x-3 text-sm font-bold capitalize">
                {dia(f)}
                <span className="text-[12px] font-normal normal-case text-muted-foreground">
                  {vs.length} {vs.length === 1 ? 'visita' : 'visitas'} · {[...new Set(vs.map((x) => x.municipio).filter(Boolean))].join(', ')}
                </span>
              </p>
              <ul className="mt-2 space-y-2">
                {vs
                  .sort((a, b) => (a.hora ?? '').localeCompare(b.hora ?? ''))
                  .map((v) => (
                    <li key={v.id} className="kz-card p-4">
                      <Cabeza v={v} hora={v.hora ? hora(v.hora) : undefined} />
                      <Programar
                        inicial={{ fecha: v.fecha ?? '', hora: v.hora ?? '' }}
                        boton="Mover y avisar"
                        nombre={v.nombre}
                        onGuardar={(nf, nh) => cambiar(v, { fecha: nf, hora: nh })}
                        onCancelar={() => cambiar(v, { estado: 'cancelada' })}
                        onHecha={() => cambiar(v, { estado: 'realizada' })}
                      />
                      <Ficha v={v} onGuardar={(c) => cambiar(v, c)} />
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* ── Instalaciones hechas: la ficha y la bitácora de cada una ── */}
      <p className="kz-eyebrow mt-10">// instalaciones hechas · {hechas.length}</p>
      {hechas.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Todavía ninguna.</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {hechas.map((v) => (
            <li key={v.id} className="kz-card p-4">
              <Cabeza v={v} hora={v.fecha ? dia(v.fecha) : undefined} />
              <Ficha v={v} onGuardar={(c) => cambiar(v, c)} />
            </li>
          ))}
        </ul>
      )}

      {canceladas.length > 0 && (
        <details className="mt-10">
          <summary className="kz-eyebrow cursor-pointer">// canceladas · {canceladas.length}</summary>
          <ul className="mt-3 space-y-1.5 text-[13px] text-muted-foreground">
            {canceladas.map((v) => (
              <li key={v.id}>✕ {v.nombre} · {v.municipio ?? 'local'} · {v.fecha ? dia(v.fecha) : 'sin fecha'}</li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

function Cabeza({ v, hora }: { v: Visita; hora?: string }) {
  const wa = waDe(v.telefono);
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2 font-bold">
          {hora && <span className="font-mono text-accent-foreground">{hora}</span>}
          {v.nombre}
          <Badge variant="secondary">{v.servicio}</Badge>
        </p>
        <p className="mt-1 flex items-start gap-1.5 text-[13px] text-muted-foreground">
          {v.tipo === 'local' ? <Store size={14} className="mt-0.5 shrink-0" /> : <MapPin size={14} className="mt-0.5 shrink-0" />}
          <span>{v.tipo === 'local' ? 'En el local' : [v.municipio, v.direccion].filter(Boolean).join(' · ')}</span>
        </p>
        {v.notas && <p className="mt-1.5 whitespace-pre-line text-[13px]">{v.notas}</p>}
      </div>
      {wa && (
        <Button variant="outline" size="sm" asChild>
          <a href={wa} target="_blank" rel="noreferrer"><MessageCircle /> {v.telefono}</a>
        </Button>
      )}
    </div>
  );
}

function Programar({
  inicial, boton, nombre, onGuardar, onCancelar, onHecha,
}: {
  inicial: { fecha: string; hora: string };
  boton: string;
  nombre: string;
  onGuardar: (fecha: string, hora: string) => void;
  onCancelar: () => void;
  onHecha?: () => void;
}) {
  const [fecha, setFecha] = useState(inicial.fecha);
  const [h, setH] = useState(inicial.hora);
  const cambio = fecha !== inicial.fecha || h !== inicial.hora;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <Input type="date" min={hoy()} value={fecha} onChange={(e) => setFecha(e.target.value)} className="w-auto" aria-label="Día" />
      <Input type="time" min="07:00" max="18:00" step={900} value={h} onChange={(e) => setH(e.target.value)} className="w-auto" aria-label="Hora" />
      <Button disabled={!fecha || !h || (!!onHecha && !cambio)} onClick={() => onGuardar(fecha, h)}>
        <CalendarCheck /> {boton}
      </Button>
      {onHecha && (
        <Button variant="outline" onClick={onHecha}><Check /> Hecha</Button>
      )}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" className="text-muted-foreground"><X /> Cancelar</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar la visita de {nombre}?</AlertDialogTitle>
            <AlertDialogDescription>Al cliente no se le avisa: escribile vos por WhatsApp.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction onClick={onCancelar}>Cancelar visita</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
