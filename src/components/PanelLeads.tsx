import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, FileText, Mail, MessageCircle, RefreshCw, Search, Trash2 } from 'lucide-react';
import { panelDeleteLead, panelLeads, panelUpdateLead, type Lead, type LeadEstado } from '@/lib/api';

/**
 * CRM del sitio: todo el que escribió, por formulario o por WhatsApp.
 *
 * El embudo es corto a propósito: Nuevo → Contactado → Cliente, o Perdido.
 * Más etapas son más clics que nadie va a hacer. Todo se filtra en el
 * navegador: son cientos de filas, no millones.
 */

const ESTADOS: { id: LeadEstado; label: string; color: string }[] = [
  { id: 'new', label: 'Nuevo', color: '#3b82f6' },
  { id: 'contacted', label: 'Contactado', color: '#e0a100' },
  { id: 'converted', label: 'Cliente', color: 'var(--green)' },
  { id: 'closed', label: 'Perdido', color: '#8a94a6' },
];
const estado = (id: LeadEstado) => ESTADOS.find((e) => e.id === id) ?? ESTADOS[0];

const SEMANA = 7 * 24 * 3600 * 1000;
const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
function hace(fecha: string): string {
  const s = (new Date(fecha).getTime() - Date.now()) / 1000;
  const tramos: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60],
  ];
  for (const [u, n] of tramos) if (Math.abs(s) >= n) return rtf.format(Math.round(s / n), u);
  return 'ahora';
}

const iniciales = (n: string) =>
  n.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('');

