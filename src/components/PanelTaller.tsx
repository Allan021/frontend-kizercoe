import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { ArrowLeft, Camera, Check, ChevronRight, Laptop, MessageCircle, Plus, Receipt, Search, Smartphone, Trash2, Wrench, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AvisoError } from '@/components/PanelAviso';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { SubirImagen } from '@/components/SubirImagen';
import { miniatura } from '@/lib/upload';
import {
  lempiras, panelAvisarOrden, panelBorrarOrden, panelCrearFactura, panelCrearOrden, panelEditarOrden, panelOrdenes, panelStaff, waDe,
  type EstadoOrden, type Orden, type OrdenDatos, type PagoOrden,
} from '@/lib/api';

/**
 * El taller: cada equipo que entra a reparar, desde "recibido" hasta
 * "entregado". A la izquierda la lista por etapa; a la derecha la orden con
 * diagnóstico, repuestos, pagos con comprobante, fotos y bitácora. Desde acá
 * se le avisa al cliente por WhatsApp y se factura el saldo.
 */

export const ESTADOS_ORDEN: { id: EstadoOrden; label: string; color: string }[] = [
  { id: 'recibido', label: 'Recibido', color: 'var(--kzp-azul)' },
  { id: 'diagnostico', label: 'Diagnóstico', color: 'var(--kzp-ambar)' },
  { id: 'reparacion', label: 'En reparación', color: 'var(--kzp-violeta)' },
  { id: 'listo', label: 'Listo', color: 'var(--green)' },
  { id: 'entregado', label: 'Entregado', color: 'var(--mute)' },
];
const estadoDe = (id: EstadoOrden) => ESTADOS_ORDEN.find((e) => e.id === id) ?? ESTADOS_ORDEN[0]!;
const TIPOS = [
  ['todos', 'Todos', null],
  ['pc', 'Computadoras', Laptop],
  ['cel', 'Celulares', Smartphone],
  ['otro', 'Otros', Wrench],
] as const;
const IconoTipo = ({ tipo, size = 18 }: { tipo: Orden['tipo']; size?: number }) =>
  tipo === 'pc' ? <Laptop size={size} /> : tipo === 'cel' ? <Smartphone size={size} /> : <Wrench size={size} />;

export const totalOrden = (o: Orden) => o.items.reduce((s, i) => s + Number(i.precio), 0);
export const abonadoOrden = (o: Orden) => o.pagos.reduce((s, p) => s + Number(p.monto), 0);
export const saldoOrden = (o: Orden) => totalOrden(o) - abonadoOrden(o);

