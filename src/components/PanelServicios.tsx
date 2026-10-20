import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Camera, ChevronDown, Code2, ExternalLink, Globe, Megaphone, Package, Plus, Trash2 } from 'lucide-react';
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
import {
  lempiras, panelBorrarContrato, panelContratos, panelCrearContrato, panelEditarContrato, panelVisitas,
  type CamaraContrato, type CategoriaContrato, type Contrato, type ContratoDatos, type Visita,
} from '@/lib/api';

/**
 * Los servicios contratados, por categoría: web y apps, IA y software,
 * marketing, cámaras y compra-venta de equipo. Cada uno con su fase, su
 * avance, su monto y su estado. Las instalaciones de cámaras llevan la tabla
 * cámara por cámara (dónde va, modelo, metros de cable, canal) y se enlazan
 * con la ficha y bitácora de su visita.
 */

export const CATEGORIAS: { id: CategoriaContrato; label: string; Icono: typeof Globe; fases: string[] }[] = [
  { id: 'web', label: 'Web y apps', Icono: Globe, fases: ['Propuesta', 'Diseño', 'Desarrollo', 'Revisión', 'Entregado'] },
  { id: 'software', label: 'IA y software', Icono: Code2, fases: ['Propuesta', 'Diseño', 'Desarrollo', 'Pruebas', 'Entregado'] },
  { id: 'marketing', label: 'Marketing', Icono: Megaphone, fases: ['Mes 1', 'Mes 2', 'Mes 3', 'Renovación'] },
  { id: 'camaras', label: 'Cámaras', Icono: Camera, fases: ['Cotizada', 'Programada', 'Instalada', 'Garantía'] },
  { id: 'equipo', label: 'Compra y venta', Icono: Package, fases: ['Revisión', 'Probada', 'Publicada', 'Vendida'] },
];
const ESTADOS = ['Por aprobar', 'En curso', 'Activo', 'Entregado', 'Soporte 30 días', 'Pausado', 'Disponible', 'Por pagar', 'Vendido'];
const cat = (id: CategoriaContrato) => CATEGORIAS.find((c) => c.id === id) ?? CATEGORIAS[0]!;
const tonoEstado = (estado: string, pct: number) =>
  pct >= 100 || /entregado|vendido|instalada/i.test(estado) ? 'var(--green)' : /por aprobar|por pagar|pausado/i.test(estado) ? 'var(--kzp-ambar)' : 'var(--kzp-azul)';

