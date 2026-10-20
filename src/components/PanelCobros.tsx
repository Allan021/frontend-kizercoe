import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { ExternalLink, Plus, Receipt, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AvisoError } from '@/components/PanelAviso';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { SubirImagen } from '@/components/SubirImagen';
import { lempiras, panelBorrarFactura, panelCrearFactura, panelEditarFactura, panelFacturas, type EstadoFactura, type Factura, type FacturaDatos } from '@/lib/api';

/**
 * Cobros: cada factura con su estado y su comprobante. Arriba, lo cobrado del
 * mes y lo que falta por cobrar. Una factura de taller nace desde la orden;
 * las demás se crean acá.
 */

const ESTADOS: { id: EstadoFactura; label: string; color: string }[] = [
  { id: 'pendiente', label: 'Pendiente', color: 'var(--kzp-ambar)' },
  { id: 'abono', label: 'Abono', color: 'var(--kzp-azul)' },
  { id: 'pagada', label: 'Pagada', color: 'var(--green)' },
];
const estadoDe = (id: EstadoFactura) => ESTADOS.find((e) => e.id === id) ?? ESTADOS[0]!;
const METODOS = ['Efectivo', 'Transferencia BAC', 'Transferencia Atlántida', 'Transferencia Occidente', 'Tigo Money', 'Tarjeta', 'Otro'];

const mesDe = (iso: string) => iso.slice(0, 7);
const esteMes = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Tegucigalpa' }).slice(0, 7);
const mesAnterior = () => {
  const [y, m] = esteMes().split('-').map(Number);
  return `${m === 1 ? y! - 1 : y}-${String(m === 1 ? 12 : m! - 1).padStart(2, '0')}`;
};
export const cobradoEn = (fs: Factura[], mes: string) => fs.filter((f) => f.estado === 'pagada' && f.pagadaAt && mesDe(f.pagadaAt) === mes).reduce((s, f) => s + f.monto, 0);
export const porCobrar = (fs: Factura[]) => fs.filter((f) => f.estado !== 'pagada').reduce((s, f) => s + f.monto, 0);

