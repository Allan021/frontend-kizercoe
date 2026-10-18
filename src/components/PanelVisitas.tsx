import { useEffect, useMemo, useState } from 'react';
import { CalendarCheck, Check, MapPin, MessageCircle, RefreshCw, Store, X } from 'lucide-react';
import { panelUpdateVisita, panelVisitas, waDe, type Visita, type VisitaEstado } from '@/lib/api';

/**
 * Las visitas que pide la gente por WhatsApp. El bot no fija el día: las deja
 * acá y el equipo las confirma según su capacidad y su ruta. Por eso al lado
 * de cada solicitud se ve si ya vamos para ese municipio: una instalación en
 * Choloma el jueves es la excusa para pasar a cotizar a la vecina.
 *
 * Confirmar le manda el WhatsApp al cliente con día, hora y dirección.
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
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const cargar = () => {
    setError(null);
    panelVisitas()
      .then(setLista)
      .catch((e) => setError(e instanceof Error ? e.message : 'No se pudieron cargar las visitas'));
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
  const historial = todas.filter((v) => v.estado === 'realizada' || v.estado === 'cancelada').slice(0, 30);

  useEffect(() => {
    if (lista) onConteo(pendientes.length);
  }, [lista, pendientes.length, onConteo]);

  async function cambiar(v: Visita, c: { fecha?: string; hora?: string; estado?: VisitaEstado }) {
    setError(null);
    setAviso(null);
    try {
      const r = await panelUpdateVisita(v.id, c);
      setLista((l) => (l ?? []).map((x) => (x.id === v.id ? r.visita : x)));
      if (r.whatsapp) {
        setAviso(
          r.whatsapp.ok
            ? `Confirmada. A ${v.nombre} le llegó el WhatsApp.`
            : `Confirmada, pero el WhatsApp no salió (${r.whatsapp.error ?? 'error'}). Escribile vos.`,
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar');
    }
  }

  return (
    <section>
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
          El bot deja las solicitudes; vos ponés el día según la ruta y al cliente le llega la confirmación.
        </p>
        <button onClick={cargar} className="kz-tab inline-flex items-center gap-1.5" aria-label="Recargar">
          <RefreshCw size={14} /> Recargar
        </button>
      </div>

      {error && <Mensaje tono="error">{error}</Mensaje>}
      {aviso && <Mensaje tono="ok">{aviso}</Mensaje>}

      {/* ── Por confirmar ── */}
      <p className="kz-eyebrow">// por confirmar · {pendientes.length}</p>
      {pendientes.length === 0 ? (
        <p className="mt-3 text-sm" style={{ color: 'var(--color-muted-2)' }}>
          {lista ? 'Nada pendiente.' : 'Cargando…'}
        </p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {pendientes.map((v) => {
            // Si ya vamos para ese municipio, se dice: es la ruta que conviene.
            const cerca = agenda.filter(([, vs]) => vs.some((x) => mismoLugar(x.municipio, v.municipio))).map(([f]) => f);
            return (
              <li key={v.id} className="kz-card p-4">
                <Cabeza v={v} />
                {v.preferencia && (
                  <p className="mt-2 text-[13px]">
                    <span style={{ color: 'var(--color-muted)' }}>Le queda bien: </span>
                    {v.preferencia}
                  </p>
                )}
                {cerca.length > 0 && (
                  <p className="mt-2 text-[13px] font-medium" style={{ color: 'var(--green2)' }}>
                    Ya vas por {v.municipio}: {cerca.map(dia).join(', ')}
                  </p>
                )}
                <Programar
                  inicial={{ fecha: cerca[0] ?? '', hora: '' }}
                  boton="Confirmar y avisar"
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
        <p className="mt-3 text-sm" style={{ color: 'var(--color-muted-2)' }}>Sin visitas confirmadas.</p>
      ) : (
        <div className="mt-3 space-y-5">
          {agenda.map(([f, vs]) => (
            <div key={f}>
              <p className="flex flex-wrap items-baseline gap-x-3 text-sm font-bold capitalize">
                {dia(f)}
                <span className="text-[12px] font-normal normal-case" style={{ color: 'var(--color-muted)' }}>
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
                        onGuardar={(nf, nh) => cambiar(v, { fecha: nf, hora: nh })}
                        onCancelar={() => cambiar(v, { estado: 'cancelada' })}
                        onHecha={() => cambiar(v, { estado: 'realizada' })}
                      />
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {historial.length > 0 && (
        <details className="mt-10">
          <summary className="kz-eyebrow cursor-pointer">// historial · {historial.length}</summary>
          <ul className="mt-3 space-y-1.5 text-[13px]" style={{ color: 'var(--color-muted)' }}>
            {historial.map((v) => (
              <li key={v.id}>
                {v.estado === 'realizada' ? '✓' : '✕'} {v.nombre} · {v.municipio ?? 'local'} · {v.fecha ? dia(v.fecha) : 'sin fecha'}
              </li>
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
        <p className="font-bold">
          {hora && <span className="mr-2 font-mono" style={{ color: 'var(--color-accent)' }}>{hora}</span>}
          {v.nombre}
          <span className="ml-2 text-[12.5px] font-normal" style={{ color: 'var(--color-muted)' }}>{v.servicio}</span>
        </p>
        <p className="mt-1 flex items-start gap-1.5 text-[13px]" style={{ color: 'var(--color-muted)' }}>
          {v.tipo === 'local' ? <Store size={14} className="mt-0.5 shrink-0" /> : <MapPin size={14} className="mt-0.5 shrink-0" />}
          <span>
            {v.tipo === 'local' ? 'En el local' : [v.municipio, v.direccion].filter(Boolean).join(' · ')}
          </span>
        </p>
        {v.notas && <p className="mt-1.5 whitespace-pre-line text-[13px]">{v.notas}</p>}
      </div>
      {wa && (
        <a href={wa} target="_blank" rel="noreferrer" className="kz-tab inline-flex shrink-0 items-center gap-1.5">
          <MessageCircle size={14} /> {v.telefono}
        </a>
      )}
    </div>
  );
}

function Programar({
  inicial,
  boton,
  onGuardar,
  onCancelar,
  onHecha,
}: {
  inicial: { fecha: string; hora: string };
  boton: string;
  onGuardar: (fecha: string, hora: string) => void;
  onCancelar: () => void;
  onHecha?: () => void;
}) {
  const [fecha, setFecha] = useState(inicial.fecha);
  const [h, setH] = useState(inicial.hora);
  const cambio = fecha !== inicial.fecha || h !== inicial.hora;
  const campo = 'rounded-lg border px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-accent)]';
  const estilo = { background: 'var(--color-bg-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' };

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <input type="date" min={hoy()} value={fecha} onChange={(e) => setFecha(e.target.value)} className={campo} style={estilo} aria-label="Día" />
      <input type="time" min="07:00" max="18:00" step={900} value={h} onChange={(e) => setH(e.target.value)} className={campo} style={estilo} aria-label="Hora" />
      <button
        disabled={!fecha || !h || (!!onHecha && !cambio)}
        onClick={() => onGuardar(fecha, h)}
        className="kz-btn kz-btn-primario inline-flex items-center gap-1.5 px-3 py-1.5 text-sm disabled:opacity-40"
      >
        <CalendarCheck size={14} /> {boton}
      </button>
      {onHecha && (
        <button onClick={onHecha} className="kz-tab inline-flex items-center gap-1.5">
          <Check size={14} /> Hecha
        </button>
      )}
      <button
        onClick={() => confirm('¿Cancelar esta visita? Al cliente no se le avisa: escribile vos.') && onCancelar()}
        className="kz-tab inline-flex items-center gap-1.5"
      >
        <X size={14} /> Cancelar
      </button>
    </div>
  );
}

function Mensaje({ tono, children }: { tono: 'ok' | 'error'; children: string }) {
  const estilo =
    tono === 'error'
      ? { borderColor: 'rgba(255,107,107,0.4)', background: 'rgba(255,107,107,0.08)', color: '#ff8f8f' }
      : { borderColor: 'color-mix(in srgb, var(--green) 40%, transparent)', background: 'color-mix(in srgb, var(--green) 10%, transparent)', color: 'var(--green2)' };
  return (
    <p role="status" className="mb-4 rounded-lg border px-4 py-3 text-sm" style={estilo}>
      {children}
    </p>
  );
}