export function PanelServicios({ onConteo }: { onConteo: (n: number) => void }) {
  const [lista, setLista] = useState<Contrato[] | null>(null);
  const [tab, setTab] = useState<CategoriaContrato>('web');
  const [abierto, setAbierto] = useState<string | null>(null);
  const [nuevo, setNuevo] = useState(false);
  const [visitas, setVisitas] = useState<Visita[]>([]);

  const [error, setError] = useState<string | null>(null);
  const cargar = () => {
    setError(null);
    panelContratos()
      .then(setLista)
      .catch((e) => setError(e instanceof Error ? e.message : 'No se pudieron cargar los servicios'));
  };
  useEffect(cargar, []);
  useEffect(() => {
    panelVisitas().then((v) => setVisitas(v.filter((x) => x.estado !== 'cancelada'))).catch(() => {});
  }, []);
  useEffect(() => {
    if (lista) onConteo(lista.filter((c) => c.pct < 100 && !/entregado|vendido/i.test(c.estado)).length);
  }, [lista, onConteo]);

  const todos = lista ?? [];
  const porCat = useMemo(() => Object.fromEntries(CATEGORIAS.map((c) => [c.id, todos.filter((x) => x.categoria === c.id)])) as Record<CategoriaContrato, Contrato[]>, [todos]);
  const visibles = porCat[tab];

  async function editar(c: Contrato, d: ContratoDatos, aviso?: string) {
    try {
      const n = await panelEditarContrato(c.id, d);
      setLista((l) => (l ?? []).map((x) => (x.id === n.id ? n : x)));
      if (aviso) toast.success(aviso);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar');
    }
  }
  async function crear(d: ContratoDatos) {
    try {
      const c = await panelCrearContrato(d);
      setLista((l) => [c, ...(l ?? [])]);
      setNuevo(false);
      setTab(c.categoria);
      setAbierto(c.id);
      toast.success('Servicio creado.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo crear');
    }
  }
  async function borrar(c: Contrato) {
    try {
      await panelBorrarContrato(c.id);
      setLista((l) => (l ?? []).filter((x) => x.id !== c.id));
      toast.success('Servicio borrado.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo borrar');
    }
  }

  const activa = cat(tab);

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="kzp-titulo">Servicios</h2>
          <p className="kzp-sub">Lo que ya está contratado, por línea de negocio: fase, avance, monto y estado de cada uno.</p>
        </div>
        <Button onClick={() => setNuevo(true)}><Plus /> Nuevo contrato</Button>
      </div>
      {error && <AvisoError error={error} onReintentar={cargar} />}

      <div className="flex flex-wrap gap-2">
        {CATEGORIAS.map((c) => (
          <button key={c.id} onClick={() => setTab(c.id)} aria-pressed={tab === c.id} className={`kz-tab inline-flex items-center gap-1.5 ${tab === c.id ? 'kz-tab-activa' : ''}`}>
            <c.Icono size={14} /> {c.label}
            <span className="font-mono text-[11.5px] opacity-70">{porCat[c.id].length}</span>
          </button>
        ))}
      </div>

      {!lista && !error ? (
        <div className="mt-4 space-y-2">{Array.from({ length: 2 }, (_, i) => <div key={i} className="kzp-esqueleto h-[84px]" />)}</div>
      ) : !lista ? null : visibles.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-border p-10 text-center">
          <activa.Icono className="mx-auto text-muted-foreground" size={26} />
          <p className="mt-3 text-lg font-bold">Nada en {activa.label.toLowerCase()} todavía</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">Cuando cierres uno, creá el contrato y seguí su avance desde acá.</p>
          <Button variant="outline" className="mt-4" onClick={() => setNuevo(true)}><Plus /> Nuevo contrato</Button>
        </div>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {visibles.map((c) => (
            <li key={c.id} className="kz-card overflow-hidden">
              <button onClick={() => setAbierto(abierto === c.id ? null : c.id)} className="flex w-full flex-wrap items-center gap-4 p-4 text-left" aria-expanded={abierto === c.id}>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground"><activa.Icono size={20} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14.5px] font-semibold">{c.titulo}</span>
                  <span className="block truncate text-[12.5px] text-muted-foreground">{c.cliente}{c.detalle ? ` · ${c.detalle}` : ''}</span>
                  <span className="mt-2 flex items-center gap-2">
                    <span className="text-[11.5px] text-muted-foreground">{c.fase ?? 'Sin fase'}</span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-primary" style={{ width: `${c.pct}%` }} /></span>
                    <span className="font-mono text-[11.5px] text-muted-foreground">{c.pct}%</span>
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  <span className="font-mono text-[14px] font-bold">{lempiras(c.monto)}{c.categoria === 'marketing' ? <span className="text-[11px] font-normal text-muted-foreground">/mes</span> : null}</span>
                  <span className="kzp-chip" style={{ '--kzp-tono': tonoEstado(c.estado, c.pct) } as CSSProperties}>{c.estado}</span>
                  <ChevronDown size={16} className={`text-muted-foreground transition-transform ${abierto === c.id ? 'rotate-180' : ''}`} />
                </span>
              </button>
              {abierto === c.id && <Editor key={c.updatedAt} c={c} visitas={visitas} onEditar={(d, a) => editar(c, d, a)} onBorrar={() => borrar(c)} />}
            </li>
          ))}
        </ul>
      )}

      <NuevoContrato abierta={nuevo} categoria={tab} onCerrar={() => setNuevo(false)} onCrear={crear} />
    </section>
  );
}

