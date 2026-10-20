import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { ArrowRight, Bot, CalendarDays, CreditCard, Laptop, MapPin, MessageCircle, Pencil, Smartphone, Sparkles, TrendingUp, Users, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { lempiras, panelAjustes, panelFacturas, panelGuardarAjuste, panelLeads, panelOrdenes, panelStaff, panelVisitas, waDe, type Factura, type Lead, type Orden, type Staff, type Visita } from '@/lib/api';
import { ESTADOS_ORDEN, saldoOrden, totalOrden } from '@/components/PanelTaller';
import { cobradoEn, porCobrar } from '@/components/PanelCobros';
import type { Pestana } from '@/components/Panel';

/**
 * "Hoy": lo que hay que atender ahora, en una pantalla. Taller, leads, visitas
 * de la semana, cobros, los ingresos del mes contra la meta y el pulso de lo
 * último que pasó. Cada número lleva a su sección.
 */

const hoyISO = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Tegucigalpa' });
const masDias = (n: number) => new Date(Date.now() + n * 86_400_000).toLocaleDateString('en-CA', { timeZone: 'America/Tegucigalpa' });
const SEMANA = 7 * 24 * 3600 * 1000;
const mes = (iso: string) => iso.slice(0, 7);

function hora(h: string): string {
  const [hh, mm] = h.split(':').map(Number);
  return `${((hh! + 11) % 12) + 1}:${String(mm).padStart(2, '0')} ${hh! < 12 ? 'a.m.' : 'p.m.'}`;
}
const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
function hace(iso: string): string {
  const s = (new Date(iso).getTime() - Date.now()) / 1000;
  for (const [u, n] of [['day', 86400], ['hour', 3600], ['minute', 60]] as const) if (Math.abs(s) >= n) return rtf.format(Math.round(s / n), u);
  return 'ahora';
}
const dia = (f: string) => new Date(`${f}T12:00:00Z`).toLocaleDateString('es-HN', { timeZone: 'UTC', weekday: 'short', day: 'numeric' });

export function PanelHoy({ user, onIr }: { user: string; onIr: (p: Pestana) => void }) {
  const [d, setD] = useState<{ leads: Lead[]; visitas: Visita[]; staff: Staff[]; ordenes: Orden[]; facturas: Factura[]; ajustes: Record<string, string> } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editandoMeta, setEditandoMeta] = useState(false);
  const [metaTxt, setMetaTxt] = useState('');

  useEffect(() => {
    Promise.all([panelLeads(), panelVisitas(), panelStaff(), panelOrdenes(), panelFacturas(), panelAjustes()])
      .then(([leads, visitas, staff, ordenes, facturas, ajustes]) => setD({ leads, visitas, staff, ordenes, facturas, ajustes }))
      .catch((e) => setError(e instanceof Error ? e.message : 'No se pudo cargar'));
  }, []);

  const n = useMemo(() => {
    const hoy = hoyISO(), fin = masDias(7), m = mes(hoy);
    const l = d?.leads ?? [], v = d?.visitas ?? [], o = d?.ordenes ?? [], f = d?.facturas ?? [];
    const enTaller = o.filter((x) => x.estado !== 'entregado');
    const semana = v.filter((x) => x.estado === 'confirmada' && x.fecha && x.fecha >= hoy && x.fecha <= fin).sort((a, b) => `${a.fecha}${a.hora ?? ''}`.localeCompare(`${b.fecha}${b.hora ?? ''}`));
    const [y, mm] = m.split('-').map(Number);
    const anterior = `${mm === 1 ? y! - 1 : y}-${String(mm === 1 ? 12 : mm! - 1).padStart(2, '0')}`;
    const cobrado = cobradoEn(f, m), cobradoAnt = cobradoEn(f, anterior);
    const meta = Number(d?.ajustes.meta_mensual ?? 0) || 0;
    const pulso = [
      ...o.flatMap((x) => x.log.slice(-1).map((e) => ({ cuando: e.cuando, tono: 'var(--green)', texto: `${e.quien}: ${e.texto} (${x.num} · ${x.cliente})` }))),
      ...l.slice(0, 20).map((x) => ({ cuando: x.createdAt, tono: 'var(--kzp-azul)', texto: `Nuevo lead por ${x.source === 'whatsapp' ? 'WhatsApp' : x.source === 'demo' ? 'demo' : 'formulario'}: ${x.service} · ${x.name}` })),
      ...f.filter((x) => x.estado === 'pagada' && x.pagadaAt).map((x) => ({ cuando: x.pagadaAt!, tono: 'var(--kzp-ambar)', texto: `${lempiras(x.monto)} cobrados · ${x.num} ${x.cliente}` })),
      ...v.filter((x) => x.estado === 'pendiente').map((x) => ({ cuando: x.createdAt, tono: 'var(--kzp-violeta)', texto: `Pidió visita: ${x.nombre} · ${x.servicio} · ${x.municipio ?? ''}` })),
    ].sort((a, b) => b.cuando.localeCompare(a.cuando)).slice(0, 6);
    return {
      nuevos: l.filter((x) => x.status === 'new'),
      semanaLeads: l.filter((x) => Date.now() - new Date(x.createdAt).getTime() < SEMANA).length,
      pendientes: v.filter((x) => x.estado === 'pendiente'),
      enTaller, listos: enTaller.filter((x) => x.estado === 'listo').length,
      semana, camarasSemana: semana.filter((x) => /c[aá]mara/i.test(x.servicio)).length,
      porCobrar: porCobrar(f), nPendientes: f.filter((x) => x.estado !== 'pagada').length,
      cobrado, delta: cobradoAnt ? Math.round(((cobrado - cobradoAnt) / cobradoAnt) * 100) : null, meta, metaPct: meta ? Math.min(100, Math.round((cobrado / meta) * 100)) : 0,
      tecnicos: (d?.staff ?? []).filter((s) => s.activo && s.rol === 'tecnico'),
      pulso,
    };
  }, [d]);

  const saludo = (() => {
    const h = Number(new Date().toLocaleTimeString('en-GB', { timeZone: 'America/Tegucigalpa', hour: '2-digit' }));
    return h < 12 ? 'Buenos días' : h < 18 ? 'Buenas tardes' : 'Buenas noches';
  })();
  const fecha = new Date().toLocaleDateString('es-HN', { timeZone: 'America/Tegucigalpa', weekday: 'long', day: 'numeric', month: 'long' });
  const cargando = !d && !error;
  const resumen = [
    n.enTaller.length ? `${n.enTaller.length} equipo${n.enTaller.length === 1 ? '' : 's'} en taller${n.listos ? ` (${n.listos} listo${n.listos === 1 ? '' : 's'} para entregar)` : ''}` : '',
    n.nuevos.length ? `${n.nuevos.length} lead${n.nuevos.length === 1 ? '' : 's'} por contestar` : '',
    n.pendientes.length ? `${n.pendientes.length} visita${n.pendientes.length === 1 ? '' : 's'} por confirmar` : '',
  ].filter(Boolean);

  async function guardarMeta() {
    const v = Number(metaTxt.replace(/[^\d.]/g, ''));
    try {
      await panelGuardarAjuste('meta_mensual', String(v || 0));
      setD((x) => (x ? { ...x, ajustes: { ...x.ajustes, meta_mensual: String(v || 0) } } : x));
      setEditandoMeta(false);
      toast.success('Meta guardada');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar');
    }
  }

  return (
    <section className="kzp-vista">
      <p className="kz-eyebrow">// {fecha}</p>
      <h2 className="kzp-titulo mt-1">{saludo}, {user.split(' ')[0]}.</h2>
      <p className="kzp-sub">{cargando ? 'Revisando qué hay…' : resumen.length ? `${resumen.join(', ')}.` : 'Nada pendiente. Todo atendido.'}</p>

      {error && <p role="alert" className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</p>}

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cargando ? (
          Array.from({ length: 4 }, (_, i) => <div key={i} className="kzp-esqueleto h-[108px]" />)
        ) : (
          <>
            <Kpi titulo="En taller" valor={String(n.enTaller.length)} nota={n.listos ? `${n.listos} listo${n.listos === 1 ? '' : 's'} para entregar` : 'ninguno listo todavía'} tono="var(--green)" Icono={Wrench} onClick={() => onIr('taller')} />
            <Kpi titulo="Leads nuevos" valor={String(n.nuevos.length)} nota={`+${n.semanaLeads} esta semana`} tono="var(--kzp-azul)" Icono={Users} onClick={() => onIr('leads')} />
            <Kpi titulo="Visitas esta semana" valor={String(n.semana.length)} nota={n.camarasSemana ? `${n.camarasSemana} de cámaras` : `${n.pendientes.length} por confirmar`} tono="var(--kzp-ambar)" Icono={CalendarDays} onClick={() => onIr('visitas')} />
            <Kpi titulo="Por cobrar" valor={lempiras(n.porCobrar)} nota={`${n.nPendientes} factura${n.nPendientes === 1 ? '' : 's'} pendiente${n.nPendientes === 1 ? '' : 's'}`} tono="var(--kzp-violeta)" Icono={CreditCard} onClick={() => onIr('cobros')} chico />
          </>
        )}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        {/* ── Ingresos y meta ── */}
        <div className="kz-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold"><TrendingUp size={16} className="text-accent-foreground" /> Cobrado este mes</p>
              <p className="mt-2 text-[34px] font-black leading-none tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>{cargando ? '…' : lempiras(n.cobrado)}</p>
              {n.delta !== null && (
                <p className="mt-1.5 text-[12.5px]" style={{ color: n.delta >= 0 ? 'var(--green2)' : 'var(--kzp-rojo)' }}>{n.delta >= 0 ? '+' : ''}{n.delta}% vs. el mes anterior</p>
              )}
            </div>
            <div className="min-w-[200px] flex-1 sm:max-w-xs">
              <div className="flex items-center justify-between text-[12.5px]">
                <span className="text-muted-foreground">Meta del mes</span>
                {editandoMeta ? (
                  <span className="flex items-center gap-1">
                    <Input value={metaTxt} onChange={(e) => setMetaTxt(e.target.value)} inputMode="numeric" className="h-7 w-28 font-mono text-[12px]" aria-label="Meta mensual en lempiras" autoFocus onKeyDown={(e) => e.key === 'Enter' && guardarMeta()} />
                    <Button size="sm" className="h-7" onClick={guardarMeta}>Ok</Button>
                  </span>
                ) : (
                  <button onClick={() => { setMetaTxt(String(n.meta || '')); setEditandoMeta(true); }} className="inline-flex items-center gap-1 font-mono font-semibold hover:text-accent-foreground">
                    {n.meta ? lempiras(n.meta) : 'Poner meta'} <Pencil size={11} />
                  </button>
                )}
              </div>
              <span className="mt-2 block h-2.5 overflow-hidden rounded-full bg-muted">
                <span className="block h-full rounded-full transition-[width] duration-500" style={{ width: `${n.metaPct}%`, background: 'linear-gradient(90deg, var(--green2), var(--green-bright))' }} />
              </span>
              <p className="mt-1.5 text-right font-mono text-[12px] text-muted-foreground">{n.meta ? `${n.metaPct}%` : 'sin meta'}</p>
            </div>
          </div>
          <p className="kz-eyebrow mt-5">// pulso</p>
          <ul className="mt-2 space-y-2">
            {n.pulso.map((p, i) => (
              <li key={i} className="flex items-start gap-3 text-[13px]">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: p.tono }} />
                <span className="min-w-0 flex-1 truncate">{p.texto}</span>
                <span className="shrink-0 text-[11.5px] text-muted-foreground">{hace(p.cuando)}</span>
              </li>
            ))}
            {d && n.pulso.length === 0 && <li className="text-[13px] text-muted-foreground">Todavía no pasa nada. Cuando entre un lead, una orden o un pago, aparece acá.</li>}
          </ul>
        </div>

        {/* ── En taller ahora ── */}
        <Bloque titulo="En taller ahora" accion="Ver taller" onAccion={() => onIr('taller')} vacio={d && n.enTaller.length === 0 ? 'Ningún equipo en reparación.' : undefined}>
          {n.enTaller.slice(0, 4).map((o) => {
            const e = ESTADOS_ORDEN.find((x) => x.id === o.estado)!;
            const saldo = saldoOrden(o);
            return (
              <li key={o.id} className="flex items-center gap-3 py-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">{o.tipo === 'pc' ? <Laptop size={16} /> : <Smartphone size={16} />}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{o.equipo}</span>
                  <span className="block truncate text-[12px] text-muted-foreground">{o.cliente} · {o.falla}{totalOrden(o) ? ` · ${saldo > 0 ? `saldo ${lempiras(saldo)}` : 'pagado'}` : ''}</span>
                </span>
                <span className="kzp-chip shrink-0" style={{ '--kzp-tono': e.color } as CSSProperties}>{e.label}</span>
              </li>
            );
          })}
        </Bloque>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Bloque titulo="Agenda de la semana" accion="Agenda" onAccion={() => onIr('visitas')} vacio={d && n.semana.length === 0 ? 'Sin visitas confirmadas en los próximos 7 días.' : undefined}>
          {n.semana.slice(0, 5).map((v) => (
            <li key={v.id} className="flex items-center gap-3 py-2.5">
              <span className="w-14 shrink-0 text-center">
                <span className="block text-[10.5px] uppercase text-muted-foreground">{dia(v.fecha!).split(' ')[0]}</span>
                <span className="block text-lg font-black leading-none">{v.fecha!.slice(8)}</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{v.servicio} · {v.nombre}</span>
                <span className="block truncate text-[12px] text-muted-foreground">{v.hora ? hora(v.hora) : 'sin hora'} · {v.tipo === 'local' ? 'en el local' : [v.municipio, v.direccion].filter(Boolean).join(', ')}</span>
              </span>
            </li>
          ))}
        </Bloque>

        <Bloque titulo="Leads por contestar" accion="Ver todos" onAccion={() => onIr('leads')} vacio={d && n.nuevos.length === 0 ? 'Ninguno sin contestar.' : undefined}>
          {n.nuevos.slice(0, 5).map((l) => (
            <li key={l.id} className="flex items-center gap-3 py-2.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[12px] font-bold" style={{ background: 'color-mix(in srgb, var(--kzp-azul) 14%, transparent)', color: 'var(--kzp-azul)' }}>
                {l.name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('')}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{l.name}</span>
                <span className="block truncate text-[12px] text-muted-foreground">{l.service} · {l.source === 'whatsapp' ? 'WhatsApp' : l.source === 'demo' ? 'Demo' : 'Formulario'} · {hace(l.createdAt)}</span>
              </span>
              {l.phone && waDe(l.phone) ? (
                <Button variant="outline" size="icon" asChild><a href={waDe(l.phone)!} target="_blank" rel="noreferrer" aria-label={`WhatsApp a ${l.name}`}><MessageCircle /></a></Button>
              ) : (
                <Button variant="outline" size="sm" asChild><a href={`mailto:${l.email}`}>Correo</a></Button>
              )}
            </li>
          ))}
        </Bloque>

        <div className="space-y-4">
          <Bloque titulo="Visitas por confirmar" accion="Programar" onAccion={() => onIr('visitas')} vacio={d && n.pendientes.length === 0 ? 'Nada pendiente.' : undefined}>
            {n.pendientes.slice(0, 3).map((v) => (
              <li key={v.id} className="flex items-center gap-3 py-2.5">
                <MapPin size={16} className="shrink-0" style={{ color: 'var(--kzp-ambar)' }} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{v.nombre} <span className="font-normal text-muted-foreground">· {v.servicio}</span></span>
                  <span className="block truncate text-[12px] text-muted-foreground">{v.tipo === 'local' ? 'En el local' : [v.municipio, v.direccion].filter(Boolean).join(', ')}</span>
                </span>
              </li>
            ))}
          </Bloque>

          <div className="kz-card p-5">
            <p className="flex items-center gap-2 text-sm font-bold">
              <Bot size={16} className="text-accent-foreground" /> Asistente de WhatsApp
              <span className="kz-latido ml-auto" aria-hidden="true" />
            </p>
            <p className="mt-2 text-[13px] text-muted-foreground">Atiende el +504 8809-1744 las 24 horas: cotiza, pide visitas y deja cada lead acá.</p>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[13px]">
              <dt className="text-muted-foreground">Técnicos</dt>
              <dd>{cargando ? '…' : n.tecnicos.length ? n.tecnicos.map((t) => t.nombre.split(' ')[0]).join(', ') : <button onClick={() => onIr('equipo')} className="underline-offset-2 hover:underline" style={{ color: 'var(--kzp-ambar)' }}>ninguno activo: agregalo</button>}</dd>
              <dt className="text-muted-foreground">Agente</dt>
              <dd>+504 8921-0653</dd>
            </dl>
            <button onClick={() => onIr('asistente')} className="mt-4 flex w-full items-center gap-2 rounded-xl border border-border bg-accent/40 px-3 py-2.5 text-left text-[13px] transition-colors hover:border-ring">
              <Sparkles size={14} className="shrink-0 text-accent-foreground" />
              <span className="min-w-0 flex-1 truncate">Preguntale al asistente: "¿qué órdenes tienen saldo?"</span>
              <ArrowRight size={14} className="shrink-0 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Kpi({ titulo, valor, nota, tono, Icono, onClick, chico }: { titulo: string; valor: string; nota: string; tono: string; Icono: typeof Users; onClick: () => void; chico?: boolean }) {
  return (
    <button onClick={onClick} className="kzp-kpi" style={{ '--kzp-tono': tono } as CSSProperties}>
      <span className="kzp-kpi-titulo"><Icono size={14} style={{ color: tono }} /> {titulo}</span>
      <span className={`kzp-kpi-valor ${chico ? '!text-[26px]' : ''}`}>{valor}</span>
      <span className="kzp-kpi-nota">{nota}</span>
    </button>
  );
}

function Bloque({ titulo, accion, onAccion, vacio, children }: { titulo: string; accion: string; onAccion: () => void; vacio?: string; children: React.ReactNode }) {
  return (
    <div className="kz-card p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold">{titulo}</p>
        <button onClick={onAccion} className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-accent-foreground">{accion} <ArrowRight size={13} /></button>
      </div>
      {vacio ? <p className="mt-3 text-[13px] text-muted-foreground">{vacio}</p> : <ul className="mt-2 divide-y divide-border">{children}</ul>}
    </div>
  );
}
