import { useEffect, useMemo, useState } from 'react';
import { CalendarCheck, Check, ChevronDown, MapPin, MessageCircle, Plus, RefreshCw, Store, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { panelCrearVisita, panelStaff, panelUpdateVisita, panelVisitas, waDe, type Visita, type VisitaCambios, type VisitaNueva } from '@/lib/api';
import { Ficha } from '@/components/PanelInstalacion';
import { categoriaDe, CATEGORIAS } from '@/lib/categorias';

/**
 * Visitas e instalaciones en tres columnas: por confirmar, agenda e
 * instalaciones hechas. El bot deja las solicitudes; vos ponés el día según
 * la ruta y el técnico que va. Cada tarjeta se abre para programar, mover,
 * marcar hecha y ver la ficha con bitácora. "Programar visita" crea una que
 * no vino del bot.
 */

const hoy = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Tegucigalpa' });
const diaLargo = (f: string) => new Date(`${f}T12:00:00Z`).toLocaleDateString('es-HN', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long' });
const diaCorto = (f: string) => {
  const d = new Date(`${f}T12:00:00Z`).toLocaleDateString('es-HN', { timeZone: 'UTC', weekday: 'short', day: 'numeric' });
  return d.charAt(0).toUpperCase() + d.slice(1).replace('.', '');
};
function hora(h: string): string {
  const [hh, mm] = h.split(':').map(Number);
  return `${((hh! + 11) % 12) + 1}:${String(mm).padStart(2, '0')} ${hh! < 12 ? 'a.m.' : 'p.m.'}`;
}
const iniciales = (n: string) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('') || '–';
const mismoLugar = (a: string | null, b: string | null) => !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();

export function PanelVisitas({ onConteo }: { onConteo: (n: number) => void }) {
  const [lista, setLista] = useState<Visita[] | null>(null);
  const [abierta, setAbierta] = useState<string | null>(null);
  const [nueva, setNueva] = useState(false);
  const [tecnicos, setTecnicos] = useState<string[]>([]);

  const cargar = () => {
    panelVisitas()
      .then(setLista)
      .catch((e) => toast.error(e instanceof Error ? e.message : 'No se pudieron cargar las visitas'));
  };
  useEffect(cargar, []);
  useEffect(() => {
    panelStaff().then((s) => setTecnicos(s.filter((p) => p.activo).map((p) => p.nombre))).catch(() => {});
  }, []);

  const todas = lista ?? [];
  const pendientes = todas.filter((v) => v.estado === 'pendiente');
  const agenda = useMemo(
    () => todas.filter((v) => v.estado === 'confirmada' && v.fecha && v.fecha >= hoy()).sort((a, b) => `${a.fecha}${a.hora ?? ''}`.localeCompare(`${b.fecha}${b.hora ?? ''}`)),
    [todas],
  );
  const hechas = todas.filter((v) => v.estado === 'realizada').slice(0, 40);
  const canceladas = todas.filter((v) => v.estado === 'cancelada').slice(0, 30);
  const diasEn = (municipio: string | null) => [...new Set(agenda.filter((x) => mismoLugar(x.municipio, municipio)).map((x) => x.fecha!))];

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
      else if (c.tecnico !== undefined) toast.success(c.tecnico ? `${c.tecnico.split(' ')[0]} va a la de ${v.nombre}.` : 'Sin técnico asignado.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar');
      throw e;
    }
  }

  async function crear(d: VisitaNueva) {
    try {
      const r = await panelCrearVisita(d);
      setLista((l) => [r.visita, ...(l ?? [])]);
      setNueva(false);
      setAbierta(r.visita.id);
      if (r.whatsapp) toast[r.whatsapp.ok ? 'success' : 'warning'](r.whatsapp.ok ? `Programada. A ${d.nombre} le llegó el WhatsApp.` : `Programada, pero el WhatsApp no salió (${r.whatsapp.error ?? 'error'}).`);
      else toast.success(r.visita.estado === 'confirmada' ? 'Visita programada.' : 'Visita guardada por confirmar.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo crear');
    }
  }

  const Tarjeta = ({ v, fecha }: { v: Visita; fecha: string }) => {
    const cat = CATEGORIAS[categoriaDe(v.servicio)];
    const abiertaYo = abierta === v.id;
    return (
      <li className="kzp-col-item">
        <button onClick={() => setAbierta(abiertaYo ? null : v.id)} className="w-full text-left" aria-expanded={abiertaYo}>
          <span className="flex items-start justify-between gap-2">
            <span className="text-[14.5px] font-semibold leading-snug">{v.servicio} · {v.nombre}</span>
            <span className="shrink-0 whitespace-nowrap text-[12px] font-semibold text-accent-foreground">{fecha}</span>
          </span>
          <span className="mt-1 block text-[13px] text-muted-foreground">{v.tipo === 'local' ? 'En el local' : [v.municipio, v.direccion].filter(Boolean).join(' · ') || 'Sin dirección'}</span>
          <span className="mt-2.5 flex items-center gap-2 text-[12.5px] text-muted-foreground">
            <span className="kzp-avatar">{v.tecnico ? iniciales(v.tecnico) : '–'}</span>
            {v.tecnico ? v.tecnico.split(' ')[0] : 'Sin asignar'}
            <span className="ml-auto rounded-full bg-muted px-2.5 py-0.5 text-[12px]">{cat.nombre}</span>
            <ChevronDown size={14} className={`transition-transform ${abiertaYo ? 'rotate-180' : ''}`} />
          </span>
        </button>
        {abiertaYo && (
          <div className="mt-3 border-t border-border pt-3">
            <Cabeza v={v} />
            {v.preferencia && <p className="mt-2 text-[13px]"><span className="text-muted-foreground">Le queda bien: </span>{v.preferencia}</p>}
            {v.estado === 'pendiente' && diasEn(v.municipio).length > 0 && (
              <p className="mt-2 text-[13px] font-medium text-accent-foreground">Ya vas por {v.municipio}: {diasEn(v.municipio).map(diaLargo).join(', ')}</p>
            )}
            <div className="mt-3 space-y-1.5">
              <Label>Técnico</Label>
              <Select value={v.tecnico ?? '__'} onValueChange={(t) => cambiar(v, { tecnico: t === '__' ? null : t })}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Sin asignar" /></SelectTrigger>
                <SelectContent><SelectItem value="__">Sin asignar</SelectItem>{[...new Set([...tecnicos, ...(v.tecnico ? [v.tecnico] : [])])].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {v.estado !== 'realizada' && (
              <Programar
                inicial={{ fecha: v.fecha ?? diasEn(v.municipio)[0] ?? '', hora: v.hora ?? '' }}
                boton={v.estado === 'pendiente' ? 'Confirmar y avisar' : 'Mover y avisar'}
                nombre={v.nombre}
                onGuardar={(f, h) => cambiar(v, { fecha: f, hora: h, estado: 'confirmada' })}
                onCancelar={() => cambiar(v, { estado: 'cancelada' })}
                onHecha={v.estado === 'confirmada' ? () => cambiar(v, { estado: 'realizada' }) : undefined}
              />
            )}
            {v.estado !== 'pendiente' && <Ficha v={v} onGuardar={(c) => cambiar(v, c)} />}
          </div>
        )}
      </li>
    );
  };

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="kzp-titulo">Visitas e instalaciones</h2>
          <p className="kzp-sub">El bot deja las solicitudes; vos ponés el día según la ruta. Cada instalación guarda su ficha y bitácora.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={cargar} aria-label="Recargar"><RefreshCw /></Button>
          <Button onClick={() => setNueva(true)}><Plus /> Programar visita</Button>
        </div>
      </div>

      {!lista ? (
        <div className="grid gap-4 md:grid-cols-3">{Array.from({ length: 3 }, (_, i) => <div key={i} className="kzp-esqueleto h-[260px]" />)}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Columna titulo="Por confirmar" tono="var(--kzp-ambar)" n={pendientes.length} vacio="Nada pendiente.">
            {pendientes.map((v) => <Tarjeta key={v.id} v={v} fecha={v.preferencia ? `Pide: ${v.preferencia}` : 'Sin preferencia'} />)}
          </Columna>
          <Columna titulo="Agenda" tono="var(--kzp-azul)" n={agenda.length} vacio="Sin visitas confirmadas.">
            {agenda.map((v) => <Tarjeta key={v.id} v={v} fecha={`${diaCorto(v.fecha!)}${v.hora ? ` · ${hora(v.hora)}` : ''}`} />)}
          </Columna>
          <Columna titulo="Instalaciones hechas" tono="var(--green)" n={hechas.length} vacio="Todavía ninguna.">
            {hechas.map((v) => <Tarjeta key={v.id} v={v} fecha={v.fecha ? diaCorto(v.fecha) : 'Hecha'} />)}
          </Columna>
        </div>
      )}

      {canceladas.length > 0 && (
        <details className="mt-8">
          <summary className="kz-eyebrow cursor-pointer">// canceladas · {canceladas.length}</summary>
          <ul className="mt-3 space-y-1.5 text-[13px] text-muted-foreground">
            {canceladas.map((v) => <li key={v.id}>✕ {v.nombre} · {v.municipio ?? 'local'} · {v.fecha ? diaLargo(v.fecha) : 'sin fecha'}</li>)}
          </ul>
        </details>
      )}

      <NuevaVisita abierta={nueva} onCerrar={() => setNueva(false)} onCrear={crear} tecnicos={tecnicos} />
    </section>
  );
}

