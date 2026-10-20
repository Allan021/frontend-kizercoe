import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Copy, ExternalLink, FileText, Kanban, List, Mail, MessageCircle, RefreshCw, Search, Sparkles, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { panelAsistente, panelDeleteLead, panelLeads, panelUpdateLead, waDe, type Lead, type LeadEstado } from '@/lib/api';
import { CATEGORIAS, categoriaDe, type Categoria } from '@/lib/categorias';

/**
 * CRM del sitio: todo el que escribió, por formulario o por WhatsApp, y quien
 * dejó sus datos antes de abrir la demo de un producto.
 *
 * El embudo es corto a propósito: Nuevo → Contactado → Cliente, o Perdido.
 * Más etapas son más clics que nadie va a hacer. Se ve como lista o como
 * tablero (arrastrar entre columnas cambia el estado), y cada lead lleva su
 * categoría de servicio: cámaras, reparación, software, marketing, productos.
 * Todo se filtra en el navegador: son cientos de filas, no millones.
 */

const ESTADOS: { id: LeadEstado; label: string; color: string }[] = [
  { id: 'new', label: 'Nuevo', color: '#3b82f6' },
  { id: 'contacted', label: 'Contactado', color: '#e0a100' },
  { id: 'converted', label: 'Cliente', color: 'var(--green)' },
  { id: 'closed', label: 'Perdido', color: '#8a94a6' },
];
const estado = (id: LeadEstado) => ESTADOS.find((e) => e.id === id) ?? ESTADOS[0]!;

/** Por dónde entró cada lead: etiqueta, ícono y color de su insignia. */
const FUENTE: Record<Lead['source'], { label: string; Icono: typeof FileText; estilo: CSSProperties }> = {
  whatsapp: { label: 'WhatsApp', Icono: MessageCircle, estilo: { background: 'color-mix(in srgb, var(--green) 14%, transparent)', color: 'var(--green2)' } },
  form: { label: 'Formulario', Icono: FileText, estilo: { background: 'rgba(59,130,246,0.12)', color: '#3b82f6' } },
  demo: { label: 'Demo', Icono: ExternalLink, estilo: { background: 'rgba(139,92,246,0.14)', color: '#8b5cf6' } },
};
const fuente = (s: Lead['source']) => FUENTE[s] ?? FUENTE.form;

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

type Vista = 'lista' | 'tablero';