export function PanelLeads({ onConteo }: { onConteo: (n: number) => void }) {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<LeadEstado | 'todos'>('todos');
  const [filtroServicio, setFiltroServicio] = useState('todos');
  const [filtroCanal, setFiltroCanal] = useState<'todos' | 'form' | 'whatsapp'>('todos');
  const [q, setQ] = useState('');
  const [abierto, setAbierto] = useState<string | null>(null);

  const cargar = () => {
    setError(null);
    panelLeads()
      .then(setLeads)
      .catch((e) => setError(e instanceof Error ? e.message : 'No se pudieron cargar los leads'));
  };
  useEffect(cargar, []);

  const lista = leads ?? [];
  // El contador de la pestaña son los nuevos: lo que falta atender.
  useEffect(() => {
    if (leads) onConteo(leads.filter((l) => l.status === 'new').length);
  }, [leads, onConteo]);

  const porEstado = useMemo(() => {
    const m: Record<LeadEstado, number> = { new: 0, contacted: 0, converted: 0, closed: 0 };
    for (const l of lista) m[l.status]++;
    return m;
  }, [lista]);

  const servicios = useMemo(() => {
    const m = new Map<string, number>();
    for (const l of lista) m.set(l.service, (m.get(l.service) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [lista]);

  // Cuántas veces escribió cada correo: el que vuelve está caliente.
  const vecesPorCorreo = useMemo(() => {
    const m = new Map<string, number>();
    for (const l of lista) m.set(l.email, (m.get(l.email) ?? 0) + 1);
    return m;
  }, [lista]);

  const semana = lista.filter((l) => Date.now() - new Date(l.createdAt).getTime() < SEMANA).length;
  const decididos = porEstado.converted + porEstado.closed;
  const cierre = decididos ? Math.round((porEstado.converted / decididos) * 100) : null;

  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase();
    return lista.filter(
      (l) =>
        (filtroEstado === 'todos' || l.status === filtroEstado) &&
        (filtroServicio === 'todos' || l.service === filtroServicio) &&
        (filtroCanal === 'todos' || l.source === filtroCanal) &&
        (!t || `${l.name} ${l.email} ${l.service} ${l.company ?? ''} ${l.notes ?? ''}`.toLowerCase().includes(t)),
    );
  }, [lista, filtroEstado, filtroServicio, filtroCanal, q]);

  async function cambiar(id: string, cambios: { status?: LeadEstado; notes?: string }) {
    const antes = leads;
    setLeads((ls) => ls?.map((l) => (l.id === id ? { ...l, ...cambios } : l)) ?? null);
    try {
      await panelUpdateLead(id, cambios);
    } catch (e) {
      setLeads(antes);
      setError(e instanceof Error ? e.message : 'No se pudo guardar');
    }
  }

  async function borrar(l: Lead) {
    if (!confirm(`¿Borrar a ${l.name}? Usalo solo para spam: un lead real se marca "Perdido".`)) return;
    try {
      await panelDeleteLead(l.id);
      setLeads((ls) => ls?.filter((x) => x.id !== l.id) ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo borrar');
    }
  }

  if (!leads && !error) {
    return (
      <p className="kz-eyebrow flex items-center gap-2">
        <span className="kz-latido" />
        cargando leads
      </p>
    );
  }

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight">Leads y clientes</h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>
            Todo el que escribió desde el sitio: formulario y WhatsApp.
          </p>
        </div>
        <button onClick={cargar} className="kz-btn kz-btn-secundario">
          <RefreshCw size={15} />
          Actualizar
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-5 rounded-lg border px-3 py-2.5 text-sm"
          style={{ borderColor: 'rgba(255,107,107,0.4)', background: 'rgba(255,107,107,0.08)', color: '#ff8f8f' }}
        >
          {error}
        </p>
      )}

      {/* ── Números ── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Tarjeta titulo="Total" valor={lista.length} nota={`+${semana} esta semana`} activa={filtroEstado === 'todos'} onClick={() => setFiltroEstado('todos')} />
        {ESTADOS.map((e) => (
          <Tarjeta
            key={e.id}
            titulo={e.label === 'Cliente' ? 'Clientes' : `${e.label}s`}
            valor={porEstado[e.id]}
            color={e.color}
            nota={e.id === 'converted' && cierre !== null ? `${cierre}% de cierre` : undefined}
            activa={filtroEstado === e.id}
            onClick={() => setFiltroEstado(filtroEstado === e.id ? 'todos' : e.id)}
          />
        ))}
      </div>

      {/* ── Qué piden ── */}
      {servicios.length > 0 && (
        <div className="kz-card mt-4 p-5">
          <p className="kz-eyebrow">// qué están pidiendo</p>
          <ul className="mt-4 grid gap-x-8 gap-y-2.5 md:grid-cols-2">
            {servicios.slice(0, 8).map(([s, n]) => (
              <li key={s}>
                <button
                  onClick={() => setFiltroServicio(filtroServicio === s ? 'todos' : s)}
                  className="group w-full text-left"
                  aria-pressed={filtroServicio === s}
                >
                  <span className="flex justify-between text-[13px]">
                    <span className="truncate font-medium" style={{ color: filtroServicio === s ? 'var(--color-accent)' : undefined }}>
                      {s}
                    </span>
                    <span className="font-mono" style={{ color: 'var(--color-muted)' }}>{n}</span>
                  </span>
                  <span className="mt-1 block h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--color-bg-2)' }}>
                    <span
                      className="block h-full rounded-full transition-all group-hover:opacity-80"
                      style={{ width: `${(n / servicios[0]![1]) * 100}%`, background: 'var(--color-accent)' }}
                    />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Filtros ── */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <label className="relative min-w-[220px] flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-muted-2)' }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar nombre, correo, servicio, nota…"
            className="w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--color-accent)]"
            style={{ background: 'var(--color-bg-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          />
        </label>
        {(['todos', 'whatsapp', 'form'] as const).map((c) => (
          <button
            key={c}
            onClick={() => setFiltroCanal(c)}
            className={`kz-tab inline-flex items-center gap-1.5 ${filtroCanal === c ? 'kz-tab-activa' : ''}`}
          >
            {c === 'whatsapp' && <MessageCircle size={14} />}
            {c === 'form' && <FileText size={14} />}
            {c === 'todos' ? 'Todos' : c === 'whatsapp' ? 'WhatsApp' : 'Formulario'}
          </button>
        ))}
        {filtroServicio !== 'todos' && (
          <button onClick={() => setFiltroServicio('todos')} className="kz-tab kz-tab-activa">
            {filtroServicio} ✕
          </button>
        )}
      </div>

      {/* ── Lista ── */}
      {visibles.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed p-10 text-center" style={{ borderColor: 'var(--color-border)' }}>
          <p className="kz-eyebrow">// vacío</p>
          <p className="mt-3 text-lg font-bold">{lista.length ? 'Nada con esos filtros' : 'Todavía no escribe nadie'}</p>
          <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: 'var(--color-muted)' }}>
            {lista.length
              ? 'Probá quitar algún filtro.'
              : 'Cuando alguien llene el formulario o toque WhatsApp en el sitio, aparece acá.'}
          </p>
        </div>
      ) : (
        <ul className="mt-5 space-y-2.5">
          {visibles.map((l) => (
            <FilaLead
              key={l.id}
              lead={l}
              veces={vecesPorCorreo.get(l.email) ?? 1}
              abierto={abierto === l.id}
              onAbrir={() => setAbierto(abierto === l.id ? null : l.id)}
              onCambiar={(c) => cambiar(l.id, c)}
              onBorrar={() => borrar(l)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function Tarjeta({
  titulo,
  valor,
  nota,
  color,
  activa,
  onClick,
}: {
  titulo: string;
  valor: number;
  nota?: string;
  color?: string;
  activa: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={activa}
      className="kz-card p-4 text-left transition-transform hover:-translate-y-0.5"
      style={activa ? { borderColor: color ?? 'var(--color-accent)' } : undefined}
    >
      <span className="flex items-center gap-2 text-[12.5px] font-medium" style={{ color: 'var(--color-muted)' }}>
        {color && <span className="h-2 w-2 rounded-full" style={{ background: color }} />}
        {titulo}
      </span>
      <span className="mt-1.5 block text-3xl font-black tracking-tight">{valor}</span>
      {nota && (
        <span className="mt-0.5 block text-[11.5px]" style={{ color: 'var(--color-muted-2)' }}>
          {nota}
        </span>
      )}
    </button>
  );
}

function FilaLead({
  lead: l,
  veces,
  abierto,
  onAbrir,
  onCambiar,
  onBorrar,
}: {
  lead: Lead;
  veces: number;
  abierto: boolean;
  onAbrir: () => void;
  onCambiar: (c: { status?: LeadEstado; notes?: string }) => void;
  onBorrar: () => void;
}) {
  const e = estado(l.status);
  const [nota, setNota] = useState(l.notes ?? '');
  useEffect(() => setNota(l.notes ?? ''), [l.notes]);

  const asunto = encodeURIComponent(`Kizercode — ${l.service}`);

  return (
    <li className="kz-card overflow-hidden" style={{ borderLeft: `3px solid ${e.color}` }}>
      <div className="flex flex-wrap items-center gap-4 p-4">
        <button onClick={onAbrir} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-expanded={abierto}>
          <span
            aria-hidden="true"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-bold"
            style={{ background: `color-mix(in srgb, ${e.color} 16%, transparent)`, color: e.color }}
          >
            {iniciales(l.name)}
          </span>
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-2 font-semibold">
              {l.name}
              {veces > 1 && (
                <span className="rounded-full px-2 py-0.5 text-[10.5px] font-semibold" style={{ background: 'rgba(224,161,0,0.15)', color: '#c48a00' }}>
                  volvió {veces}×
                </span>
              )}
            </span>
            <span className="block truncate text-[13px]" style={{ color: 'var(--color-muted)' }}>
              {l.email}
            </span>
          </span>
        </button>

        <span className="flex flex-wrap items-center gap-2">
          <span
            className="rounded-full px-2.5 py-1 text-[12px] font-medium"
            style={{ background: 'var(--color-bg-2)', color: 'var(--color-text)' }}
          >
            {l.service}
          </span>
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-medium"
            style={
              l.source === 'whatsapp'
                ? { background: 'color-mix(in srgb, var(--green) 14%, transparent)', color: 'var(--green2)' }
                : { background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }
            }
          >
            {l.source === 'whatsapp' ? <MessageCircle size={12} /> : <FileText size={12} />}
            {l.source === 'whatsapp' ? 'WhatsApp' : 'Formulario'}
          </span>
        </span>

        <span className="w-24 text-right text-[12px]" style={{ color: 'var(--color-muted-2)' }} title={new Date(l.createdAt).toLocaleString('es-HN')}>
          {hace(l.createdAt)}
        </span>

        <label className="relative">
          <span className="sr-only">Estado</span>
          <select
            value={l.status}
            onChange={(ev) => onCambiar({ status: ev.target.value as LeadEstado })}
            className="appearance-none rounded-full border py-1.5 pl-3 pr-8 text-[13px] font-semibold outline-none"
            style={{ borderColor: e.color, color: e.color, background: `color-mix(in srgb, ${e.color} 10%, var(--color-bg))` }}
          >
            {ESTADOS.map((x) => (
              <option key={x.id} value={x.id}>
                {x.label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" style={{ color: e.color }} />
        </label>
      </div>

      {abierto && (
        <div className="grid gap-5 border-t p-5 md:grid-cols-2" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-2)' }}>
          <div className="space-y-3 text-sm">
            <p className="kz-eyebrow">// lo que dijo</p>
            <p className="whitespace-pre-wrap leading-relaxed">{l.message}</p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[13px]" style={{ color: 'var(--color-muted)' }}>
              {l.company && (<><dt>Empresa</dt><dd style={{ color: 'var(--color-text)' }}>{l.company}</dd></>)}
              {l.budget && (<><dt>Presupuesto</dt><dd style={{ color: 'var(--color-text)' }}>{l.budget}</dd></>)}
              {l.page && (<><dt>Página</dt><dd className="truncate" style={{ color: 'var(--color-text)' }}>{l.page}</dd></>)}
              {l.projectSlug && (<><dt>Proyecto</dt><dd style={{ color: 'var(--color-text)' }}>{l.projectSlug}</dd></>)}
              <dt>Fecha</dt>
              <dd style={{ color: 'var(--color-text)' }}>{new Date(l.createdAt).toLocaleString('es-HN')}</dd>
            </dl>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm">
              <span className="kz-eyebrow">// notas internas</span>
              <textarea
                value={nota}
                onChange={(ev) => setNota(ev.target.value)}
                onBlur={() => nota !== (l.notes ?? '') && onCambiar({ notes: nota })}
                rows={4}
                placeholder="Ej: le mandé cotización de 8 cámaras, llamar el lunes."
                className="mt-2 w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
                style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <a href={`mailto:${l.email}?subject=${asunto}`} className="kz-btn kz-btn-primario">
                <Mail size={15} />
                Responder
              </a>
              <button onClick={onBorrar} className="kz-btn kz-btn-secundario" style={{ color: '#ff6b6b' }}>
                <Trash2 size={15} />
                Es spam
              </button>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