function Columna({ titulo, tono, n, vacio, children }: { titulo: string; tono: string; n: number; vacio: string; children: React.ReactNode }) {
  return (
    <section className="kzp-col">
      <p className="mb-3 flex items-center gap-2 text-[15px] font-semibold">
        <span className="h-2 w-2 rounded-full" style={{ background: tono }} /> {titulo}
        <span className="font-medium text-muted-foreground">· {n}</span>
      </p>
      {n === 0 ? <p className="text-[13px] text-muted-foreground">{vacio}</p> : <ul className="space-y-2.5">{children}</ul>}
    </section>
  );
}

function Cabeza({ v }: { v: Visita }) {
  const wa = waDe(v.telefono);
  return (
    <div className="flex flex-wrap items-start justify-between gap-2 text-[13px]">
      <p className="flex items-start gap-1.5 text-muted-foreground">
        {v.tipo === 'local' ? <Store size={14} className="mt-0.5 shrink-0" /> : <MapPin size={14} className="mt-0.5 shrink-0" />}
        <span>{v.tipo === 'local' ? 'En el local' : [v.municipio, v.direccion].filter(Boolean).join(' · ')}{v.notas ? ` · ${v.notas}` : ''}</span>
      </p>
      {wa && <Button variant="outline" size="sm" asChild><a href={wa} target="_blank" rel="noreferrer"><MessageCircle /> {v.telefono}</a></Button>}
    </div>
  );
}

