'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Bot,
  CalendarDays,
  CreditCard,
  Eye,
  EyeOff,
  FolderKanban,
  Home,
  Layers,
  Loader2,
  NotebookPen,
  MoreHorizontal,
  Sparkles,
  ImageIcon,
  LogOut,
  MessageSquareQuote,
  Moon,
  Pencil,
  Plus,
  Search,
  Sun,
  Trash2,
  Star,
  UserCog,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { PanelAsistente } from '@/components/PanelAsistente';
import { PanelBuscar } from '@/components/PanelBuscar';
import { PanelCobros } from '@/components/PanelCobros';
import { PanelServicios } from '@/components/PanelServicios';
import { PanelTaller } from '@/components/PanelTaller';
import { PanelHoy } from '@/components/PanelHoy';
import { PanelLeads } from '@/components/PanelLeads';
import { PanelStaff } from '@/components/PanelStaff';
import { PanelVisitas } from '@/components/PanelVisitas';
import { SubirImagen } from '@/components/SubirImagen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { miniatura } from '@/lib/upload';
import {
  API_URL,
  clearPanelToken,
  getPanelToken,
  panelDeleteProject,
  panelDeleteTestimonial,
  panelLogin,
  panelMe,
  panelProjects,
  panelSaveProject,
  panelSaveTestimonial,
  panelTestimonials,
  type PanelUser,
} from '@/lib/api';
import type { Project, Testimonial } from '@/types';

/**
 * Panel de Kizercode, edición 2026.
 *
 * Corre entero en el navegador contra la API — el sitio es estático. El token
 * vive en sessionStorage: se va al cerrar la pestaña.
 *
 * Estructura de producto: barra lateral en escritorio, barra inferior en el
 * teléfono, búsqueda global con Ctrl K y una vista "Hoy" que dice qué
 * atender. Misma línea gráfica del sitio (Poppins, verde, navy, claro y
 * oscuro): los estilos propios viven en styles/panel.css bajo .kz-panel.
 */
export default function Panel() {
  const [user, setUser] = useState<PanelUser | null>(null);
  const [cargando, setCargando] = useState(true);

  // Si quedó un token de antes, se comprueba contra la API en vez de confiar.
  useEffect(() => {
    if (!getPanelToken()) return setCargando(false);
    panelMe()
      .then(setUser)
      .catch(() => clearPanelToken())
      .finally(() => setCargando(false));
  }, []);

  return (
    <TooltipProvider delayDuration={300}>
      {cargando ? (
        <Centrado>{<Cargando />}</Centrado>
      ) : !user ? (
        <Login onEntrar={setUser} />
      ) : (
        <Escritorio
          user={user}
          onSalir={() => {
            clearPanelToken();
            setUser(null);
          }}
        />
      )}
      <Toaster />
    </TooltipProvider>
  );
}

function Centrado({ children }: { children: React.ReactNode }) {
  return <div className="grid min-h-dvh place-items-center px-4">{children}</div>;
}

function Cargando() {
  return (
    <p className="kz-eyebrow flex items-center gap-2">
      <span className="kz-latido" />
      cargando
    </p>
  );
}

// ── Marca ──

/** El logo de Kizercode, el mismo del sitio: claro u oscuro según el tema. */
function Logo({ alto = 36, className = '' }: { alto?: number; className?: string }) {
  const ancho = Math.round(alto * 3);
  return (
    <span className={`inline-flex shrink-0 ${className}`}>
      <img data-logo-light="1" src="/logo-claro.webp" alt="Kizercode" width={ancho} height={alto} style={{ height: alto, width: ancho }} className="object-contain object-left" />
      <img data-logo-dark="1" src="/logo-oscuro.webp" alt="Kizercode" width={ancho} height={alto} style={{ height: alto, width: ancho }} className="object-contain object-left" />
    </span>
  );
}

// ── Tema: el mismo toggle del sitio, sin la cortina ──