const fechaCorta = (iso: string) => new Date(iso).toLocaleDateString('es-HN', { timeZone: 'America/Tegucigalpa', day: 'numeric', month: 'short' });
const fechaHora = (iso: string) => new Date(iso).toLocaleString('es-HN', { timeZone: 'America/Tegucigalpa', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const ahora = () => new Date().toISOString();

export function PanelTaller({ onConteo, user }: { onConteo: (n: number) => void; user: string }) {
  const [ordenes, setOrdenes] = useState<Orden[] | null>(null);
  const [etapa, setEtapa] = useState<'todas' | EstadoOrden>('todas');
  const [tipo, setTipo] = useState<'todos' | Orden['tipo']>('todos');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<string | null>(null);
  const [nueva, setNueva] = useState(false);
  const [tecnicos, setTecnicos] = useState<string[]>([]);

  const [error, setError] = useState<string | null>(null);
  const cargar = () => {
    setError(null);
    panelOrdenes()
      .then(setOrdenes)
      .catch((e) => setError(e instanceof Error ? e.message : 'No se pudo cargar el taller'));
  };
  useEffect(cargar, []);
  useEffect(() => {
    panelStaff().then((s) => setTecnicos(s.filter((p) => p.activo).map((p) => p.nombre))).catch(() => {});
  }, []);
  useEffect(() => {
    if (ordenes) onConteo(ordenes.filter((o) => o.estado !== 'entregado').length);
  }, [ordenes, onConteo]);

  const lista = ordenes ?? [];
  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase();
    return lista.filter(
      (o) =>
        (etapa === 'todas' ? o.estado !== 'entregado' || t : o.estado === etapa) &&
        (tipo === 'todos' || o.tipo === tipo) &&
        (!t || `${o.num} ${o.cliente} ${o.equipo} ${o.modelo ?? ''} ${o.serie ?? ''} ${o.telefono ?? ''} ${o.falla}`.toLowerCase().includes(t)),
    );
  }, [lista, etapa, tipo, q]);
  const actual = lista.find((o) => o.id === sel) ?? null;

  function reemplazar(o: Orden) {
    setOrdenes((l) => (l ?? []).map((x) => (x.id === o.id ? o : x)));
  }
  async function editar(o: Orden, d: OrdenDatos, aviso?: string) {
    try {
      reemplazar(await panelEditarOrden(o.id, d));
      if (aviso) toast.success(aviso);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar');
    }
  }
  async function crear(d: OrdenDatos) {
    try {
      const o = await panelCrearOrden(d);
      setOrdenes((l) => [o, ...(l ?? [])]);
      setNueva(false);
      setSel(o.id);
      toast.success(`${o.num} creada.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo crear');
    }
  }
  async function borrar(o: Orden) {
    try {
      await panelBorrarOrden(o.id);
      setOrdenes((l) => (l ?? []).filter((x) => x.id !== o.id));
      setSel(null);
      toast.success(`${o.num} borrada.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo borrar');
    }
  }

  const conteo = (e: EstadoOrden) => lista.filter((o) => o.estado === e).length;

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="kzp-titulo">Taller</h2>
          <p className="kzp-sub">Cada equipo con su etapa, su diagnóstico, sus pagos y su bitácora. El cliente se entera por WhatsApp.</p>
        </div>
        <Button onClick={() => setNueva(true)}><Plus /> Nueva orden</Button>
      </div>
      {error && <AvisoError error={error} onReintentar={cargar} />}

      <div className={`grid gap-4 ${actual ? 'xl:grid-cols-[minmax(0,1.15fr)_minmax(380px,1fr)]' : ''}`}>
        {/* ── Lista ── */}
        <div className={actual ? 'hidden xl:block' : ''}>
          <div className="flex flex-wrap gap-2">
            {([['todas', 'Activas', lista.filter((o) => o.estado !== 'entregado').length, 'var(--mute)'] as const, ...ESTADOS_ORDEN.map((e) => [e.id, e.label, conteo(e.id), e.color] as const)]).map(([id, label, n, color]) => (
              <button
                key={id}
                onClick={() => setEtapa(id as 'todas' | EstadoOrden)}
                aria-pressed={etapa === id}
                className={`kz-card inline-flex items-center gap-2 px-3 py-2 text-[13px] font-medium ${etapa === id ? '!border-ring' : ''}`}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: color }} /> {label}
                <span className="font-mono text-[12px] text-muted-foreground">{n}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className="relative min-w-[200px] flex-1">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground" />
              <Input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por cliente, IMEI, serie, modelo…" className="pl-9" aria-label="Buscar órdenes" />
            </label>
            {TIPOS.map(([id, label, Icono]) => (
              <button key={id} onClick={() => setTipo(id)} aria-pressed={tipo === id} className={`kz-tab inline-flex items-center gap-1.5 ${tipo === id ? 'kz-tab-activa' : ''}`}>
                {Icono && <Icono size={14} />} {label}
              </button>
            ))}
          </div>

          {!ordenes && !error ? (
            <div className="mt-4 space-y-2">{Array.from({ length: 3 }, (_, i) => <div key={i} className="kzp-esqueleto h-[76px]" />)}</div>
          ) : visibles.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-border p-10 text-center">
              <Wrench className="mx-auto text-muted-foreground" size={26} />
              <p className="mt-3 text-lg font-bold">{lista.length ? 'Nada con esos filtros' : 'El taller está vacío'}</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{lista.length ? 'Probá otra etapa o quitá la búsqueda.' : 'Cuando entre un equipo, creá la orden y seguí todo desde acá.'}</p>
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
              {visibles.map((o) => {
                const e = estadoDe(o.estado);
                const saldo = saldoOrden(o);
                return (
                  <li key={o.id}>
                    <button onClick={() => setSel(o.id)} className={`kz-card flex w-full items-center gap-3 p-3.5 text-left ${sel === o.id ? '!border-ring' : ''}`} aria-current={sel === o.id}>
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground"><IconoTipo tipo={o.tipo} /></span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[12px] text-muted-foreground">{o.num}</span>
                          <span className="truncate text-[14px] font-semibold">{o.equipo}</span>
                        </span>
                        <span className="block truncate text-[12.5px] text-muted-foreground">{o.cliente} · {o.falla}</span>
                      </span>
                      <span className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                        <span className="kzp-chip" style={{ '--kzp-tono': e.color } as CSSProperties}>{e.label}</span>
                        <span className="text-[11.5px] font-medium" style={{ color: saldo > 0 ? 'var(--kzp-ambar)' : 'var(--green2)' }}>
                          {totalOrden(o) === 0 ? 'Sin cotizar' : saldo > 0 ? `Saldo ${lempiras(saldo)}` : 'Pagado'}
                        </span>
                      </span>
                      <ChevronRight size={16} className="shrink-0 text-muted-foreground" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ── Detalle ── */}
        {actual && (
          <Detalle
            key={actual.id}
            o={actual}
            user={user}
            tecnicos={tecnicos}
            onCerrar={() => setSel(null)}
            onEditar={(d, aviso) => editar(actual, d, aviso)}
            onBorrar={() => borrar(actual)}
          />
        )}
      </div>

      <NuevaOrden abierta={nueva} onCerrar={() => setNueva(false)} onCrear={crear} tecnicos={tecnicos} />
    </section>
  );
}

function Detalle({ o, user, tecnicos, onCerrar, onEditar, onBorrar }: {
  o: Orden; user: string; tecnicos: string[]; onCerrar: () => void; onEditar: (d: OrdenDatos, aviso?: string) => Promise<void>; onBorrar: () => void;
}) {
  const e = estadoDe(o.estado);
  const idx = ESTADOS_ORDEN.findIndex((x) => x.id === o.estado);
  const siguiente = ESTADOS_ORDEN[idx + 1];
  const total = totalOrden(o), abonado = abonadoOrden(o), saldo = total - abonado;
  const [dx, setDx] = useState(o.diagnostico ?? '');
  const [item, setItem] = useState({ nombre: '', precio: '' });
  const [pago, setPago] = useState<{ monto: string; metodo: string; ref: string; comprobanteUrl: string | null }>({ monto: '', metodo: 'Efectivo', ref: '', comprobanteUrl: null });
  const [nota, setNota] = useState('');
  const [aviso, setAviso] = useState<string | null>(null);
  const wa = o.telefono ? waDe(o.telefono) : null;

  const textoAviso = () => {
    const nombre = o.cliente.split(' ')[0];
    const base: Record<EstadoOrden, string> = {
      recibido: `¡Hola, ${nombre}! Recibimos su ${o.equipo} en Kizercode (orden ${o.num}). Le avisamos por aquí el diagnóstico.`,
      diagnostico: `¡Hola, ${nombre}! Ya revisamos su ${o.equipo} (orden ${o.num}): ${o.diagnostico || '…'}${total ? ` El costo de la reparación es ${lempiras(total)}.` : ''} ¿Lo aprobamos?`,
      reparacion: `¡Hola, ${nombre}! Su ${o.equipo} (orden ${o.num}) ya está en reparación. Le avisamos en cuanto esté listo.`,
      listo: `¡Hola, ${nombre}! Su ${o.equipo} ya está listo (orden ${o.num}).${saldo > 0 ? ` Saldo pendiente: ${lempiras(saldo)}.` : ''} Puede pasar a recogerlo de lunes a sábado de 7:00 a.m. a 6:00 p.m.`,
      entregado: `¡Gracias, ${nombre}! Su ${o.equipo} quedó entregado (orden ${o.num}). Tiene 30 días de garantía en la reparación. Cualquier cosa, por aquí.`,
    };
    return base[o.estado];
  };

  async function avisar() {
    if (!aviso) return;
    try {
      const r = await panelAvisarOrden(o.id, aviso);
      if (r.ok) toast.success(`Avisado a ${o.cliente} por WhatsApp.`);
      else toast.warning(`No salió el WhatsApp (${r.error ?? 'error'}).`);
      setAviso(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo avisar');
    }
  }

  async function facturarSaldo() {
    try {
      const f = await panelCrearFactura({ cliente: o.cliente, telefono: o.telefono, concepto: `${o.equipo} · ${o.num}`, monto: saldo > 0 ? saldo : total, estado: 'pendiente', origen: 'taller', origenId: o.id });
      toast.success(`Factura ${f.num} creada en Cobros.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo facturar');
    }
  }

  return (
    <div className="kz-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="xl:hidden" onClick={onCerrar} aria-label="Volver a la lista"><ArrowLeft /></Button>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground"><IconoTipo tipo={o.tipo} size={20} /></span>
          <div>
            <p className="flex flex-wrap items-center gap-2 font-bold">
              <span className="font-mono text-[12px] text-muted-foreground">{o.num}</span> {o.equipo}
              <span className="kzp-chip" style={{ '--kzp-tono': e.color } as CSSProperties}>{e.label}</span>
            </p>
            <p className="text-[13px] text-muted-foreground">
              {o.cliente}{o.telefono ? ` · ${o.telefono}` : ''} · entró el {fechaCorta(o.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="hidden xl:inline-flex" onClick={onCerrar} aria-label="Cerrar"><X /></Button>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="ghost" size="icon" aria-label="Borrar orden" className="text-destructive hover:text-destructive"><Trash2 /></Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>¿Borrar la orden {o.num}?</AlertDialogTitle><AlertDialogDescription>Se pierde su bitácora y sus pagos. Si solo terminó, pasala a entregada.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={onBorrar} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Borrar</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Etapas */}
      <ol className="mt-5 grid grid-cols-5 gap-1.5" aria-label="Etapas">
        {ESTADOS_ORDEN.map((x, i) => (
          <li key={x.id}>
            <span className="block h-1.5 rounded-full" style={{ background: i <= idx ? 'var(--green)' : 'var(--line)' }} />
            <span className={`mt-1.5 block truncate text-[11px] ${i === idx ? 'font-semibold' : 'text-muted-foreground'}`}>{x.label}</span>
          </li>
        ))}
      </ol>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Dato etiqueta="Falla" valor={o.falla} />
        <Dato etiqueta="Modelo" valor={o.modelo} />
        <Dato etiqueta={o.tipo === 'cel' ? 'IMEI' : 'N° de serie'} valor={o.serie} mono />
        <Dato etiqueta="Accesorios" valor={o.accesorios} />
        <div className="space-y-1.5">
          <Label>Técnico</Label>
          <Select value={o.tecnico ?? '__'} onValueChange={(v) => onEditar({ tecnico: v === '__' ? null : v })}>
            <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__">Sin asignar</SelectItem>
              {[...new Set([...tecnicos, ...(o.tecnico ? [o.tecnico] : [])])].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        <Label htmlFor={`dx-${o.id}`}>Diagnóstico</Label>
        <Textarea id={`dx-${o.id}`} rows={3} value={dx} onChange={(ev) => setDx(ev.target.value)} onBlur={() => dx !== (o.diagnostico ?? '') && onEditar({ diagnostico: dx }, 'Diagnóstico guardado')} placeholder="Qué tiene y qué se recomienda. Se le manda al cliente al avisar." />
      </div>

      {/* Repuestos y mano de obra */}
      <div className="mt-5">
        <p className="kz-eyebrow">// repuestos y mano de obra</p>
        <ul className="mt-2 divide-y divide-border rounded-xl border border-border">
          {o.items.map((it, i) => (
            <li key={i} className="flex items-center gap-3 px-3 py-2 text-[13.5px]">
              <span className="min-w-0 flex-1 truncate">{it.nombre}</span>
              <span className="font-mono">{lempiras(Number(it.precio))}</span>
              <button onClick={() => onEditar({ items: o.items.filter((_, j) => j !== i) })} className="text-muted-foreground hover:text-destructive" aria-label={`Quitar ${it.nombre}`}><X size={14} /></button>
            </li>
          ))}
          <li className="flex items-center gap-2 p-2">
            <Input value={item.nombre} onChange={(ev) => setItem({ ...item, nombre: ev.target.value })} placeholder="Pantalla, DC jack, mano de obra…" className="h-9" aria-label="Repuesto" />
            <Input value={item.precio} onChange={(ev) => setItem({ ...item, precio: ev.target.value })} placeholder="L" inputMode="decimal" className="h-9 w-24" aria-label="Precio" />
            <Button
              size="sm"
              variant="outline"
              disabled={!item.nombre.trim() || !Number(item.precio)}
              onClick={() => { void onEditar({ items: [...o.items, { nombre: item.nombre.trim(), precio: Number(item.precio) }] }); setItem({ nombre: '', precio: '' }); }}
            >
              <Plus /> Agregar
            </Button>
          </li>
        </ul>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Cifra etiqueta="Total" valor={lempiras(total)} />
          <Cifra etiqueta="Abonado" valor={lempiras(abonado)} tono="var(--green2)" />
          <Cifra etiqueta="Saldo" valor={lempiras(saldo)} tono={saldo > 0 ? 'var(--kzp-ambar)' : 'var(--green2)'} />
        </div>
      </div>

      {/* Pagos */}
      <div className="mt-5">
        <p className="kz-eyebrow">// pagos y comprobantes</p>
        <ul className="mt-2 space-y-2">
          {o.pagos.map((p, i) => (
            <li key={i} className="flex items-center gap-3 rounded-xl border border-border bg-muted/50 px-3 py-2 text-[13px]">
              {p.comprobanteUrl ? (
                <a href={p.comprobanteUrl} target="_blank" rel="noreferrer" className="shrink-0"><img src={miniatura(p.comprobanteUrl, 96) ?? p.comprobanteUrl} alt="" width={40} height={40} className="h-10 w-10 rounded-lg object-cover" /></a>
              ) : (
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground"><Receipt size={16} /></span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{lempiras(Number(p.monto))} · {p.metodo}</span>
                <span className="block truncate text-[12px] text-muted-foreground">{p.fecha}{p.ref ? ` · ${p.ref}` : ''}</span>
              </span>
              <button
                onClick={() => onEditar({ pagos: o.pagos.map((x, j) => (j === i ? { ...x, estado: x.estado === 'confirmado' ? 'por_confirmar' : 'confirmado' } : x)) })}
                className="kzp-chip"
                style={{ '--kzp-tono': p.estado === 'confirmado' ? 'var(--green)' : 'var(--kzp-ambar)' } as CSSProperties}
                title="Tocá para cambiar"
              >
                {p.estado === 'confirmado' ? 'Confirmado' : 'Por confirmar'}
              </button>
              <button onClick={() => onEditar({ pagos: o.pagos.filter((_, j) => j !== i) })} className="text-muted-foreground hover:text-destructive" aria-label="Quitar pago"><X size={14} /></button>
            </li>
          ))}
        </ul>
        <div className="mt-2 grid gap-2 rounded-xl border border-dashed border-border p-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
          <Input value={pago.monto} onChange={(ev) => setPago({ ...pago, monto: ev.target.value })} placeholder="Monto L" inputMode="decimal" className="h-9" aria-label="Monto" />
          <Select value={pago.metodo} onValueChange={(metodo) => setPago({ ...pago, metodo })}>
            <SelectTrigger className="h-9" aria-label="Método"><SelectValue /></SelectTrigger>
            <SelectContent>{['Efectivo', 'Transferencia BAC', 'Transferencia Atlántida', 'Transferencia Occidente', 'Tigo Money', 'Tarjeta', 'Otro'].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
          <Input value={pago.ref} onChange={(ev) => setPago({ ...pago, ref: ev.target.value })} placeholder="Referencia" className="h-9" aria-label="Referencia" />
          <Button
            size="sm"
            disabled={!Number(pago.monto)}
            onClick={() => {
              const nuevo: PagoOrden = { monto: Number(pago.monto), metodo: pago.metodo, fecha: fechaCorta(ahora()), ref: pago.ref.trim(), estado: pago.comprobanteUrl ? 'por_confirmar' : 'confirmado', comprobanteUrl: pago.comprobanteUrl };
              void onEditar({ pagos: [...o.pagos, nuevo] }, 'Pago anotado');
              setPago({ monto: '', metodo: 'Efectivo', ref: '', comprobanteUrl: null });
            }}
          >
            <Plus /> Anotar
          </Button>
          <div className="sm:col-span-4">
            <SubirImagen url={pago.comprobanteUrl} onSubida={(u) => setPago({ ...pago, comprobanteUrl: u })} onQuitar={() => setPago({ ...pago, comprobanteUrl: null })} etiqueta="Comprobante" ayuda="Captura de la transferencia. Opcional." />
          </div>
        </div>
      </div>

      {/* Fotos */}
      <div className="mt-5">
        <p className="kz-eyebrow">// fotos</p>
        {o.fotos.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-2">
            {o.fotos.map((f, i) => (
              <li key={i} className="group relative">
                <a href={f} target="_blank" rel="noreferrer"><img src={miniatura(f, 160) ?? f} alt="" width={80} height={80} className="h-20 w-20 rounded-lg object-cover" loading="lazy" /></a>
                <button onClick={() => onEditar({ fotos: o.fotos.filter((_, j) => j !== i) })} className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-background text-muted-foreground shadow opacity-0 transition-opacity group-hover:opacity-100" aria-label="Quitar foto"><X size={12} /></button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-2">
          <SubirImagen url={null} onSubida={(u) => onEditar({ fotos: [...o.fotos, u] }, 'Foto guardada')} etiqueta="Agregar foto" ayuda="Del equipo al entrar, del daño, del repuesto." />
        </div>
      </div>

      {/* Bitácora */}
      <div className="mt-5">
        <p className="kz-eyebrow">// bitácora</p>
        <ul className="mt-2 space-y-1.5 text-[13px]">
          {[...o.log].reverse().map((l, i) => (
            <li key={i} className="flex gap-3">
              <span className="w-28 shrink-0 font-mono text-[11.5px] text-muted-foreground">{fechaHora(l.cuando)}</span>
              <span><span className="font-semibold">{l.quien}</span> · {l.texto}</span>
            </li>
          ))}
        </ul>
        <form
          className="mt-2 flex gap-2"
          onSubmit={(ev) => {
            ev.preventDefault();
            if (!nota.trim()) return;
            void onEditar({ log: [...o.log, { cuando: ahora(), quien: user, texto: nota.trim() }] });
            setNota('');
          }}
        >
          <Input value={nota} onChange={(ev) => setNota(ev.target.value)} placeholder="Qué se hizo, qué falta, qué dijo el cliente…" className="h-9" aria-label="Nueva nota" />
          <Button type="submit" size="sm" variant="outline" disabled={!nota.trim()}>Anotar</Button>
        </form>
      </div>

      {/* Acciones */}
      <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-4">
        {wa ? (
          <Button variant="outline" onClick={() => setAviso(textoAviso())}><MessageCircle /> Avisar por WhatsApp</Button>
        ) : (
          <Button variant="outline" disabled title="La orden no tiene teléfono"><MessageCircle /> Avisar por WhatsApp</Button>
        )}
        {siguiente && (
          <Button onClick={() => onEditar({ estado: siguiente.id }, `Pasó a ${siguiente.label.toLowerCase()}.`)}><Check /> Pasar a {siguiente.label.toLowerCase()}</Button>
        )}
        {total > 0 && (o.estado === 'listo' || o.estado === 'entregado') && (
          <Button variant="outline" onClick={facturarSaldo}><Receipt /> {saldo > 0 ? `Facturar saldo ${lempiras(saldo)}` : 'Facturar'}</Button>
        )}
        {o.fotos.length === 0 && <span className="inline-flex items-center gap-1 self-center text-[12px] text-muted-foreground"><Camera size={13} /> Sin fotos todavía</span>}
      </div>

      <Dialog open={aviso !== null} onOpenChange={(ab) => !ab && setAviso(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Avisar a {o.cliente}</DialogTitle>
            <DialogDescription>Sale por el WhatsApp de Kizercode al {o.telefono}. Editá el texto si querés.</DialogDescription>
          </DialogHeader>
          <Textarea rows={6} value={aviso ?? ''} onChange={(ev) => setAviso(ev.target.value)} aria-label="Mensaje" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAviso(null)}>Cancelar</Button>
            <Button onClick={avisar} disabled={!aviso?.trim()}><MessageCircle /> Enviar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Dato({ etiqueta, valor, mono }: { etiqueta: string; valor: string | null; mono?: boolean }) {
  return (
    <div>
      <p className="text-[12px] text-muted-foreground">{etiqueta}</p>
      <p className={`text-[13.5px] ${mono ? 'font-mono' : ''} ${valor ? '' : 'text-muted-foreground'}`}>{valor || '—'}</p>
    </div>
  );
}

function Cifra({ etiqueta, valor, tono }: { etiqueta: string; valor: string; tono?: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/50 px-2 py-2">
      <p className="text-[11px] text-muted-foreground">{etiqueta}</p>
      <p className="font-mono text-[15px] font-bold" style={tono ? { color: tono } : undefined}>{valor}</p>
    </div>
  );
}

function NuevaOrden({ abierta, onCerrar, onCrear, tecnicos }: { abierta: boolean; onCerrar: () => void; onCrear: (d: OrdenDatos) => Promise<void>; tecnicos: string[] }) {
  const vacio: OrdenDatos = { tipo: 'cel', equipo: '', cliente: '', telefono: '', falla: '', modelo: '', serie: '', accesorios: '', tecnico: null };
  const [d, setD] = useState<OrdenDatos>(vacio);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (abierta) setD(vacio); }, [abierta]); // eslint-disable-line react-hooks/exhaustive-deps
  const listo = (d.equipo ?? '').trim().length >= 2 && (d.cliente ?? '').trim().length >= 2 && (d.falla ?? '').trim().length >= 2;

  return (
    <Dialog open={abierta} onOpenChange={(ab) => !ab && onCerrar()}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva orden de taller</DialogTitle>
          <DialogDescription>Lo que entra hoy. El diagnóstico y los repuestos se agregan después.</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={async (ev) => {
            ev.preventDefault();
            if (!listo) return;
            setBusy(true);
            await onCrear({ ...d, telefono: d.telefono || null, modelo: d.modelo || null, serie: d.serie || null, accesorios: d.accesorios || null });
            setBusy(false);
          }}
        >
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select value={d.tipo} onValueChange={(tipo) => setD({ ...d, tipo: tipo as Orden['tipo'] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="cel">Celular</SelectItem><SelectItem value="pc">Computadora</SelectItem><SelectItem value="otro">Otro</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="no-equipo">Equipo</Label>
            <Input id="no-equipo" value={d.equipo ?? ''} onChange={(ev) => setD({ ...d, equipo: ev.target.value })} placeholder="Samsung Galaxy A54" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="no-cliente">Cliente</Label>
            <Input id="no-cliente" value={d.cliente ?? ''} onChange={(ev) => setD({ ...d, cliente: ev.target.value })} placeholder="Nombre" required autoComplete="off" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="no-tel">WhatsApp</Label>
            <Input id="no-tel" value={d.telefono ?? ''} onChange={(ev) => setD({ ...d, telefono: ev.target.value })} placeholder="9911-2034" inputMode="tel" type="tel" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="no-falla">Falla que reporta</Label>
            <Input id="no-falla" value={d.falla ?? ''} onChange={(ev) => setD({ ...d, falla: ev.target.value })} placeholder="No enciende, pantalla quebrada…" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="no-modelo">Modelo</Label>
            <Input id="no-modelo" value={d.modelo ?? ''} onChange={(ev) => setD({ ...d, modelo: ev.target.value })} placeholder="SM-A546" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="no-serie">{d.tipo === 'cel' ? 'IMEI' : 'N° de serie'}</Label>
            <Input id="no-serie" value={d.serie ?? ''} onChange={(ev) => setD({ ...d, serie: ev.target.value })} className="font-mono" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="no-acc">Accesorios</Label>
            <Input id="no-acc" value={d.accesorios ?? ''} onChange={(ev) => setD({ ...d, accesorios: ev.target.value })} placeholder="Cargador, funda" />
          </div>
          <div className="space-y-1.5">
            <Label>Técnico</Label>
            <Select value={d.tecnico ?? '__'} onValueChange={(v) => setD({ ...d, tecnico: v === '__' ? null : v })}>
              <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
              <SelectContent><SelectItem value="__">Sin asignar</SelectItem>{tecnicos.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={onCerrar}>Cancelar</Button>
            <Button type="submit" disabled={!listo || busy}>{busy ? 'Creando…' : 'Crear orden'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