export function PanelCobros({ onConteo }: { onConteo: (n: number) => void }) {
  const [lista, setLista] = useState<Factura[] | null>(null);
  const [filtro, setFiltro] = useState<'todas' | EstadoFactura>('todas');
  const [nueva, setNueva] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const cargar = () => {
    setError(null);
    panelFacturas()
      .then(setLista)
      .catch((e) => setError(e instanceof Error ? e.message : 'No se pudieron cargar los cobros'));
  };
  useEffect(cargar, []);
  useEffect(() => {
    if (lista) onConteo(lista.filter((f) => f.estado !== 'pagada').length);
  }, [lista, onConteo]);

  const todas = lista ?? [];
  const n = useMemo(() => {
    const mes = esteMes();
    const pagadasMes = todas.filter((f) => f.estado === 'pagada' && f.pagadaAt && mesDe(f.pagadaAt) === mes);
    return {
      cobrado: cobradoEn(todas, mes),
      cobradoAnterior: cobradoEn(todas, mesAnterior()),
      nPagadas: pagadasMes.length,
      pendiente: porCobrar(todas),
      nPendientes: todas.filter((f) => f.estado !== 'pagada').length,
      taller: pagadasMes.filter((f) => f.origen === 'taller').reduce((s, f) => s + f.monto, 0),
      contratos: pagadasMes.filter((f) => f.origen === 'contrato').reduce((s, f) => s + f.monto, 0),
    };
  }, [todas]);
  const delta = n.cobradoAnterior ? Math.round(((n.cobrado - n.cobradoAnterior) / n.cobradoAnterior) * 100) : null;
  const visibles = todas.filter((f) => filtro === 'todas' || f.estado === filtro);

  async function editar(f: Factura, d: FacturaDatos, aviso?: string) {
    try {
      const x = await panelEditarFactura(f.id, d);
      setLista((l) => (l ?? []).map((y) => (y.id === x.id ? x : y)));
      if (aviso) toast.success(aviso);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar');
    }
  }
  async function crear(d: FacturaDatos) {
    try {
      const f = await panelCrearFactura(d);
      setLista((l) => [f, ...(l ?? [])]);
      setNueva(false);
      toast.success(`Factura ${f.num} creada.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo crear');
    }
  }
  async function borrar(f: Factura) {
    try {
      await panelBorrarFactura(f.id);
      setLista((l) => (l ?? []).filter((y) => y.id !== f.id));
      toast.success(`${f.num} borrada.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo borrar');
    }
  }

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="kzp-titulo">Cobros y facturación</h2>
          <p className="kzp-sub">Lo cobrado del mes, lo que falta y el comprobante de cada pago.</p>
        </div>
        <Button onClick={() => setNueva(true)}><Plus /> Nueva factura</Button>
      </div>
      {error && <AvisoError error={error} onReintentar={cargar} />}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {!lista && !error ? (
          Array.from({ length: 4 }, (_, i) => <div key={i} className="kzp-esqueleto h-[108px]" />)
        ) : !lista ? null : (
          <>
            <Stat titulo="Cobrado este mes" valor={lempiras(n.cobrado)} nota={`${n.nPagadas} factura${n.nPagadas === 1 ? '' : 's'}${delta !== null ? ` · ${delta >= 0 ? '+' : ''}${delta}% vs. anterior` : ''}`} tono="var(--green)" onClick={() => setFiltro('pagada')} />
            <Stat titulo="Por cobrar" valor={lempiras(n.pendiente)} nota={`${n.nPendientes} pendiente${n.nPendientes === 1 ? '' : 's'}`} tono="var(--kzp-ambar)" onClick={() => setFiltro('pendiente')} />
            <Stat titulo="Taller" valor={lempiras(n.taller)} nota="reparaciones cobradas del mes" tono="var(--kzp-violeta)" onClick={() => setFiltro('todas')} />
            <Stat titulo="Contratos" valor={lempiras(n.contratos)} nota="web, software, marketing y cámaras" tono="var(--kzp-azul)" onClick={() => setFiltro('todas')} />
          </>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button onClick={() => setFiltro('todas')} aria-pressed={filtro === 'todas'} className={`kz-tab ${filtro === 'todas' ? 'kz-tab-activa' : ''}`}>Todas</button>
        {ESTADOS.map((e) => (
          <button key={e.id} onClick={() => setFiltro(e.id)} aria-pressed={filtro === e.id} className={`kz-tab inline-flex items-center gap-1.5 ${filtro === e.id ? 'kz-tab-activa' : ''}`}>
            <span className="h-2 w-2 rounded-full" style={{ background: e.color }} /> {e.label}
          </button>
        ))}
      </div>

      {lista && visibles.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-border p-10 text-center">
          <Receipt className="mx-auto text-muted-foreground" size={26} />
          <p className="mt-3 text-lg font-bold">{todas.length ? 'Nada con ese filtro' : 'Sin facturas todavía'}</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">Las de taller nacen desde la orden ("Facturar saldo"); las demás, con el botón de arriba.</p>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-background">
          <table className="w-full min-w-[760px] text-[13px]">
            <thead className="bg-muted text-left text-[11.5px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5">Factura</th><th className="px-4 py-2.5">Cliente</th><th className="px-4 py-2.5">Concepto</th><th className="px-4 py-2.5 text-right">Monto</th><th className="px-4 py-2.5">Estado</th><th className="px-4 py-2.5">Comprobante</th><th />
              </tr>
            </thead>
            <tbody>
              {visibles.map((f) => <FilaFactura key={f.id} f={f} onEditar={(d, a) => editar(f, d, a)} onBorrar={() => borrar(f)} />)}
            </tbody>
          </table>
        </div>
      )}

      <NuevaFactura abierta={nueva} onCerrar={() => setNueva(false)} onCrear={crear} />
    </section>
  );
}

function Stat({ titulo, valor, nota, tono, onClick }: { titulo: string; valor: string; nota: string; tono: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="kzp-kpi" style={{ '--kzp-tono': tono } as CSSProperties}>
      <span className="kzp-kpi-titulo"><span className="h-2 w-2 rounded-full" style={{ background: tono }} /> {titulo}</span>
      <span className="kzp-kpi-valor !text-[26px]">{valor}</span>
      <span className="kzp-kpi-nota">{nota}</span>
    </button>
  );
}

function FilaFactura({ f, onEditar, onBorrar }: { f: Factura; onEditar: (d: FacturaDatos, aviso?: string) => Promise<void>; onBorrar: () => void }) {
  const e = estadoDe(f.estado);
  const [subiendo, setSubiendo] = useState(false);
  const fecha = new Date(f.createdAt).toLocaleDateString('es-HN', { timeZone: 'America/Tegucigalpa', day: 'numeric', month: 'short' });
  return (
    <tr className="border-t border-border align-top">
      <td className="px-4 py-3">
        <span className="font-mono font-semibold">{f.num}</span>
        <span className="block text-[11.5px] text-muted-foreground">{fecha}{f.vence ? ` · vence ${f.vence}` : ''}</span>
      </td>
      <td className="px-4 py-3">{f.cliente}<span className="block text-[11.5px] text-muted-foreground">{f.telefono ?? ''}</span></td>
      <td className="px-4 py-3">{f.concepto}<span className="block text-[11.5px] text-muted-foreground">{f.origen === 'taller' ? 'Taller' : f.origen === 'contrato' ? 'Contrato' : ''}</span></td>
      <td className="px-4 py-3 text-right font-mono font-semibold">{lempiras(f.monto)}</td>
      <td className="px-4 py-3">
        <Select value={f.estado} onValueChange={(v) => onEditar({ estado: v as EstadoFactura }, v === 'pagada' ? `${f.num} cobrada.` : undefined)}>
          <SelectTrigger aria-label="Estado" className="h-8 w-auto rounded-full text-[12px] font-semibold" style={{ borderColor: e.color, color: e.color, background: `color-mix(in srgb, ${e.color} 12%, var(--bg))` }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>{ESTADOS.map((x) => <SelectItem key={x.id} value={x.id}>{x.label}</SelectItem>)}</SelectContent>
        </Select>
        {f.estado !== 'pendiente' && (
          <Select value={f.metodo ?? '__'} onValueChange={(v) => onEditar({ metodo: v === '__' ? null : v })}>
            <SelectTrigger aria-label="Método" className="mt-1.5 h-7 w-auto text-[11.5px]"><SelectValue placeholder="Método" /></SelectTrigger>
            <SelectContent><SelectItem value="__">Sin método</SelectItem>{METODOS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
        )}
      </td>
      <td className="px-4 py-3">
        {f.comprobanteUrl ? (
          <Button variant="outline" size="sm" asChild><a href={f.comprobanteUrl} target="_blank" rel="noreferrer"><ExternalLink /> Ver</a></Button>
        ) : subiendo ? (
          <div className="w-64"><SubirImagen url={null} onSubida={(u) => { void onEditar({ comprobanteUrl: u }, 'Comprobante guardado'); setSubiendo(false); }} etiqueta="Subir" ayuda="Captura de la transferencia." /></div>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setSubiendo(true)}><Upload /> Subir</Button>
        )}
      </td>
      <td className="px-2 py-3">
        <AlertDialog>
          <AlertDialogTrigger asChild><Button variant="ghost" size="icon" aria-label={`Borrar ${f.num}`} className="text-muted-foreground hover:text-destructive"><Trash2 /></Button></AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>¿Borrar la factura {f.num}?</AlertDialogTitle><AlertDialogDescription>Desaparece de los totales. No se puede deshacer.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={onBorrar} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Borrar</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </td>
    </tr>
  );
}

function NuevaFactura({ abierta, onCerrar, onCrear }: { abierta: boolean; onCerrar: () => void; onCrear: (d: FacturaDatos) => Promise<void> }) {
  const vacio: FacturaDatos = { cliente: '', telefono: '', concepto: '', monto: 0, estado: 'pendiente', origen: 'otro', vence: null, metodo: null };
  const [d, setD] = useState<FacturaDatos>(vacio);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (abierta) setD(vacio); }, [abierta]); // eslint-disable-line react-hooks/exhaustive-deps
  const listo = (d.cliente ?? '').trim().length >= 2 && (d.concepto ?? '').trim().length >= 2 && (d.monto ?? 0) > 0;

  return (
    <Dialog open={abierta} onOpenChange={(ab) => !ab && onCerrar()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva factura</DialogTitle>
          <DialogDescription>El número se asigna solo (F-0001, F-0002…).</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!listo) return;
            setBusy(true);
            await onCrear({ ...d, telefono: d.telefono || null, vence: d.vence || null });
            setBusy(false);
          }}
        >
          <div className="space-y-1.5"><Label htmlFor="nf-cliente">Cliente</Label><Input id="nf-cliente" value={d.cliente ?? ''} onChange={(e) => setD({ ...d, cliente: e.target.value })} required /></div>
          <div className="space-y-1.5"><Label htmlFor="nf-tel">WhatsApp</Label><Input id="nf-tel" value={d.telefono ?? ''} onChange={(e) => setD({ ...d, telefono: e.target.value })} inputMode="tel" type="tel" /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="nf-concepto">Concepto</Label><Input id="nf-concepto" value={d.concepto ?? ''} onChange={(e) => setD({ ...d, concepto: e.target.value })} placeholder="Instalación 4 cámaras · 50 % restante" required /></div>
          <div className="space-y-1.5"><Label htmlFor="nf-monto">Monto (L)</Label><Input id="nf-monto" value={d.monto ? String(d.monto) : ''} onChange={(e) => setD({ ...d, monto: Number(e.target.value) || 0 })} inputMode="decimal" className="font-mono" required /></div>
          <div className="space-y-1.5">
            <Label>Origen</Label>
            <Select value={d.origen ?? 'otro'} onValueChange={(v) => setD({ ...d, origen: v as Factura['origen'] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="contrato">Contrato (web, software, marketing, cámaras)</SelectItem><SelectItem value="taller">Taller</SelectItem><SelectItem value="otro">Otro</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Estado</Label>
            <Select value={d.estado ?? 'pendiente'} onValueChange={(v) => setD({ ...d, estado: v as EstadoFactura })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{ESTADOS.map((x) => <SelectItem key={x.id} value={x.id}>{x.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label htmlFor="nf-vence">Vence</Label><Input id="nf-vence" type="date" value={d.vence ?? ''} onChange={(e) => setD({ ...d, vence: e.target.value || null })} /></div>
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={onCerrar}>Cancelar</Button>
            <Button type="submit" disabled={!listo || busy}>{busy ? 'Creando…' : 'Crear factura'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