export function PanelLeads({ onConteo, busqueda }: { onConteo: (n: number) => void; busqueda?: string }) {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [vista, setVista] = useState<Vista>('lista');
  const [filtroEstado, setFiltroEstado] = useState<LeadEstado | 'todos'>('todos');
  const [filtroCategoria, setFiltroCategoria] = useState<Categoria | 'todas'>('todas');
  const [filtroCanal, setFiltroCanal] = useState<'todos' | Lead['source']>('todos');
  const [q, setQ] = useState('');
  const [abierto, setAbierto] = useState<string | null>(null);

  // La paleta de búsqueda (Ctrl K) manda acá el nombre del lead elegido.
  useEffect(() => {
    if (busqueda !== undefined) {
      setQ(busqueda);
      setVista('lista');
    }
  }, [busqueda]);

  const cargar = () => {
    panelLeads()
      .then(setLeads)
      .catch((e) => toast.error(e instanceof Error ? e.message : 'No se pudieron cargar los leads'));
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

  const porCategoria = useMemo(() => {
    const m = new Map<Categoria, number>();
    for (const l of lista) {
      const c = categoriaDe(l.service);
      m.set(c, (m.get(c) ?? 0) + 1);
    }
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
        (filtroCategoria === 'todas' || categoriaDe(l.service) === filtroCategoria) &&
        (filtroCanal === 'todos' || l.source === filtroCanal) &&
        (!t || `${l.name} ${l.email} ${l.service} ${l.company ?? ''} ${l.phone ?? ''} ${l.phone?.replace(/\D/g, '') ?? ''} ${l.notes ?? ''}`.toLowerCase().includes(t)),
    );
  }, [lista, filtroEstado, filtroCategoria, filtroCanal, q]);

  async function cambiar(id: string, cambios: { status?: LeadEstado; notes?: string }) {
    const antes = leads;
    setLeads((ls) => ls?.map((l) => (l.id === id ? { ...l, ...cambios } : l)) ?? null);
    try {
      await panelUpdateLead(id, cambios);
      if (cambios.status) toast.success(`Marcado como ${estado(cambios.status).label.toLowerCase()}.`);
    } catch (e) {
      setLeads(antes);
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar');
    }
  }

  async function borrar(l: Lead) {
    try {
      await panelDeleteLead(l.id);
      setLeads((ls) => ls?.filter((x) => x.id !== l.id) ?? null);
      toast.success(`${l.name} borrado.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo borrar');
    }
  }

  if (!leads) {
    return (
      <section>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">{Array.from({ length: 5 }, (_, i) => <div key={i} className="kzp-esqueleto h-[108px]" />)}</div>
        <div className="kzp-esqueleto mt-4 h-40" />
      </section>
    );
  }

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="kzp-titulo">Leads y clientes</h2>
          <p className="kzp-sub">Todo el que escribió desde el sitio: formulario, WhatsApp y demos de productos.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl border border-border bg-muted p-1" role="group" aria-label="Vista">
            {(
              [
                ['lista', 'Lista', List],
                ['tablero', 'Tablero', Kanban],
              ] as const
            ).map(([v, l, Icono]) => (
              <button
                key={v}
                onClick={() => setVista(v)}
                aria-pressed={vista === v}
                className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium transition-colors ${vista === v ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
              >
                <Icono size={14} /> {l}
              </button>
            ))}
          </div>
          <Button variant="outline" onClick={cargar}><RefreshCw /> Actualizar</Button>
        </div>
      </div>

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

      {/* ── Por servicio ── */}
      {porCategoria.length > 0 && (
        <div className="kz-card mt-4 p-5">
          <p className="kz-eyebrow">// por servicio</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setFiltroCategoria('todas')}
              aria-pressed={filtroCategoria === 'todas'}
              className={`kzp-chip !px-3 !py-1.5 !text-[12.5px] transition-transform hover:-translate-y-px ${filtroCategoria === 'todas' ? 'ring-2 ring-ring/40' : ''}`}
              style={{ '--kzp-tono': 'var(--navy)' } as CSSProperties}
            >
              Todas · {lista.length}
            </button>
            {porCategoria.map(([c, n]) => {
              const cat = CATEGORIAS[c];
              return (
                <button
                  key={c}
                  onClick={() => setFiltroCategoria(filtroCategoria === c ? 'todas' : c)}
                  aria-pressed={filtroCategoria === c}
                  className={`kzp-chip !px-3 !py-1.5 !text-[12.5px] transition-transform hover:-translate-y-px ${filtroCategoria === c ? 'ring-2 ring-ring/40' : ''}`}
                  style={{ '--kzp-tono': cat.color } as CSSProperties}
                >
                  <cat.Icono size={13} /> {cat.nombre} · {n}
                </button>
              );
            })}
          </div>
          <ul className="mt-4 grid gap-x-8 gap-y-2.5 md:grid-cols-2">
            {porCategoria.map(([c, n]) => {
              const cat = CATEGORIAS[c];
              const cerrados = lista.filter((l) => categoriaDe(l.service) === c && l.status === 'converted').length;
              return (
                <li key={c}>
                  <span className="flex justify-between text-[13px]">
                    <span className="font-medium">{cat.nombre}</span>
                    <span className="font-mono text-muted-foreground">{cerrados} cliente{cerrados === 1 ? '' : 's'} de {n}</span>
                  </span>
                  <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-muted">
                    <span className="block h-full rounded-full" style={{ width: `${(n / porCategoria[0]![1]) * 100}%`, background: cat.color }} />
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ── Filtros ── */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <label className="relative min-w-[220px] flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground" />
          <Input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar nombre, correo, servicio, nota…" className="pl-9" aria-label="Buscar leads" />
        </label>
        {(['todos', 'whatsapp', 'form', 'demo'] as const).map((c) => {
          const f = c === 'todos' ? null : fuente(c);
          return (
            <button key={c} onClick={() => setFiltroCanal(c)} aria-pressed={filtroCanal === c} className={`kz-tab inline-flex items-center gap-1.5 ${filtroCanal === c ? 'kz-tab-activa' : ''}`}>
              {f && <f.Icono size={14} />}
              {f ? f.label : 'Todos'}
            </button>
          );
        })}
        {filtroCategoria !== 'todas' && (
          <button onClick={() => setFiltroCategoria('todas')} className="kz-tab kz-tab-activa inline-flex items-center gap-1.5">
            {CATEGORIAS[filtroCategoria].nombre} <X size={14} aria-label="Quitar filtro" />
          </button>
        )}
      </div>

      {/* ── Lista o tablero ── */}
      {visibles.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="kz-eyebrow">// vacío</p>
          <p className="mt-3 text-lg font-bold">{lista.length ? 'Nada con esos filtros' : 'Todavía no escribe nadie'}</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {lista.length ? 'Probá quitar algún filtro.' : 'Cuando alguien llene el formulario, toque WhatsApp o abra una demo en el sitio, aparece acá.'}
          </p>
        </div>
      ) : vista === 'tablero' ? (
        <Tablero leads={visibles} onMover={(id, status) => cambiar(id, { status })} onAbrir={(id) => { setAbierto(id); setVista('lista'); setQ(''); }} />
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

function Tarjeta({ titulo, valor, nota, color, activa, onClick }: { titulo: string; valor: number; nota?: string; color?: string; activa: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-pressed={activa} className="kzp-kpi" style={{ '--kzp-tono': color ?? 'var(--green)', ...(activa ? { borderColor: color ?? 'var(--green)' } : {}) } as CSSProperties}>
      <span className="kzp-kpi-titulo">
        {color && <span className="h-2 w-2 rounded-full" style={{ background: color }} />}
        {titulo}
      </span>
      <span className="kzp-kpi-valor">{valor}</span>
      {nota && <span className="kzp-kpi-nota">{nota}</span>}
    </button>
  );
}

/** Tablero: una columna por estado; arrastrar una tarjeta a otra columna cambia el estado. */
function Tablero({ leads, onMover, onAbrir }: { leads: Lead[]; onMover: (id: string, status: LeadEstado) => void; onAbrir: (id: string) => void }) {
  const [sobre, setSobre] = useState<LeadEstado | null>(null);
  return (
    <div className="-mx-4 mt-5 overflow-x-auto px-4 pb-2 lg:mx-0 lg:px-0">
      <div className="grid min-w-[880px] grid-cols-4 gap-3">
        {ESTADOS.map((e) => {
          const col = leads.filter((l) => l.status === e.id);
          return (
            <div
              key={e.id}
              onDragOver={(ev) => { ev.preventDefault(); setSobre(e.id); }}
              onDragLeave={() => setSobre(null)}
              onDrop={(ev) => {
                ev.preventDefault();
                setSobre(null);
                const id = ev.dataTransfer.getData('text/lead');
                const l = leads.find((x) => x.id === id);
                if (l && l.status !== e.id) onMover(id, e.id);
              }}
              className={`flex min-h-[320px] flex-col rounded-2xl border p-2.5 transition-colors ${sobre === e.id ? 'border-ring bg-accent/50' : 'border-border bg-muted/50'}`}
            >
              <p className="flex items-center gap-2 px-1.5 py-1 text-[13px] font-bold">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: e.color }} />
                {e.label}
                <span className="ml-auto font-mono text-[12px] font-normal text-muted-foreground">{col.length}</span>
              </p>
              <ul className="mt-1 flex flex-1 flex-col gap-2">
                {col.map((l) => {
                  const cat = CATEGORIAS[categoriaDe(l.service)];
                  return (
                    <li
                      key={l.id}
                      draggable
                      onDragStart={(ev) => { ev.dataTransfer.setData('text/lead', l.id); ev.dataTransfer.effectAllowed = 'move'; }}
                      className="kz-card cursor-grab p-3 active:cursor-grabbing"
                    >
                      <button onClick={() => onAbrir(l.id)} className="w-full text-left">
                        <span className="flex items-start justify-between gap-2">
                          <span className="min-w-0 truncate text-[13.5px] font-semibold">{l.name}</span>
                          <span className="shrink-0 text-[11px] text-muted-foreground">{hace(l.createdAt)}</span>
                        </span>
                        <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <span className="kzp-chip !px-2 !py-0.5 !text-[11px]" style={{ '--kzp-tono': cat.color } as CSSProperties}>
                            <cat.Icono size={11} /> {cat.nombre}
                          </span>
                          <span className="truncate text-[11.5px] text-muted-foreground">{l.service}</span>
                        </span>
                        <span className="mt-2 line-clamp-2 block text-[12.5px] text-muted-foreground">{l.message}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FilaLead({ lead: l, veces, abierto, onAbrir, onCambiar, onBorrar }: {
  lead: Lead;
  veces: number;
  abierto: boolean;
  onAbrir: () => void;
  onCambiar: (c: { status?: LeadEstado; notes?: string }) => void;
  onBorrar: () => void;
}) {
  const e = estado(l.status);
  const cat = CATEGORIAS[categoriaDe(l.service)];
  const [nota, setNota] = useState(l.notes ?? '');
  useEffect(() => setNota(l.notes ?? ''), [l.notes]);

  const asunto = encodeURIComponent(`Kizercode — ${l.service}`);

  return (
    <li className="kz-card overflow-hidden" style={{ borderLeft: `3px solid ${e.color}` }}>
      <div className="flex flex-wrap items-center gap-4 p-4">
        <button onClick={onAbrir} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-expanded={abierto}>
          <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-bold" style={{ background: `color-mix(in srgb, ${e.color} 16%, transparent)`, color: e.color }}>
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
            <span className="block truncate text-[13px] text-muted-foreground">{l.email}</span>
          </span>
        </button>

        <span className="flex flex-wrap items-center gap-2">
          <span className="kzp-chip" style={{ '--kzp-tono': cat.color } as CSSProperties}>
            <cat.Icono size={12} /> {cat.nombre}
          </span>
          <Badge variant="secondary" className="font-medium">{l.service}</Badge>
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-medium" style={fuente(l.source).estilo}>
            {(() => {
              const { Icono, label } = fuente(l.source);
              return (<><Icono size={12} />{label}</>);
            })()}
          </span>
        </span>

        <span className="w-24 text-right text-[12px] text-muted-foreground" title={new Date(l.createdAt).toLocaleString('es-HN')}>
          {hace(l.createdAt)}
        </span>

        <Select value={l.status} onValueChange={(v) => onCambiar({ status: v as LeadEstado })}>
          <SelectTrigger
            aria-label="Estado"
            className="h-9 w-auto rounded-full border bg-background text-[13px] font-semibold"
            style={{ borderColor: e.color, color: e.color, background: `color-mix(in srgb, ${e.color} 10%, var(--bg))` }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {ESTADOS.map((x) => (
              <SelectItem key={x.id} value={x.id}>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: x.color }} /> {x.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {abierto && (
        <div className="grid gap-5 border-t border-border bg-muted/60 p-5 md:grid-cols-2">
          <div className="space-y-3 text-sm">
            <p className="kz-eyebrow">// lo que dijo</p>
            <p className="whitespace-pre-wrap leading-relaxed">{l.message}</p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
              {l.phone && (<><dt>Teléfono</dt><dd className="text-foreground"><a href={`tel:${l.phone.replace(/[^\d+]/g, '')}`}>{l.phone}</a></dd></>)}
              {l.company && (<><dt>Empresa</dt><dd className="text-foreground">{l.company}</dd></>)}
              {l.budget && (<><dt>Presupuesto</dt><dd className="text-foreground">{l.budget}</dd></>)}
              {l.page && (<><dt>Página</dt><dd className="truncate text-foreground">{l.page}</dd></>)}
              {l.projectSlug && (<><dt>Proyecto</dt><dd className="text-foreground">{l.projectSlug}</dd></>)}
              <dt>Fecha</dt>
              <dd className="text-foreground">{new Date(l.createdAt).toLocaleString('es-HN')}</dd>
            </dl>
            <Redactar lead={l} />
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm">
              <span className="kz-eyebrow">// notas internas</span>
              <Textarea
                value={nota}
                onChange={(ev) => setNota(ev.target.value)}
                onBlur={() => nota !== (l.notes ?? '') && onCambiar({ notes: nota })}
                rows={4}
                placeholder="Ej: le mandé cotización de 8 cámaras, llamar el lunes."
                className="mt-2 bg-background"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <a href={`mailto:${l.email}?subject=${asunto}`}><Mail /> Responder</a>
              </Button>
              {l.phone && waDe(l.phone) && (
                <Button variant="outline" asChild>
                  <a href={waDe(l.phone)!} target="_blank" rel="noopener noreferrer"><MessageCircle /> WhatsApp</a>
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" className="text-destructive hover:text-destructive"><Trash2 /> Es spam</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Borrar a {l.name}?</AlertDialogTitle>
                    <AlertDialogDescription>Usalo solo para spam: un lead real se marca "Perdido" y queda en el historial.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={onBorrar} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Borrar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

/** La IA redacta la respuesta al lead con lo que dijo y el servicio; vos la revisás y la mandás. */
function Redactar({ lead: l }: { lead: Lead }) {
  const [borrador, setBorrador] = useState<string | null>(null);
  const [pensando, setPensando] = useState(false);

  async function redactar() {
    setPensando(true);
    try {
      const r = await panelAsistente([
        {
          rol: 'user',
          texto:
            `Redactá la respuesta por WhatsApp para este lead, lista para enviar. Solo el mensaje, sin explicaciones.\n` +
            `Nombre: ${l.name}\nServicio: ${l.service}\nEntró por: ${l.source}\nLo que dijo: ${l.message}` +
            (l.notes ? `\nNotas internas: ${l.notes}` : ''),
        },
      ]);
      setBorrador(r.respuesta.trim());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo redactar');
    } finally {
      setPensando(false);
    }
  }

  const wa = l.phone ? waDe(l.phone) : null;
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-accent-foreground"><Sparkles size={13} /> Respuesta con IA</p>
        <Button variant="outline" size="sm" onClick={redactar} disabled={pensando}>
          {pensando ? 'Redactando…' : borrador ? 'Otra versión' : 'Redactar'}
        </Button>
      </div>
      {borrador !== null && (
        <>
          <Textarea value={borrador} onChange={(e) => setBorrador(e.target.value)} rows={5} className="mt-2 bg-muted" aria-label="Borrador de respuesta" />
          <div className="mt-2 flex flex-wrap gap-2">
            {wa && (
              <Button size="sm" asChild>
                <a href={`${wa}?text=${encodeURIComponent(borrador)}`} target="_blank" rel="noopener noreferrer"><MessageCircle /> Enviar por WhatsApp</a>
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(borrador).then(() => toast.success('Copiado'))}>
              <Copy /> Copiar
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