function Programar({ inicial, boton, nombre, onGuardar, onCancelar, onHecha }: {
  inicial: { fecha: string; hora: string }; boton: string; nombre: string;
  onGuardar: (fecha: string, hora: string) => void; onCancelar: () => void; onHecha?: () => void;
}) {
  const [fecha, setFecha] = useState(inicial.fecha);
  const [h, setH] = useState(inicial.hora);
  const cambio = fecha !== inicial.fecha || h !== inicial.hora;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <Input type="date" min={hoy()} value={fecha} onChange={(e) => setFecha(e.target.value)} className="h-9 w-auto" aria-label="Día" />
      <Input type="time" min="07:00" max="18:00" step={900} value={h} onChange={(e) => setH(e.target.value)} className="h-9 w-auto" aria-label="Hora" />
      <Button size="sm" disabled={!fecha || !h || (!!onHecha && !cambio)} onClick={() => onGuardar(fecha, h)}><CalendarCheck /> {boton}</Button>
      {onHecha && <Button size="sm" variant="outline" onClick={onHecha}><Check /> Hecha</Button>}
      <AlertDialog>
        <AlertDialogTrigger asChild><Button size="sm" variant="ghost" className="text-muted-foreground"><X /> Cancelar</Button></AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Cancelar la visita de {nombre}?</AlertDialogTitle><AlertDialogDescription>Al cliente no se le avisa: escribile vos por WhatsApp.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Volver</AlertDialogCancel><AlertDialogAction onClick={onCancelar}>Cancelar visita</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function NuevaVisita({ abierta, onCerrar, onCrear, tecnicos }: { abierta: boolean; onCerrar: () => void; onCrear: (d: VisitaNueva) => Promise<void>; tecnicos: string[] }) {
  const vacio: VisitaNueva = { nombre: '', telefono: '', servicio: 'Cámaras de seguridad', tipo: 'visita', municipio: '', direccion: '', fecha: '', hora: '', tecnico: null, notas: '', avisar: true };
  const [d, setD] = useState<VisitaNueva>(vacio);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (abierta) setD(vacio); }, [abierta]); // eslint-disable-line react-hooks/exhaustive-deps
  const listo = d.nombre.trim().length >= 2 && d.servicio.trim().length >= 2 && (d.tipo === 'local' || d.direccion.trim().length > 0);
  const confirmada = !!(d.fecha && d.hora);

  return (
    <Dialog open={abierta} onOpenChange={(ab) => !ab && onCerrar()}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Programar visita</DialogTitle>
          <DialogDescription>Una visita o cita que no vino del bot. Con día y hora queda confirmada y, si tiene WhatsApp, se le avisa al cliente.</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!listo) return;
            setBusy(true);
            await onCrear({ ...d, municipio: d.municipio || null, fecha: d.fecha || null, hora: d.hora || null, notas: d.notas || null });
            setBusy(false);
          }}
        >
          <div className="space-y-1.5"><Label htmlFor="nv-nombre">Cliente</Label><Input id="nv-nombre" value={d.nombre} onChange={(e) => setD({ ...d, nombre: e.target.value })} required autoComplete="off" /></div>
          <div className="space-y-1.5"><Label htmlFor="nv-tel">WhatsApp</Label><Input id="nv-tel" value={d.telefono} onChange={(e) => setD({ ...d, telefono: e.target.value })} inputMode="tel" type="tel" placeholder="9911-2034" /></div>
          <div className="space-y-1.5"><Label htmlFor="nv-serv">Servicio</Label><Input id="nv-serv" value={d.servicio} onChange={(e) => setD({ ...d, servicio: e.target.value })} list="nv-servicios" required /><datalist id="nv-servicios">{['Cámaras de seguridad', 'Instalación de cámaras', 'Cotización de cámaras', 'Demo de software', 'Reunión de página web', 'Reparación en el local', 'Mantenimiento'].map((x) => <option key={x} value={x} />)}</datalist></div>
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select value={d.tipo} onValueChange={(tipo) => setD({ ...d, tipo: tipo as Visita['tipo'] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="visita">Vamos al cliente</SelectItem><SelectItem value="local">Viene al local</SelectItem></SelectContent>
            </Select>
          </div>
          {d.tipo === 'visita' && (
            <>
              <div className="space-y-1.5"><Label htmlFor="nv-mun">Municipio</Label><Input id="nv-mun" value={d.municipio ?? ''} onChange={(e) => setD({ ...d, municipio: e.target.value })} placeholder="El Progreso" /></div>
              <div className="space-y-1.5"><Label htmlFor="nv-dir">Dirección</Label><Input id="nv-dir" value={d.direccion} onChange={(e) => setD({ ...d, direccion: e.target.value })} placeholder="Col. Palmira, 2 cuadras del parque" required /></div>
            </>
          )}
          <div className="space-y-1.5"><Label htmlFor="nv-fecha">Día</Label><Input id="nv-fecha" type="date" min={hoy()} value={d.fecha ?? ''} onChange={(e) => setD({ ...d, fecha: e.target.value })} /></div>
          <div className="space-y-1.5"><Label htmlFor="nv-hora">Hora</Label><Input id="nv-hora" type="time" min="07:00" max="18:00" step={900} value={d.hora ?? ''} onChange={(e) => setD({ ...d, hora: e.target.value })} /></div>
          <div className="space-y-1.5">
            <Label>Técnico</Label>
            <Select value={d.tecnico ?? '__'} onValueChange={(t) => setD({ ...d, tecnico: t === '__' ? null : t })}>
              <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
              <SelectContent><SelectItem value="__">Sin asignar</SelectItem>{tecnicos.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="nv-notas">Notas</Label><Textarea id="nv-notas" rows={2} value={d.notas ?? ''} onChange={(e) => setD({ ...d, notas: e.target.value })} placeholder="Qué llevar, qué cotizar, con quién hablar." /></div>
          {confirmada && d.telefono && (
            <label className="flex items-center gap-2 text-[13px] sm:col-span-2">
              <input type="checkbox" checked={d.avisar} onChange={(e) => setD({ ...d, avisar: e.target.checked })} className="accent-[var(--green)]" /> Avisarle al cliente por WhatsApp con día, hora y dirección
            </label>
          )}
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={onCerrar}>Cancelar</Button>
            <Button type="submit" disabled={!listo || busy}>{busy ? 'Guardando…' : confirmada ? 'Programar' : 'Guardar por confirmar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