function usarTema() {
  const [tema, setTema] = useState<'light' | 'dark'>('light');
  useEffect(() => {
    setTema((document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'light');
  }, []);
  const alternar = () => {
    const siguiente = tema === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', siguiente);
    localStorage.setItem('kz-theme', siguiente);
    setTema(siguiente);
  };
  return { tema, alternar };
}

// ── Escritorio ──

export type Pestana = 'hoy' | 'leads' | 'visitas' | 'taller' | 'servicios' | 'cobros' | 'equipo' | 'asistente' | 'staff' | 'proyectos' | 'testimonios';

const SECCIONES: { id: Pestana; etiqueta: string; corta: string; Icono: typeof Home }[] = [
  { id: 'hoy', etiqueta: 'Hoy', corta: 'Hoy', Icono: Home },
  { id: 'leads', etiqueta: 'Leads y clientes', corta: 'Leads', Icono: Users },
  { id: 'visitas', etiqueta: 'Visitas e instalaciones', corta: 'Visitas', Icono: CalendarDays },
  { id: 'taller', etiqueta: 'Taller', corta: 'Taller', Icono: Wrench },
  { id: 'servicios', etiqueta: 'Servicios', corta: 'Servicios', Icono: Layers },
  { id: 'cobros', etiqueta: 'Cobros', corta: 'Cobros', Icono: CreditCard },
  { id: 'equipo', etiqueta: 'Equipo y sitio', corta: 'Equipo', Icono: UserCog },
  { id: 'asistente', etiqueta: 'Asistente IA', corta: 'IA', Icono: Sparkles },
];
/** En el teléfono caben 4 directos; el resto va en "Más". */
const INFERIOR: Pestana[] = ['hoy', 'leads', 'taller', 'cobros'];
const MAS: Pestana[] = ['visitas', 'servicios', 'equipo', 'asistente'];
/** Staff, proyectos y testimonios viven dentro de "Equipo y sitio". */
const EQUIPO: { id: Pestana; etiqueta: string; Icono: typeof Home }[] = [
  { id: 'staff', etiqueta: 'Mi staff', Icono: UserCog },
  { id: 'proyectos', etiqueta: 'Proyectos publicados', Icono: FolderKanban },
  { id: 'testimonios', etiqueta: 'Testimonios', Icono: MessageSquareQuote },
];
const DENTRO_EQUIPO: Pestana[] = ['staff', 'proyectos', 'testimonios'];

function Escritorio({ user, onSalir }: { user: PanelUser; onSalir: () => void }) {
  const [pestana, setPestana] = useState<Pestana>('hoy');
  const [subEquipo, setSubEquipo] = useState<Pestana>('staff');
  const [buscando, setBuscando] = useState(false);
  const [mas, setMas] = useState(false);
  const [busquedaLeads, setBusquedaLeads] = useState<string | undefined>(undefined);
  const [conteos, setConteos] = useState<Partial<Record<Pestana, number | null>>>({});
  const { tema, alternar } = usarTema();

  const marcar = useCallback((p: Pestana) => (n: number) => setConteos((c) => (c[p] === n ? c : { ...c, [p]: n })), []);
  const ir = useCallback((p: Pestana, q?: string) => {
    // Staff, proyectos y testimonios abren "Equipo y sitio" en su pestaña.
    if (DENTRO_EQUIPO.includes(p)) {
      setSubEquipo(p);
      setPestana('equipo');
    } else setPestana(p);
    if (p === 'leads' && q !== undefined) setBusquedaLeads(q);
    window.scrollTo({ top: 0 });
  }, []);

  // Ctrl K / ⌘K abre la búsqueda desde cualquier parte.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setBuscando((b) => !b);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Las pestañas con cosas por atender llevan el número en ámbar.
  const alerta = useMemo(() => new Set<Pestana>(['leads', 'visitas', 'taller', 'cobros']), []);
  const activa = SECCIONES.find((s) => s.id === pestana)!;

  const Item = ({ s, inferior }: { s: (typeof SECCIONES)[number]; inferior?: boolean }) => {
    const n = conteos[s.id];
    return (
      <button
        onClick={() => ir(s.id)}
        aria-current={pestana === s.id ? 'page' : undefined}
        className={inferior ? 'kzp-inferior-item' : 'kzp-nav-item'}
      >
        <s.Icono size={inferior ? 20 : 17} strokeWidth={1.75} />
        {inferior ? s.corta : s.etiqueta}
        {!inferior && n !== null && n !== undefined && (
          <span className={`kzp-conteo ${alerta.has(s.id) && n > 0 ? 'kzp-conteo-alerta' : ''}`}>{n}</span>
        )}
      </button>
    );
  };

  return (
    <div className="kzp-shell">
      {/* ── Barra lateral (escritorio) ── */}
      <aside className="kzp-side" aria-label="Secciones del panel">
        <div className="mb-5 px-2">
          <Logo alto={40} />
          <p className="kz-eyebrow mt-2 !text-[11px]">// panel</p>
        </div>
        <nav className="flex flex-col gap-1">
          {SECCIONES.map((s) => <Item key={s.id} s={s} />)}
        </nav>
        <div className="mt-auto space-y-2 px-2">
          <p className="flex items-center gap-2 text-[12.5px]" style={{ color: 'var(--color-muted)' }}>
            <span className="kz-latido" /> {user.name}
          </p>
          <button onClick={onSalir} className="kzp-nav-item !min-h-[40px] !px-2 text-[13px]">
            <LogOut size={15} /> Salir
          </button>
        </div>
      </aside>

      {/* ── Contenido ── */}
      <div className="min-w-0">
        <header className="kzp-top">
          <span className="lg:hidden"><Logo alto={30} /></span>
          <div className="hidden min-w-0 lg:block">
            <p className="truncate text-[15px] font-bold tracking-tight">{activa.etiqueta}</p>
          </div>
          <button onClick={() => setBuscando(true)} className="kzp-buscar ml-auto" aria-label="Buscar en el panel (Ctrl K)">
            <Search size={16} />
            <span className="truncate">Buscar lead, visita, persona…</span>
            <kbd className="kzp-kbd hidden sm:inline">Ctrl K</kbd>
          </button>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={alternar} className="kzp-icono-btn" aria-label={tema === 'dark' ? 'Tema claro' : 'Tema oscuro'}>
                {tema === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              </button>
            </TooltipTrigger>
            <TooltipContent>{tema === 'dark' ? 'Tema claro' : 'Tema oscuro'}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={onSalir} className="kzp-icono-btn lg:hidden" aria-label="Salir">
                <LogOut size={17} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Salir</TooltipContent>
          </Tooltip>
        </header>

        <main className="kzp-main">
          <div hidden={pestana !== 'hoy'}>
            {pestana === 'hoy' && <PanelHoy user={user.name} onIr={ir} />}
          </div>
          <div hidden={pestana !== 'leads'} className={pestana === 'leads' ? 'kzp-vista' : ''}>
            <PanelLeads onConteo={marcar('leads')} busqueda={busquedaLeads} />
          </div>
          <div hidden={pestana !== 'visitas'} className={pestana === 'visitas' ? 'kzp-vista' : ''}>
            <PanelVisitas onConteo={marcar('visitas')} />
          </div>
          <div hidden={pestana !== 'taller'} className={pestana === 'taller' ? 'kzp-vista' : ''}>
            <PanelTaller onConteo={marcar('taller')} user={user.name} />
          </div>
          <div hidden={pestana !== 'servicios'} className={pestana === 'servicios' ? 'kzp-vista' : ''}>
            <PanelServicios onConteo={marcar('servicios')} />
          </div>
          <div hidden={pestana !== 'cobros'} className={pestana === 'cobros' ? 'kzp-vista' : ''}>
            <PanelCobros onConteo={marcar('cobros')} />
          </div>
          <div hidden={pestana !== 'asistente'} className={pestana === 'asistente' ? 'kzp-vista' : ''}>
            <PanelAsistente />
          </div>
          <div hidden={pestana !== 'equipo'} className={pestana === 'equipo' ? 'kzp-vista' : ''}>
            <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Equipo y sitio">
              {EQUIPO.map((t) => (
                <button key={t.id} role="tab" aria-selected={subEquipo === t.id} onClick={() => setSubEquipo(t.id)} className={`kz-tab inline-flex items-center gap-1.5 ${subEquipo === t.id ? 'kz-tab-activa' : ''}`}>
                  <t.Icono size={14} /> {t.etiqueta}
                  {conteos[t.id] !== null && conteos[t.id] !== undefined && <span className="font-mono text-[11.5px] opacity-70">{conteos[t.id]}</span>}
                </button>
              ))}
            </div>
            <div hidden={subEquipo !== 'staff'}><PanelStaff onConteo={marcar('staff')} /></div>
            <div hidden={subEquipo !== 'proyectos'}><Proyectos onConteo={marcar('proyectos')} /></div>
            <div hidden={subEquipo !== 'testimonios'}><Testimonios onConteo={marcar('testimonios')} /></div>
          </div>
        </main>
      </div>

      {/* ── Barra inferior (teléfono): 4 destinos directos y "Más" ── */}
      <nav className="kzp-inferior" aria-label="Secciones del panel">
        {SECCIONES.filter((s) => INFERIOR.includes(s.id)).map((s) => <Item key={s.id} s={s} inferior />)}
        <button onClick={() => setMas(true)} className="kzp-inferior-item" aria-current={MAS.includes(pestana) ? 'page' : undefined} aria-haspopup="dialog">
          <MoreHorizontal size={20} strokeWidth={1.75} /> Más
        </button>
      </nav>
      <Dialog open={mas} onOpenChange={setMas}>
        <DialogContent className="max-w-xs rounded-2xl">
          <DialogHeader><DialogTitle>Más secciones</DialogTitle></DialogHeader>
          <div className="grid gap-1">
            {SECCIONES.filter((s) => MAS.includes(s.id)).map((s) => (
              <button key={s.id} onClick={() => { ir(s.id); setMas(false); }} aria-current={pestana === s.id ? 'page' : undefined} className="kzp-nav-item">
                <s.Icono size={17} strokeWidth={1.75} /> {s.etiqueta}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <PanelBuscar abierta={buscando} onCerrar={() => setBuscando(false)} onIr={ir} />
    </div>
  );
}

// ── Piezas compartidas ──

function Campo({ etiqueta, ayuda, children }: { etiqueta: string; ayuda?: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="text-muted-foreground">{etiqueta}</span>
      <div className="mt-1.5">{children}</div>
      {ayuda && <span className="mt-1 block text-[11.5px] text-muted-foreground">{ayuda}</span>}
    </label>
  );
}

function Interruptor({
  activo,
  onCambio,
  etiqueta,
  ayuda,
}: {
  activo: boolean;
  onCambio: (v: boolean) => void;
  etiqueta: string;
  ayuda: string;
}) {
  return (
    <Label
      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition-colors ${activo ? 'border-ring bg-accent/60' : 'border-border bg-muted'}`}
    >
      <Switch checked={activo} onCheckedChange={onCambio} className="mt-0.5" />
      <span>
        <span className="font-semibold">{etiqueta}</span>
        <span className="mt-0.5 block text-[11.5px] font-normal text-muted-foreground">{ayuda}</span>
      </span>
    </Label>
  );
}

function Etiqueta({ texto, tono }: { texto: string; tono: 'borrador' | 'destacado' }) {
  const estilos =
    tono === 'borrador'
      ? { background: 'rgba(255,107,53,0.15)', color: '#ff6b35' }
      : { background: 'color-mix(in srgb, var(--color-accent) 18%, transparent)', color: 'var(--color-accent)' };
  return (
    <span
      className="rounded px-2 py-0.5 font-mono text-[10.5px] font-normal uppercase tracking-wider"
      style={estilos}
    >
      {texto}
    </span>
  );
}

function Vacio({ titulo, texto, onCrear, cta }: { titulo: string; texto: string; onCrear: () => void; cta: string }) {
  return (
    <div
      className="rounded-2xl border border-dashed p-10 text-center"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <p className="kz-eyebrow">// vacío</p>
      <p className="mt-3 text-lg font-bold">{titulo}</p>
      <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: 'var(--color-muted)' }}>
        {texto}
      </p>
      <Button onClick={onCrear} size="lg" className="mt-6"><Plus /> {cta}</Button>
    </div>
  );
}

function BarraFormulario({
  titulo,
  onCerrar,
}: {
  titulo: string;
  onCerrar: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between border-b px-6 py-4"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <h2 className="text-base font-bold">{titulo}</h2>
      <Button type="button" variant="ghost" size="icon" onClick={onCerrar} aria-label="Cerrar el formulario"><X /></Button>
    </div>
  );
}

function Acciones({ busy, onCancelar }: { busy: boolean; onCancelar: () => void }) {
  return (
    <div
      className="mt-7 flex gap-3 border-t pt-5"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <Button type="submit" disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</Button>
      <Button type="button" variant="outline" onClick={onCancelar}>Cancelar</Button>
    </div>
  );
}

function Aviso({ mensaje }: { mensaje: string }) {
  return (
    <p
      role="alert"
      className="mt-5 rounded-lg border px-3 py-2.5 text-sm"
      style={{ borderColor: 'rgba(255,107,107,0.4)', background: 'rgba(255,107,107,0.08)', color: '#ff8f8f' }}
    >
      {mensaje}
    </p>
  );
}

function Fila({
  titulo,
  tituloTexto,
  detalle,
  etiquetas,
  imagen,
  onEditar,
  onBorrar,
}: {
  titulo: React.ReactNode;
  /** El título en texto plano, para la pregunta de borrar. */
  tituloTexto: string;
  detalle: React.ReactNode;
  etiquetas: React.ReactNode;
  /** URL de imagen (proyectos). undefined = fila sin columna de imagen. */
  imagen?: string | null;
  onEditar: () => void;
  onBorrar: () => void;
}) {
  return (
    <li className="kz-card flex flex-wrap items-center gap-4 p-4">
      {imagen !== undefined && (
        <span
          aria-hidden="true"
          className="grid h-14 w-20 shrink-0 place-items-center overflow-hidden rounded-lg border"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-2)', color: 'var(--color-muted-2)' }}
        >
          {imagen ? (
            <img src={miniatura(imagen, 160) ?? imagen} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <ImageIcon size={18} strokeWidth={1.5} />
          )}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 font-semibold">
          {titulo}
          {etiquetas}
        </p>
        <p className="mt-0.5 truncate text-sm" style={{ color: 'var(--color-muted)' }}>
          {detalle}
        </p>
      </div>
      <div className="flex gap-2 text-sm">
        <Button variant="outline" size="sm" onClick={onEditar}><Pencil /> Editar</Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"><Trash2 /> Borrar</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Borrar "{tituloTexto}"?</AlertDialogTitle>
              <AlertDialogDescription>No se puede deshacer. Si solo querés sacarlo del sitio, dejalo como borrador.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={onBorrar} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Borrar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </li>
  );
}

function Encabezado({
  titulo,
  texto,
  cta,
  onCrear,
}: {
  titulo: string;
  texto: string;
  cta: string;
  onCrear: () => void;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="kzp-titulo">{titulo}</h2>
        <p className="kzp-sub">{texto}</p>
      </div>
      <Button onClick={onCrear}><Plus /> {cta}</Button>
    </div>
  );
}

// ── Login ──

const VENTAJAS: { Icono: typeof Bot; titulo: string; texto: string }[] = [
  { Icono: Users, titulo: 'Clientes y ventas', texto: 'Cada lead con su estado, su servicio y su historial.' },
  { Icono: CalendarDays, titulo: 'Agenda y visitas', texto: 'Las visitas por confirmar y la ruta de cada día.' },
  { Icono: NotebookPen, titulo: 'Instalaciones', texto: 'Ficha, contrato, claves y bitácora con fotos.' },
  { Icono: Sparkles, titulo: 'Asistente IA', texto: 'Responde con tus propios datos, al momento.' },
];

function Login({ onEntrar }: { onEntrar: (u: PanelUser) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ver, setVer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [api, setApi] = useState<'ok' | 'mal' | null>(null);

  // Un punto verde que diga que la API está viva: si no, el error no es tu contraseña.
  useEffect(() => {
    fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(8000) })
      .then((r) => setApi(r.ok ? 'ok' : 'mal'))
      .catch(() => setApi('mal'));
  }, []);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      onEntrar(await panelLogin(email.trim(), password));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos entrar');
      setBusy(false);
    }
  }

  return (
    <div className="kzp-login">
      <aside className="kzp-login-marca">
        <img src="/logo-oscuro.webp" alt="Kizercode" width={192} height={64} className="h-14 w-auto object-contain object-left sm:h-16" />
        <div className="my-auto py-10">
          <p className="kz-eyebrow !text-[12px] !text-[var(--green-bright)]">// panel de administración</p>
          <h1 className="mt-3 max-w-md text-[34px] font-black leading-[1.08] tracking-tight sm:text-[42px]">
            Tu empresa, <span style={{ color: 'var(--green-bright)' }}>en un solo lugar</span>.
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed opacity-80">
            Clientes, agenda, instalaciones, proyectos y tu asistente. Desde el teléfono o la compu.
          </p>
          <ul className="mt-8 grid max-w-lg gap-3 sm:grid-cols-2">
            {VENTAJAS.map((v) => (
              <li key={v.titulo} className="kzp-login-ventaja">
                <span className="kzp-login-icono"><v.Icono size={16} /></span>
                <span>
                  <span className="block text-[13.5px] font-semibold">{v.titulo}</span>
                  <span className="block text-[12.5px] opacity-70">{v.texto}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="flex items-center gap-2 text-[12.5px] opacity-80">
          <span className="kz-latido" style={api === 'mal' ? { background: '#ff7b7b', animation: 'none' } : undefined} />
          {api === null ? 'Conectando con la API…' : api === 'ok' ? 'API en línea · api.kizercode.com' : 'La API no responde: revisá Railway'}
          <span className="ml-auto">El Progreso, Yoro</span>
        </p>
      </aside>

      <main className="kzp-login-form">
        <form onSubmit={entrar} className="kzp-login-caja" aria-busy={busy}>
          <Logo alto={44} className="mb-6" />
          <p className="kz-eyebrow">// bienvenido</p>
          <h2 className="mt-2 text-[28px] font-black tracking-tight">Entrar al panel</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">Con tu correo y contraseña de administrador.</p>

          <div className="mt-7 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="login-email">Correo</Label>
              <Input
                id="login-email"
                type="email"
                autoFocus
                autoComplete="username"
                inputMode="email"
                placeholder="vos@kizercode.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-[15px]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={ver ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pr-12 text-[15px]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setVer((v) => !v)}
                  aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-pressed={ver}
                  className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {ver ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
          </div>

          {error && <Aviso mensaje={error} />}

          <Button type="submit" size="lg" disabled={busy || !email || !password} className="mt-7 w-full">
            {busy ? (<><Loader2 className="animate-spin" /> Entrando…</>) : (<>Entrar <ArrowRight /></>)}
          </Button>

          <p className="mt-5 text-center text-[12px] text-muted-foreground">
            La sesión dura lo que dure esta pestaña. Al cerrarla, se cierra.
          </p>
        </form>
      </main>
    </div>
  );
}

// ── Proyectos ──

const VACIO: Partial<Project> = {
  slug: '',
  title: '',
  summary: '',
  body: '',
  client: null,
  period: null,
  imageUrl: null,
  liveUrl: null,
  tags: [],
  socials: [],
  published: false,
  position: 0,
};

function Proyectos({ onConteo }: { onConteo: (n: number) => void }) {
  const [lista, setLista] = useState<Project[]>([]);
  const [editando, setEditando] = useState<Partial<Project> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const cargar = () => panelProjects().then(setLista).catch(() => setLista([]));
  useEffect(() => {
    void cargar();
  }, []);
  useEffect(() => onConteo(lista.length), [lista.length, onConteo]);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!editando) return;
    setBusy(true);
    setError(null);
    try {
      await panelSaveProject(editando);
      setEditando(null);
      await cargar();
      toast.success(editando.published ? 'Proyecto guardado y publicado.' : 'Proyecto guardado como borrador.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
    }
    setBusy(false);
  }

  async function borrar(p: Project) {
    if (!p.id) return;
    await panelDeleteProject(p.id);
    await cargar();
    toast.success(`"${p.title}" borrado.`);
  }

  const nuevo = () => {
    setError(null);
    setEditando({ ...VACIO, position: lista.length });
  };

  return (
    <section>
      <Encabezado
        titulo="Proyectos"
        texto="Lo que se publica acá sale en el sitio al recargar."
        cta="Nuevo proyecto"
        onCrear={nuevo}
      />

      {editando && (
        <form onSubmit={guardar} className="kz-card kz-card-principal mb-8">
          <BarraFormulario
            titulo={`${editando.id ? 'Editar' : 'Nuevo'} proyecto`}
            onCerrar={() => setEditando(null)}
          />

          <div className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo etiqueta="Título" ayuda="Si dejás el enlace vacío, se arma con esto.">
                <Input
                  value={editando.title ?? ''}
                  onChange={(e) => setEditando({ ...editando, title: e.target.value })}
                />
              </Campo>
              <Campo etiqueta="Enlace (slug)" ayuda="/proyectos/kizer-pos">
                <Input
                  value={editando.slug ?? ''}
                  onChange={(e) => setEditando({ ...editando, slug: e.target.value })}
                  placeholder="se arma solo del título"
                />
              </Campo>
              <Campo etiqueta="Cliente">
                <Input
                  value={editando.client ?? ''}
                  onChange={(e) => setEditando({ ...editando, client: e.target.value })}
                />
              </Campo>
              <Campo etiqueta="Período" ayuda="2026, o 2025–2026">
                <Input
                  value={editando.period ?? ''}
                  onChange={(e) => setEditando({ ...editando, period: e.target.value })}
                />
              </Campo>
              <Campo etiqueta="Ver en vivo (URL)">
                <Input
                  value={editando.liveUrl ?? ''}
                  onChange={(e) => setEditando({ ...editando, liveUrl: e.target.value })}
                  placeholder="https://…"
                />
              </Campo>
              <Campo
                etiqueta="Redes del cliente"
                ayuda="URLs separadas por coma. Salen en la tarjeta como referencia de quién es."
              >
                <Input
                  value={(editando.socials ?? []).join(', ')}
                  onChange={(e) => setEditando({ ...editando, socials: e.target.value.split(',') })}
                  placeholder="https://instagram.com/…, https://facebook.com/…"
                />
              </Campo>
            </div>

            <div className="mt-4">
              <Campo etiqueta="Imagen" ayuda="Es la que se ve en la tarjeta del proyecto.">
                <SubirImagen
                  url={editando.imageUrl ?? null}
                  onSubida={(url) => setEditando({ ...editando, imageUrl: url })}
                  onQuitar={() => setEditando({ ...editando, imageUrl: null })}
                  etiqueta="Subí la imagen del proyecto"
                />
              </Campo>
            </div>

            <div className="mt-4">
              <Campo etiqueta="Resumen" ayuda="Una línea. Es lo que se lee en la tarjeta.">
                <Input
                  value={editando.summary ?? ''}
                  onChange={(e) => setEditando({ ...editando, summary: e.target.value })}
                />
              </Campo>
            </div>

            <div className="mt-4">
              <Campo etiqueta="El caso completo" ayuda="Opcional: qué problema resolvía y cómo.">
                <Textarea
                  rows={5}
                  value={editando.body ?? ''}
                  onChange={(e) => setEditando({ ...editando, body: e.target.value })}
                />
              </Campo>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Campo etiqueta="Etiquetas" ayuda="Separadas por coma: pos, tauri, react">
                <Input
                  value={(editando.tags ?? []).join(', ')}
                  onChange={(e) => setEditando({ ...editando, tags: e.target.value.split(',') })}
                />
              </Campo>
              <Campo etiqueta="Orden" ayuda="Menor primero.">
                <Input
                  type="number"
                  value={editando.position ?? 0}
                  onChange={(e) => setEditando({ ...editando, position: Number(e.target.value) })}
                />
              </Campo>
            </div>

            <div className="mt-5">
              <Interruptor
                activo={editando.published ?? false}
                onCambio={(v) => setEditando({ ...editando, published: v })}
                etiqueta="Publicado"
                ayuda="Sin esto queda como borrador y no sale en el sitio."
              />
            </div>

            {error && <Aviso mensaje={error} />}

            <Acciones busy={busy} onCancelar={() => setEditando(null)} />
          </div>
        </form>
      )}

      {lista.length === 0 && !editando ? (
        <Vacio
          titulo="Todavía no hay proyectos"
          texto="Agregá el primero y aparece en el sitio al instante."
          cta="Nuevo proyecto"
          onCrear={nuevo}
        />
      ) : (
        <ul className="space-y-3">
          {lista.map((p) => (
            <Fila
              key={p.id}
              titulo={p.title}
              tituloTexto={p.title}
              imagen={p.imageUrl}
              detalle={
                <>
                  <span className="font-mono text-[12px]" style={{ color: 'var(--color-muted-2)' }}>
                    /{p.slug}
                  </span>{' '}
                  · {p.summary}
                </>
              }
              etiquetas={!p.published && <Etiqueta texto="borrador" tono="borrador" />}
              onEditar={() => {
                setError(null);
                setEditando({ ...p });
              }}
              onBorrar={() => void borrar(p)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

// ── Testimonios ──

const TESTIMONIO_VACIO: Partial<Testimonial> = {
  author: '',
  role: null,
  company: null,
  text: '',
  rating: 5,
  featured: false,
  published: false,
  position: 0,
};

function Testimonios({ onConteo }: { onConteo: (n: number) => void }) {
  const [lista, setLista] = useState<Testimonial[]>([]);
  const [editando, setEditando] = useState<Partial<Testimonial> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const cargar = () => panelTestimonials().then(setLista).catch(() => setLista([]));
  useEffect(() => {
    void cargar();
  }, []);
  useEffect(() => onConteo(lista.length), [lista.length, onConteo]);

  const publicados = useMemo(() => lista.filter((t) => t.published).length, [lista]);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!editando) return;
    setBusy(true);
    setError(null);
    try {
      await panelSaveTestimonial(editando);
      setEditando(null);
      await cargar();
      toast.success(editando.published ? 'Testimonio guardado y publicado.' : 'Testimonio guardado como borrador.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
    }
    setBusy(false);
  }

  async function borrar(t: Testimonial) {
    if (!t.id) return;
    await panelDeleteTestimonial(t.id);
    await cargar();
    toast.success(`Testimonio de ${t.author} borrado.`);
  }

  const nuevo = () => {
    setError(null);
    setEditando({ ...TESTIMONIO_VACIO, position: lista.length });
  };

  return (
    <section>
      <Encabezado
        titulo="Testimonios"
        texto={
          publicados === 0
            ? 'Sin ninguno publicado, la sección no aparece en el sitio.'
            : `${publicados} publicado${publicados === 1 ? '' : 's'} en el sitio.`
        }
        cta="Nuevo testimonio"
        onCrear={nuevo}
      />

      {editando && (
        <form onSubmit={guardar} className="kz-card kz-card-principal mb-8">
          <BarraFormulario
            titulo={`${editando.id ? 'Editar' : 'Nuevo'} testimonio`}
            onCerrar={() => setEditando(null)}
          />

          <div className="p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <Campo etiqueta="Quién lo dijo">
                <Input
                  value={editando.author ?? ''}
                  onChange={(e) => setEditando({ ...editando, author: e.target.value })}
                />
              </Campo>
              <Campo etiqueta="Cargo" ayuda="Opcional. Vacío no se muestra.">
                <Input
                  value={editando.role ?? ''}
                  onChange={(e) => setEditando({ ...editando, role: e.target.value })}
                />
              </Campo>
              <Campo etiqueta="Empresa" ayuda="Opcional.">
                <Input
                  value={editando.company ?? ''}
                  onChange={(e) => setEditando({ ...editando, company: e.target.value })}
                />
              </Campo>
            </div>

            <div className="mt-4">
              <Campo etiqueta="Lo que dijo" ayuda="Tal cual lo dijo. Mínimo 20 caracteres.">
                <Textarea
                  rows={4}
                  value={editando.text ?? ''}
                  onChange={(e) => setEditando({ ...editando, text: e.target.value })}
                />
              </Campo>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Campo etiqueta="Calificación" ayuda="De 1 a 5 estrellas.">
                <Select value={String(editando.rating ?? 5)} onValueChange={(v) => setEditando({ ...editando, rating: Number(v) })}>
                  <SelectTrigger aria-label="Calificación"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[5, 4, 3, 2, 1].map((n) => (
                      <SelectItem key={n} value={String(n)}>{'★'.repeat(n)} {n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Campo>
              <Campo etiqueta="Orden" ayuda="Menor primero.">
                <Input
                  type="number"
                  value={editando.position ?? 0}
                  onChange={(e) => setEditando({ ...editando, position: Number(e.target.value) })}
                />
              </Campo>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Interruptor
                activo={editando.published ?? false}
                onCambio={(v) => setEditando({ ...editando, published: v })}
                etiqueta="Publicado"
                ayuda="Sin esto no sale en el sitio."
              />
              <Interruptor
                activo={editando.featured ?? false}
                onCambio={(v) => setEditando({ ...editando, featured: v })}
                etiqueta="Destacado"
                ayuda="Sale grande y de primero; marcar este apaga el anterior."
              />
            </div>

            {error && <Aviso mensaje={error} />}

            <Acciones busy={busy} onCancelar={() => setEditando(null)} />
          </div>
        </form>
      )}

      {lista.length === 0 && !editando ? (
        <Vacio
          titulo="Sin testimonios todavía"
          texto="Mientras no haya ninguno publicado, esa sección no aparece en el sitio."
          cta="Nuevo testimonio"
          onCrear={nuevo}
        />
      ) : (
        <ul className="space-y-3">
          {lista.map((t) => (
            <Fila
              key={t.id}
              tituloTexto={`testimonio de ${t.author}`}
              titulo={
                <>
                  {t.author}
                  <span aria-label={`${t.rating} de 5`} className="inline-flex gap-0.5" style={{ color: '#ffbd2e' }}>
                    {Array.from({ length: t.rating }, (_, i) => (
                      <Star key={i} size={13} fill="currentColor" aria-hidden="true" />
                    ))}
                  </span>
                </>
              }
              detalle={t.text}
              etiquetas={
                <>
                  {t.featured && <Etiqueta texto="destacado" tono="destacado" />}
                  {!t.published && <Etiqueta texto="borrador" tono="borrador" />}
                </>
              }
              onEditar={() => {
                setError(null);
                setEditando({ ...t });
              }}
              onBorrar={() => void borrar(t)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