function Editor({ c, visitas, onEditar, onBorrar }: { c: Contrato; visitas: Visita[]; onEditar: (d: ContratoDatos, aviso?: string) => Promise<void>; onBorrar: () => void }) {
  const k = cat(c.categoria);
  const [f, setF] = useState<ContratoDatos>({
    titulo: c.titulo, cliente: c.cliente, telefono: c.telefono ?? '', detalle: c.detalle ?? '', fase: c.fase ?? '', pct: c.pct, monto: c.monto, estado: c.estado,
    contratoUrl: c.contratoUrl ?? '', dvr: c.dvr ?? '', notasTecnico: c.notasTecnico ?? '', camaras: c.camaras, visitaId: c.visitaId,
  });
  const cambio = JSON.stringify(f) !== JSON.stringify({
    titulo: c.titulo, cliente: c.cliente, telefono: c.telefono ?? '', detalle: c.detalle ?? '', fase: c.fase ?? '', pct: c.pct, monto: c.monto, estado: c.estado,
    contratoUrl: c.contratoUrl ?? '', dvr: c.dvr ?? '', notasTecnico: c.notasTecnico ?? '', camaras: c.camaras, visitaId: c.visitaId,
  });
  const set = (p: ContratoDatos) => setF({ ...f, ...p });
  const cams = f.camaras ?? [];
  const setCam = (i: number, p: Partial<CamaraContrato>) => set({ camaras: cams.map((x, j) => (j === i ? { ...x, ...p } : x)) });

  return (
    <div className="border-t border-border bg-muted/40 p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Campo etiqueta="Título" className="lg:col-span-2"><Input value={f.titulo ?? ''} onChange={(e) => set({ titulo: e.target.value })} /></Campo>
        <Campo etiqueta="Cliente"><Input value={f.cliente ?? ''} onChange={(e) => set({ cliente: e.target.value })} /></Campo>
        <Campo etiqueta="WhatsApp"><Input value={f.telefono ?? ''} onChange={(e) => set({ telefono: e.target.value })} inputMode="tel" /></Campo>
        <Campo etiqueta="Detalle" className="sm:col-span-2 lg:col-span-4"><Input value={f.detalle ?? ''} onChange={(e) => set({ detalle: e.target.value })} placeholder="Qué incluye, en una línea" /></Campo>
        <Campo etiqueta="Fase">
          <Select value={f.fase || '__'} onValueChange={(v) => set({ fase: v === '__' ? '' : v })}>
            <SelectTrigger><SelectValue placeholder="Fase" /></SelectTrigger>
            <SelectContent><SelectItem value="__">Sin fase</SelectItem>{[...new Set([...k.fases, ...(f.fase ? [f.fase] : [])])].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
          </Select>
        </Campo>
        <Campo etiqueta={`Avance · ${f.pct}%`}>
          <input type="range" min={0} max={100} step={5} value={f.pct ?? 0} onChange={(e) => set({ pct: Number(e.target.value) })} className="mt-3 w-full accent-[var(--green)]" aria-label="Avance" />
        </Campo>
        <Campo etiqueta={c.categoria === 'marketing' ? 'Monto mensual (L)' : 'Monto (L)'}><Input value={String(f.monto ?? 0)} onChange={(e) => set({ monto: Number(e.target.value) || 0 })} inputMode="decimal" className="font-mono" /></Campo>
        <Campo etiqueta="Estado">
          <Select value={f.estado ?? 'En curso'} onValueChange={(estado) => set({ estado })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{[...new Set([...ESTADOS, ...(f.estado ? [f.estado] : [])])].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
          </Select>
        </Campo>
        <Campo etiqueta="Contrato firmado (enlace)" className="sm:col-span-2 lg:col-span-4">
          <div className="flex gap-2">
            <Input value={f.contratoUrl ?? ''} onChange={(e) => set({ contratoUrl: e.target.value })} placeholder="PandaDoc o PDF" inputMode="url" />
            {c.contratoUrl && <Button variant="outline" size="icon" asChild><a href={c.contratoUrl} target="_blank" rel="noreferrer" aria-label="Abrir contrato"><ExternalLink /></a></Button>}
          </div>
        </Campo>
      </div>

      {c.categoria === 'camaras' && (
        <div className="mt-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo etiqueta="Grabador (DVR/NVR)"><Input value={f.dvr ?? ''} onChange={(e) => set({ dvr: e.target.value })} placeholder="Hikvision 8 ch" /></Campo>
            <Campo etiqueta="Visita e instalación (ficha y bitácora)">
              <Select value={f.visitaId ?? '__'} onValueChange={(v) => set({ visitaId: v === '__' ? null : v })}>
                <SelectTrigger><SelectValue placeholder="Sin enlazar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__">Sin enlazar</SelectItem>
                  {visitas.map((v) => <SelectItem key={v.id} value={v.id}>{v.nombre} · {v.municipio ?? 'local'} · {v.estado}</SelectItem>)}
                </SelectContent>
              </Select>
            </Campo>
          </div>
          <p className="kz-eyebrow mt-4">// cámaras · {cams.length} · {cams.reduce((s, x) => s + Number(x.cable || 0), 0)} m de cable</p>
          <div className="mt-2 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[560px] text-[13px]">
              <thead className="bg-muted text-left text-[11.5px] uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-3 py-2">N°</th><th className="px-3 py-2">Ubicación</th><th className="px-3 py-2">Modelo</th><th className="px-3 py-2">Cable (m)</th><th className="px-3 py-2">Canal</th><th /></tr>
              </thead>
              <tbody>
                {cams.map((x, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-2 py-1 font-mono">{String(x.n).padStart(2, '0')}</td>
                    <td className="px-2 py-1"><Input value={x.ubicacion} onChange={(e) => setCam(i, { ubicacion: e.target.value })} className="h-8" placeholder="Entrada principal" /></td>
                    <td className="px-2 py-1"><Input value={x.modelo} onChange={(e) => setCam(i, { modelo: e.target.value })} className="h-8" placeholder="Bullet 5 MP" /></td>
                    <td className="px-2 py-1"><Input value={String(x.cable)} onChange={(e) => setCam(i, { cable: Number(e.target.value) || 0 })} className="h-8 w-20 font-mono" inputMode="decimal" /></td>
                    <td className="px-2 py-1"><Input value={String(x.canal)} onChange={(e) => setCam(i, { canal: Number(e.target.value) || 0 })} className="h-8 w-16 font-mono" inputMode="numeric" /></td>
                    <td className="px-2 py-1"><button onClick={() => set({ camaras: cams.filter((_, j) => j !== i).map((y, j) => ({ ...y, n: j + 1 })) })} className="text-muted-foreground hover:text-destructive" aria-label="Quitar cámara"><Trash2 size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => set({ camaras: [...cams, { n: cams.length + 1, ubicacion: '', modelo: '', cable: 0, canal: cams.length + 1 }] })}><Plus /> Agregar cámara</Button>
          <Campo etiqueta="Notas del técnico" className="mt-4">
            <Textarea rows={3} value={f.notasTecnico ?? ''} onChange={(e) => set({ notasTecnico: e.target.value })} placeholder="Dónde quedó el DVR, UPS, ángulos, lo que hay que saber al volver." />
          </Campo>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <Button disabled={!cambio} onClick={() => onEditar({ ...f, telefono: f.telefono || null, detalle: f.detalle || null, fase: f.fase || null, contratoUrl: f.contratoUrl || null, dvr: f.dvr || null, notasTecnico: f.notasTecnico || null }, 'Servicio guardado')}>Guardar</Button>
        <AlertDialog>
          <AlertDialogTrigger asChild><Button variant="ghost" className="ml-auto text-destructive hover:text-destructive"><Trash2 /> Borrar</Button></AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>¿Borrar "{c.titulo}"?</AlertDialogTitle><AlertDialogDescription>No se puede deshacer. Si terminó, mejor marcalo como entregado.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={onBorrar} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Borrar</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function Campo({ etiqueta, className = '', children }: { etiqueta: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block space-y-1.5 ${className}`}>
      <Label asChild><span className="text-muted-foreground">{etiqueta}</span></Label>
      {children}
    </label>
  );
}

function NuevoContrato({ abierta, categoria, onCerrar, onCrear }: { abierta: boolean; categoria: CategoriaContrato; onCerrar: () => void; onCrear: (d: ContratoDatos) => Promise<void> }) {
  const [d, setD] = useState<ContratoDatos>({ categoria, titulo: '', cliente: '', telefono: '', detalle: '', monto: 0, estado: 'En curso', pct: 0 });
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (abierta) setD({ categoria, titulo: '', cliente: '', telefono: '', detalle: '', monto: 0, estado: 'En curso', pct: 0, fase: cat(categoria).fases[0] }); }, [abierta, categoria]);
  const listo = (d.titulo ?? '').trim().length >= 2 && (d.cliente ?? '').trim().length >= 2;
  const k = cat(d.categoria ?? categoria);

  return (
    <Dialog open={abierta} onOpenChange={(ab) => !ab && onCerrar()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo contrato</DialogTitle>
          <DialogDescription>Un servicio que ya se cerró. El avance y los detalles se editan después.</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!listo) return;
            setBusy(true);
            await onCrear({ ...d, telefono: d.telefono || null, detalle: d.detalle || null });
            setBusy(false);
          }}
        >
          <Campo etiqueta="Categoría">
            <Select value={d.categoria} onValueChange={(v) => setD({ ...d, categoria: v as CategoriaContrato, fase: cat(v as CategoriaContrato).fases[0] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIAS.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}</SelectContent>
            </Select>
          </Campo>
          <Campo etiqueta="Fase">
            <Select value={d.fase ?? k.fases[0]!} onValueChange={(fase) => setD({ ...d, fase })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{k.fases.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
            </Select>
          </Campo>
          <Campo etiqueta="Título" className="sm:col-span-2"><Input value={d.titulo ?? ''} onChange={(e) => setD({ ...d, titulo: e.target.value })} placeholder="Tienda en línea, 8 cámaras + DVR…" required /></Campo>
          <Campo etiqueta="Cliente"><Input value={d.cliente ?? ''} onChange={(e) => setD({ ...d, cliente: e.target.value })} required /></Campo>
          <Campo etiqueta="WhatsApp"><Input value={d.telefono ?? ''} onChange={(e) => setD({ ...d, telefono: e.target.value })} inputMode="tel" type="tel" /></Campo>
          <Campo etiqueta="Detalle" className="sm:col-span-2"><Input value={d.detalle ?? ''} onChange={(e) => setD({ ...d, detalle: e.target.value })} placeholder="Catálogo, carrito y pagos" /></Campo>
          <Campo etiqueta={d.categoria === 'marketing' ? 'Monto mensual (L)' : 'Monto (L)'}><Input value={String(d.monto ?? 0)} onChange={(e) => setD({ ...d, monto: Number(e.target.value) || 0 })} inputMode="decimal" className="font-mono" /></Campo>
          <Campo etiqueta="Estado">
            <Select value={d.estado ?? 'En curso'} onValueChange={(estado) => setD({ ...d, estado })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{ESTADOS.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
            </Select>
          </Campo>
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={onCerrar}>Cancelar</Button>
            <Button type="submit" disabled={!listo || busy}>{busy ? 'Creando…' : 'Crear'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
