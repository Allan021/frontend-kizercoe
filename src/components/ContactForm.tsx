'use client';
import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Cctv,
  Check,
  CircleHelp,
  Globe,
  LayoutDashboard,
  Megaphone,
  MessageCircle,
  Package,
  Pencil,
  RefreshCw,
  ShoppingCart,
  Smartphone,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { submitContact } from '@/lib/api';
import { useLang, T } from '@/lib/lang';
import type { ContactFormData } from '@/types';

/**
 * Formulario de contacto en tres pasos: qué necesitás → tu proyecto → tus datos.
 *
 * El backend guarda nombre, correo, teléfono, empresa, servicio, presupuesto y
 * mensaje. Industria, plazo y canal preferido viajan como líneas al frente del
 * mensaje: llegan al correo y al CRM sin agregar columnas.
 *
 * ?servicio=<valor> (en la query o en el hash, como #contacto?servicio=...)
 * deja el servicio elegido y salta directo al paso 2. Un valor desconocido se
 * ignora y el formulario arranca en el paso 1.
 */

type Opcion = {
  id: string;
  /** Lo que se envía como `service` (el formServicio de servicios.ts). */
  valor: string;
  es: string;
  en: string;
  icono: LucideIcon;
  /** Ayuda del mensaje en el paso 2, pensada para ese servicio. */
  ayudaEs: string;
  ayudaEn: string;
  /** Línea extra al frente del mensaje cuando `valor` no alcanza a decirlo. */
  interes?: string;
};

const OPCIONES: Opcion[] = [
  { id: 'web', valor: 'Web Applications', es: 'Una página web', en: 'A website', icono: Globe,
    ayudaEs: 'Qué vendés o a qué te dedicás, si ya tenés dominio y qué secciones te imaginás.',
    ayudaEn: 'What you sell or do, whether you already have a domain and which sections you picture.' },
  { id: 'modernizar', valor: 'Site Modernization', es: 'Modernizar mi sitio', en: 'Modernize my site', icono: RefreshCw,
    ayudaEs: 'La dirección de tu sitio actual y qué es lo que no te gusta de él.',
    ayudaEn: 'Your current site address and what you dislike about it.' },
  { id: 'tienda', valor: 'Online Store', es: 'Una tienda en línea', en: 'An online store', icono: ShoppingCart,
    ayudaEs: 'Qué productos vendés, más o menos cuántos, y cómo cobrás y entregás hoy.',
    ayudaEn: 'What products you sell, roughly how many, and how you charge and deliver today.' },
  { id: 'sistema', valor: 'Business System', es: 'Sistema o CRM para mi negocio', en: 'A system or CRM for my business', icono: LayoutDashboard,
    ayudaEs: 'Cómo llevás el control hoy (Excel, cuaderno, otro sistema) y qué querés resolver.',
    ayudaEn: 'How you keep track today (Excel, a notebook, another system) and what you want to solve.' },
  { id: 'app', valor: 'Mobile Apps', es: 'Una app móvil', en: 'A mobile app', icono: Smartphone,
    ayudaEs: 'Qué haría la app, quién la usaría y si ya tenés sistema o página.',
    ayudaEn: 'What the app would do, who would use it and whether you already have a system or site.' },
  { id: 'ia', valor: 'AI Automation', es: 'Una IA que atienda por vos', en: 'AI that answers for you', icono: Bot,
    ayudaEs: 'Qué te preguntan más seguido y por dónde te escriben (WhatsApp, Facebook, la web).',
    ayudaEn: 'What people ask you most and where they message you (WhatsApp, Facebook, the web).' },
  { id: 'marketing', valor: 'Other', interes: 'Marketing digital (SEO, anuncios, redes)',
    es: 'SEO, anuncios o redes', en: 'SEO, ads or social media', icono: Megaphone,
    ayudaEs: 'Qué vendés, a quién, y si ya tenés página o redes activas.',
    ayudaEn: 'What you sell, to whom, and whether you already have a site or active social accounts.' },
  { id: 'reparacion', valor: 'Computer Repair', es: 'Reparar compu o celular', en: 'Fix my computer or phone', icono: Wrench,
    ayudaEs: 'Qué equipo es (marca y modelo si lo sabés) y qué le está pasando.',
    ayudaEn: 'Which device it is (brand and model if you know) and what is happening to it.' },
  { id: 'camaras', valor: 'Security Cameras', es: 'Cámaras de seguridad', en: 'Security cameras', icono: Cctv,
    ayudaEs: 'Cuántas áreas querés cubrir y si es casa o negocio.',
    ayudaEn: 'How many areas you want covered and whether it is a home or a business.' },
  { id: 'producto', valor: '', es: 'Uno de nuestros productos', en: 'One of our products', icono: Package,
    ayudaEs: 'Qué tipo de negocio tenés y cuántas sucursales o usuarios serían.',
    ayudaEn: 'What kind of business you run and how many branches or users there would be.' },
  { id: 'otro', valor: 'Other', es: 'Otra cosa / no estoy seguro', en: 'Something else / not sure', icono: CircleHelp,
    ayudaEs: 'Contanos con tus palabras qué querés resolver; lo aterrizamos juntos.',
    ayudaEn: 'Tell us in your own words what you want to solve; we will shape it together.' },
];

/** Los productos de productos.ts; el nombre es lo que se envía como servicio. */
const PRODUCTOS = [
  { nombre: 'KizerPOS', es: 'Punto de venta e inventario', en: 'Point of sale & inventory' },
  { nombre: 'KizerResto', es: 'Restaurantes', en: 'Restaurants' },
  { nombre: 'Kizer Cobros', es: 'Préstamos y cobros', en: 'Loans & collections' },
  { nombre: 'Kizer Check', es: 'Asistencia por huella', en: 'Fingerprint attendance' },
  { nombre: 'ClínicoSalud', es: 'Clínicas', en: 'Clinics' },
  { nombre: 'Portal Inmobiliario', es: 'Bienes raíces', en: 'Real estate' },
] as const;

const INDUSTRIAS = [
  ['Farmacia', 'Pharmacy'], ['Ferretería', 'Hardware store'], ['Boutique', 'Boutique'],
  ['Restaurante', 'Restaurant'], ['Prestamista', 'Lender'], ['Clínica', 'Clinic'],
  ['Abogados', 'Law firm'], ['Bienes raíces', 'Real estate'], ['Distribuidora', 'Distributor'],
  ['Taller', 'Workshop'], ['Otra', 'Other'],
] as const;

// El valor (en español) es lo que llega al CRM; la pista en dólares es solo de referencia.
const PRESUPUESTOS = [
  { valor: 'Menos de L 10,000', en: 'Under L 10,000', usd: '< US$ 400' },
  { valor: 'L 10,000 – 25,000', en: 'L 10,000 – 25,000', usd: '≈ US$ 400–950' },
  { valor: 'L 25,000 – 60,000', en: 'L 25,000 – 60,000', usd: '≈ US$ 950–2,300' },
  { valor: 'Más de L 60,000', en: 'Over L 60,000', usd: '> US$ 2,300' },
  { valor: 'No sé todavía', en: "I don't know yet", usd: '' },
] as const;

const PLAZOS = [
  { valor: 'Lo antes posible', en: 'As soon as possible' },
  { valor: 'Este mes', en: 'This month' },
  { valor: 'En 1–3 meses', en: 'In 1–3 months' },
  { valor: 'Solo estoy cotizando', en: "I'm just getting quotes" },
] as const;

const CANALES = [
  { valor: 'WhatsApp', es: 'WhatsApp', en: 'WhatsApp' },
  { valor: 'Llamada', es: 'Llamada', en: 'Phone call' },
  { valor: 'Correo', es: 'Correo', en: 'Email' },
] as const;
type Canal = (typeof CANALES)[number]['valor'];

const PASOS = [
  { es: '¿Qué necesitás?', en: 'What do you need?' },
  { es: 'Tu proyecto', en: 'Your project' },
  { es: 'Tus datos', en: 'Your details' },
] as const;

const WA = '50488091744';

type Errores = Partial<Record<'opcion' | 'producto' | 'message' | 'name' | 'email' | 'phone', string>>;

const gtag = (...a: unknown[]) => (window as { gtag?: (...a: unknown[]) => void }).gtag?.(...a);

/** Lee un parámetro de la query o del hash (#contacto?servicio=...). */
function param(nombre: string): string | null {
  const hash = window.location.hash;
  const query = hash.includes('?') ? hash.slice(hash.indexOf('?')) : window.location.search;
  return new URLSearchParams(query).get(nombre) ?? new URLSearchParams(window.location.search).get(nombre);
}

/** ?servicio= → opción (y producto). Desconocido → null. */
function desdeServicio(v: string): { opcion: string; producto: string } | null {
  const s = v.trim().toLowerCase();
  if (!s) return null;
  const prod = PRODUCTOS.find((p) => p.nombre.toLowerCase() === s);
  if (prod) return { opcion: 'producto', producto: prod.nombre };
  // 'Other' cae en "Otra cosa", no en marketing: es la única con interés propio.
  const op = OPCIONES.find((o) => o.valor.toLowerCase() === s && !o.interes && o.valor);
  return op ? { opcion: op.id, producto: '' } : null;
}

const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());

const inputClass =
  'w-full rounded-[10px] border px-3.5 py-3 text-base outline-none transition-colors focus:border-[var(--green)] sm:text-[15px]';
const inputStyle: CSSProperties = { borderColor: 'var(--line)', background: 'var(--bg)', color: 'var(--ink)', minHeight: 48 };
const labelClass = 'flex flex-col gap-1.5 text-[13px] font-medium';
const labelStyle: CSSProperties = { color: 'var(--ink2)' };
const errorStyle: CSSProperties = { color: '#d94848' };
const focoAnillo = 'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--green)]';

function ErrorCampo({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return (
    <span id={id} className="text-xs" style={errorStyle} role="alert">
      {msg}
    </span>
  );
}

/** Pastilla de radio: el input real queda accesible (flechas, espacio). */
function Pastilla({
  name, valor, activa, onElegir, children,
}: { name: string; valor: string; activa: boolean; onElegir: (v: string) => void; children: ReactNode }) {
  return (
    <label
      className={`relative inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${focoAnillo}`}
      style={{
        borderColor: activa ? 'var(--green)' : 'var(--line)',
        background: activa ? 'var(--green-soft)' : 'var(--bg)',
        color: activa ? 'var(--green2)' : 'var(--ink2)',
      }}
    >
      <input type="radio" name={name} value={valor} checked={activa} onChange={() => onElegir(valor)} className="sr-only" />
      {activa && <Check size={14} aria-hidden="true" />}
      {children}
    </label>
  );
}

export default function ContactForm() {
  const lang = useLang();
  const es = lang === 'es';
  const tx = (s: string, e: string) => (es ? s : e);

  const [paso, setPaso] = useState(1);
  const [opcion, setOpcion] = useState('');
  const [producto, setProducto] = useState('');
  const [industria, setIndustria] = useState('');
  const [presupuesto, setPresupuesto] = useState('');
  const [plazo, setPlazo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [canal, setCanal] = useState<Canal>('WhatsApp');
  const [errores, setErrores] = useState<Errores>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [projectSlug, setProjectSlug] = useState<string | null>(null);
  const [enviado, setEnviado] = useState<{ canal: Canal; servicio: string } | null>(null);

  const raiz = useRef<HTMLDivElement>(null);
  const titulo = useRef<HTMLHeadingElement>(null);
  // Mover el foco solo cuando el cambio de paso lo pidió la persona: al cargar
  // (o al saltar por ?servicio=) no se le roba el scroll a la página.
  const enfocar = useRef(false);
  const iniciado = useRef(false);

  const op = OPCIONES.find((o) => o.id === opcion);
  const servicioEnviado = op ? (op.id === 'producto' ? producto : op.valor) : '';
  const etiquetaServicio = op
    ? op.id === 'producto' && producto
      ? producto
      : tx(op.es, op.en)
    : '';

  // form_start una sola vez: el primer toque dice que alguien empezó, aunque
  // después no envíe. Es la boca del embudo.
  const marcarInicio = () => {
    if (iniciado.current) return;
    iniciado.current = true;
    gtag('event', 'form_start', { form_id: 'contacto', pagina: window.location.pathname });
  };

  // ?proyecto= y ?servicio= se releen en cada hashchange: navegar dentro de
  // la página (una tarjeta de precios en el inicio) no recarga.
  useEffect(() => {
    const leer = () => {
      setProjectSlug(param('proyecto'));
      const s = param('servicio');
      const elegido = s ? desdeServicio(s) : null;
      if (elegido) {
        setOpcion(elegido.opcion);
        setProducto(elegido.producto);
        setErrores({});
        setStatus((st) => (st === 'success' ? 'idle' : st));
        setPaso(2);
      }
    };
    leer();
    window.addEventListener('hashchange', leer);
    return () => window.removeEventListener('hashchange', leer);
  }, []);

  // Cada paso alcanzado queda en Analytics; el 1 se cuenta solo si alguien
  // volvió a él (el de entrada ya lo cuenta form_start).
  const primerPaso = useRef(true);
  useEffect(() => {
    if (primerPaso.current) {
      primerPaso.current = false;
      if (paso === 1) return;
    }
    gtag('event', 'form_step', { form_id: 'contacto', step: paso });
    if (!enfocar.current) return;
    enfocar.current = false;
    const caja = raiz.current;
    if (caja && caja.getBoundingClientRect().top < 72) caja.scrollIntoView({ behavior: 'smooth', block: 'start' });
    titulo.current?.focus({ preventScroll: true });
  }, [paso]);

  const irA = (n: number) => {
    enfocar.current = true;
    setErrores({});
    setPaso(n);
  };

  /** Enfoca el primer campo con error (por id). */
  const enfocarError = (e: Errores) => {
    const orden: (keyof Errores)[] = ['opcion', 'producto', 'message', 'name', 'email', 'phone'];
    const k = orden.find((x) => e[x]);
    if (!k) return;
    requestAnimationFrame(() => {
      const el = raiz.current?.querySelector<HTMLElement>(`[data-campo="${k}"]`);
      el?.focus();
    });
  };

  const validar = (n: number): Errores => {
    const e: Errores = {};
    if (n === 1) {
      if (!opcion) e.opcion = tx('Elegí qué necesitás', 'Please pick what you need');
      else if (opcion === 'producto' && !producto) e.producto = tx('Elegí cuál producto', 'Please pick a product');
    }
    if (n === 2 && mensaje.trim().length < 10)
      e.message = tx('Contanos un poco más (al menos 10 caracteres)', 'Tell us a bit more (at least 10 characters)');
    if (n === 3) {
      if (nombre.trim().length < 2) e.name = tx('El nombre necesita al menos 2 caracteres', 'Name must be at least 2 characters');
      if (!emailOk(correo)) e.email = tx('Escribí un correo válido', 'Enter a valid email address');
      const digitos = telefono.replace(/\D/g, '');
      if (telefono.trim() && digitos.length < 8)
        e.phone = tx('Revisá el número: necesita al menos 8 dígitos', 'Check the number: it needs at least 8 digits');
      else if (!telefono.trim() && canal !== 'Correo')
        e.phone = tx(
          `Dejanos tu número para contactarte por ${canal === 'WhatsApp' ? 'WhatsApp' : 'llamada'}, o elegí correo`,
          `Leave your number so we can reach you by ${canal === 'WhatsApp' ? 'WhatsApp' : 'phone'}, or pick email`,
        );
    }
    return e;
  };

  const enviar = async () => {
    setStatus('loading');
    setErrorMsg('');
    const encabezado = [
      op?.interes ? `Interés: ${op.interes}` : '',
      industria ? `Industria: ${industria}` : '',
      plazo ? `Plazo: ${plazo}` : '',
      `Canal preferido: ${canal}`,
    ].filter(Boolean);
    const payload: ContactFormData = {
      name: nombre.trim(),
      email: correo.trim(),
      service: servicioEnviado,
      message: `${encabezado.join('\n')}\n\n${mensaje.trim()}`,
      ...(telefono.trim() ? { phone: telefono.trim() } : {}),
      ...(empresa.trim() ? { company: empresa.trim() } : {}),
      ...(presupuesto ? { budget: presupuesto } : {}),
      ...(projectSlug ? { projectSlug } : {}),
    };
    try {
      await submitContact(payload);
      // Conversión para Analytics/Ads: una solicitud enviada es un prospecto.
      gtag('event', 'generate_lead', {
        method: 'formulario',
        service: servicioEnviado,
        ...(projectSlug ? { project: projectSlug } : {}),
      });
      // Ya dejó nombre y correo: el botón de WhatsApp no se los vuelve a pedir
      // (LeadWhatsApp lee esta misma clave).
      try {
        localStorage.setItem('kz-lead', JSON.stringify({ name: payload.name, email: payload.email }));
      } catch {}
      setEnviado({ canal, servicio: etiquetaServicio });
      setStatus('success');
      requestAnimationFrame(() => {
        const caja = raiz.current;
        if (caja && caja.getBoundingClientRect().top < 72) caja.scrollIntoView({ behavior: 'smooth', block: 'start' });
        titulo.current?.focus({ preventScroll: true });
      });
    } catch (err) {
      setStatus('error');
      gtag('event', 'form_error', { form_id: 'contacto' });
      setErrorMsg(err instanceof Error ? err.message : tx('Algo salió mal. Probá de nuevo.', 'Something went wrong. Please try again.'));
    }
  };

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    if (status === 'loading') return;
    const e = validar(paso);
    setErrores(e);
    if (Object.keys(e).length) {
      gtag('event', 'form_error', { form_id: 'contacto', step: paso });
      enfocarError(e);
      return;
    }
    if (paso < 3) irA(paso + 1);
    else void enviar();
  };

  const reiniciar = () => {
    setPaso(1);
    setOpcion('');
    setProducto('');
    setIndustria('');
    setPresupuesto('');
    setPlazo('');
    setMensaje('');
    setErrores({});
    setEnviado(null);
    setStatus('idle');
    enfocar.current = true;
  };

  // ── Listo ──
  if (status === 'success' && enviado) {
    const porCanal =
      enviado.canal === 'WhatsApp' ? 'WhatsApp' : enviado.canal === 'Llamada' ? tx('llamada', 'phone') : tx('correo', 'email');
    const pasosDespues = [
      { es: 'Revisamos tu solicitud', en: 'We review your request', des: 'Una persona del equipo la lee, no un bot.', den: 'A person on the team reads it, not a bot.' },
      { es: `Te escribimos por ${porCanal}`, en: `We reach out by ${porCanal}`, des: 'En menos de 24 h, para aclarar lo que haga falta.', den: 'In under 24 h, to clarify whatever is needed.' },
      { es: 'Diagnóstico gratis', en: 'Free diagnosis', des: 'Y un precio fijo por escrito, sin sorpresas.', den: 'And a fixed price in writing, no surprises.' },
    ];
    const textoWa = `${tx('Hola! Acabo de enviar el formulario de contacto. Me interesa', 'Hi! I just sent the contact form. I am interested in')}: ${enviado.servicio}.`;
    return (
      <div ref={raiz} className="flex flex-col items-center gap-5 py-6 text-center" style={{ scrollMarginTop: 96 }}>
        <span
          className="flex h-20 w-20 items-center justify-center rounded-full"
          style={{ background: 'var(--green-soft)', border: '2px solid var(--green)' }}
        >
          <Check size={40} strokeWidth={2.5} style={{ color: 'var(--green)' }} aria-hidden="true" />
        </span>
        <h3 ref={titulo} tabIndex={-1} className="text-2xl font-bold outline-none" style={{ color: 'var(--ink)' }}>
          <T en="We received your request" es="Recibimos tu solicitud" />
        </h3>
        <p className="max-w-[380px] text-[15px] leading-relaxed" style={{ color: 'var(--ink2)' }}>
          <T
            en="Thanks for writing to us. Here is what happens now:"
            es="Gracias por escribirnos. Esto es lo que pasa ahora:"
          />
        </p>
        <ol className="flex w-full max-w-[420px] list-none flex-col gap-3 text-left">
          {pasosDespues.map((p, i) => (
            <li key={p.es} className="flex items-start gap-3 rounded-[14px] border p-3.5" style={{ borderColor: 'var(--line)', background: 'var(--bg)' }}>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white" style={{ background: 'var(--green-btn)' }}>
                {i + 1}
              </span>
              <span className="flex flex-col gap-0.5">
                <strong className="text-[15px] font-semibold" style={{ color: 'var(--ink)' }}><T es={p.es} en={p.en} /></strong>
                <span className="text-[13px] leading-relaxed" style={{ color: 'var(--ink2)' }}><T es={p.des} en={p.den} /></span>
              </span>
            </li>
          ))}
        </ol>
        <div className="flex w-full max-w-[420px] flex-col gap-2.5">
          <a
            href={`https://wa.me/${WA}?text=${encodeURIComponent(textoWa)}`}
            target="_blank"
            rel="noopener noreferrer"
            data-servicio={enviado.servicio}
            className="kz-btn kz-btn-primario w-full"
            style={{ minHeight: 48 }}
          >
            <MessageCircle size={18} aria-hidden="true" />
            <T en="Can't wait? Message us on WhatsApp" es="¿No querés esperar? Escribinos por WhatsApp" />
          </a>
          <button type="button" onClick={reiniciar} className="kz-btn kz-btn-secundario w-full text-sm" style={{ minHeight: 44 }}>
            <T en="Send another request" es="Enviar otra solicitud" />
          </button>
        </div>
      </div>
    );
  }

  const ayuda = op ? tx(op.ayudaEs, op.ayudaEn) : tx('Qué querés resolver y cómo trabajás hoy.', 'What you want to solve and how you work today.');

  return (
    <div ref={raiz} style={{ scrollMarginTop: 96 }}>
      {/* Progreso: texto para lectores de pantalla y barra para la vista. */}
      <div className="mb-5 flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--green2)' }} aria-live="polite">
            <T en={`Step ${paso} of 3`} es={`Paso ${paso} de 3`} />
          </p>
          <p className="truncate text-xs" style={{ color: 'var(--mute)' }}>
            {paso < 3 && <T en={`Next: ${PASOS[paso].en}`} es={`Sigue: ${PASOS[paso].es}`} />}
          </p>
        </div>
        <ol className="grid list-none grid-cols-3 gap-1.5" aria-label={tx('Progreso del formulario', 'Form progress')}>
          {PASOS.map((p, i) => (
            <li key={p.es} aria-current={paso === i + 1 ? 'step' : undefined}>
              <span className="block h-1.5 rounded-full transition-colors" style={{ background: i < paso ? 'var(--green)' : 'var(--line)' }} />
              <span className="sr-only">{tx(p.es, p.en)}{i + 1 < paso ? tx(' (listo)', ' (done)') : ''}</span>
            </li>
          ))}
        </ol>
      </div>

      <form onSubmit={onSubmit} onFocus={marcarInicio} onPointerDown={marcarInicio} noValidate className="flex flex-col gap-5">
        <h3 ref={titulo} tabIndex={-1} className="text-xl font-bold outline-none" style={{ color: 'var(--ink)' }}>
          <T en={PASOS[paso - 1].en} es={PASOS[paso - 1].es} />
        </h3>

        {projectSlug && (
          <p
            className="-mt-2 inline-flex items-center gap-2 self-start rounded-full border px-3 py-1.5 text-xs font-semibold"
            style={{ borderColor: 'color-mix(in srgb, var(--green) 35%, transparent)', background: 'var(--green-soft)', color: 'var(--green2)' }}
          >
            <span className="kz-latido" />
            <T en={`about: ${projectSlug}`} es={`sobre: ${projectSlug}`} />
          </p>
        )}

        {paso > 1 && op && (
          <div className="-mt-2 flex flex-wrap items-center gap-2">
            <span
              className="inline-flex max-w-full items-center gap-2 rounded-full border py-1.5 pl-3 pr-1.5 text-sm font-medium"
              style={{ borderColor: 'color-mix(in srgb, var(--green) 35%, transparent)', background: 'var(--green-soft)', color: 'var(--green2)' }}
            >
              <op.icono size={15} aria-hidden="true" className="shrink-0" />
              <span className="truncate">{etiquetaServicio}</span>
              <button
                type="button"
                onClick={() => irA(1)}
                className="inline-flex min-h-[32px] shrink-0 items-center gap-1 rounded-full px-2.5 text-xs font-semibold underline-offset-2 hover:underline"
                style={{ color: 'var(--green2)', background: 'var(--bg)' }}
                aria-label={tx(`Cambiar servicio: ${etiquetaServicio}`, `Change service: ${etiquetaServicio}`)}
              >
                <Pencil size={12} aria-hidden="true" />
                <T en="Change" es="Cambiar" />
              </button>
            </span>
          </div>
        )}

        {/* ── Paso 1 ── */}
        {paso === 1 && (
          <>
            <fieldset className="flex flex-col gap-2.5">
              <legend className="sr-only">{tx('¿Qué necesitás?', 'What do you need?')}</legend>
              <div className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 150px), 1fr))' }}>
                {OPCIONES.map((o, i) => {
                  const activa = opcion === o.id;
                  return (
                    <label
                      key={o.id}
                      className={`relative flex min-h-[64px] cursor-pointer items-center gap-3 rounded-[14px] border px-3.5 py-3 text-left text-sm font-semibold leading-snug transition-colors hover:border-[var(--green)] ${focoAnillo}`}
                      style={{
                        borderColor: activa ? 'var(--green)' : 'var(--line)',
                        background: activa ? 'var(--green-soft)' : 'var(--bg)',
                        color: 'var(--ink)',
                        boxShadow: activa ? 'inset 0 0 0 1px var(--green)' : undefined,
                      }}
                    >
                      <input
                        type="radio"
                        name="kz-servicio"
                        value={o.id}
                        checked={activa}
                        onChange={() => {
                          setOpcion(o.id);
                          if (o.id !== 'producto') setProducto('');
                          setErrores({});
                        }}
                        className="sr-only"
                        data-campo={i === 0 ? 'opcion' : undefined}
                        aria-describedby={errores.opcion ? 'err-opcion' : undefined}
                      />
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
                        style={{ background: activa ? 'var(--green)' : 'var(--bg2)', color: activa ? '#fff' : 'var(--green2)' }}
                        aria-hidden="true"
                      >
                        {activa ? <Check size={18} /> : <o.icono size={18} />}
                      </span>
                      <span><T es={o.es} en={o.en} /></span>
                    </label>
                  );
                })}
              </div>
              <ErrorCampo id="err-opcion" msg={errores.opcion} />
            </fieldset>

            {opcion === 'producto' && (
              <fieldset className="flex flex-col gap-2.5 rounded-[14px] border p-4" style={{ borderColor: 'var(--line)', background: 'var(--bg)' }}>
                <legend className="px-1 text-[13px] font-medium" style={labelStyle}>
                  <T en="Which one?" es="¿Cuál?" />
                </legend>
                <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 170px), 1fr))' }}>
                  {PRODUCTOS.map((p, i) => {
                    const activa = producto === p.nombre;
                    return (
                      <label
                        key={p.nombre}
                        className={`flex min-h-[48px] cursor-pointer flex-col justify-center rounded-[10px] border px-3 py-2 transition-colors hover:border-[var(--green)] ${focoAnillo}`}
                        style={{ borderColor: activa ? 'var(--green)' : 'var(--line)', background: activa ? 'var(--green-soft)' : 'var(--bg)' }}
                      >
                        <input
                          type="radio"
                          name="kz-producto"
                          value={p.nombre}
                          checked={activa}
                          onChange={() => {
                            setProducto(p.nombre);
                            setErrores({});
                          }}
                          className="sr-only"
                          data-campo={i === 0 ? 'producto' : undefined}
                        />
                        <span className="text-sm font-semibold" style={{ color: activa ? 'var(--green2)' : 'var(--ink)' }}>{p.nombre}</span>
                        <span className="text-xs" style={{ color: 'var(--mute)' }}><T es={p.es} en={p.en} /></span>
                      </label>
                    );
                  })}
                </div>
                <ErrorCampo id="err-producto" msg={errores.producto} />
              </fieldset>
            )}
          </>
        )}

        {/* ── Paso 2 ── */}
        {paso === 2 && (
          <>
            <label className={labelClass} style={labelStyle}>
              <T en="Industry (optional)" es="Industria (opcional)" />
              <select className={inputClass} style={inputStyle} value={industria} onChange={(e) => setIndustria(e.target.value)}>
                <option value="">{tx('Elegí si aplica...', 'Pick if it applies...')}</option>
                {INDUSTRIAS.map(([vEs, vEn]) => (
                  <option key={vEs} value={vEs}>{es ? vEs : vEn}</option>
                ))}
              </select>
            </label>

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-[13px] font-medium" style={labelStyle}>
                <T en="Approximate budget (optional)" es="Presupuesto aproximado (opcional)" />
              </legend>
              <div className="flex flex-wrap gap-2">
                {PRESUPUESTOS.map((p) => (
                  <Pastilla key={p.valor} name="kz-presupuesto" valor={p.valor} activa={presupuesto === p.valor} onElegir={setPresupuesto}>
                    <span><T es={p.valor} en={p.en} /></span>
                    {p.usd && <span className="text-xs font-normal" style={{ color: 'var(--mute)' }}>{p.usd}</span>}
                  </Pastilla>
                ))}
              </div>
            </fieldset>

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-[13px] font-medium" style={labelStyle}>
                <T en="When do you need it? (optional)" es="¿Para cuándo lo necesitás? (opcional)" />
              </legend>
              <div className="flex flex-wrap gap-2">
                {PLAZOS.map((p) => (
                  <Pastilla key={p.valor} name="kz-plazo" valor={p.valor} activa={plazo === p.valor} onElegir={setPlazo}>
                    <T es={p.valor} en={p.en} />
                  </Pastilla>
                ))}
              </div>
            </fieldset>

            <label className={labelClass} style={labelStyle}>
              <T en="Tell us about your project" es="Contanos de tu proyecto" />
              <span className="text-xs font-normal" style={{ color: 'var(--mute)' }} id="ayuda-mensaje">{ayuda}</span>
              <textarea
                rows={5}
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder={tx('Escribilo como se lo contarías a un amigo.', 'Write it as you would tell a friend.')}
                className={`${inputClass} resize-y`}
                style={{ ...inputStyle, minHeight: 132 }}
                data-campo="message"
                aria-invalid={!!errores.message}
                aria-describedby={`ayuda-mensaje${errores.message ? ' err-message' : ''}`}
              />
              <ErrorCampo id="err-message" msg={errores.message} />
            </label>
          </>
        )}

        {/* ── Paso 3 ── */}
        {paso === 3 && (
          <>
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 210px), 1fr))' }}>
              <label className={labelClass} style={labelStyle}>
                <T en="Name" es="Nombre" />
                <input
                  type="text" autoComplete="name" value={nombre} onChange={(e) => setNombre(e.target.value)}
                  placeholder={tx('Tu nombre', 'Your name')} className={inputClass} style={inputStyle}
                  data-campo="name" aria-invalid={!!errores.name} aria-describedby={errores.name ? 'err-name' : undefined}
                />
                <ErrorCampo id="err-name" msg={errores.name} />
              </label>
              <label className={labelClass} style={labelStyle}>
                <T en="Email" es="Correo" />
                <input
                  type="email" autoComplete="email" inputMode="email" value={correo} onChange={(e) => setCorreo(e.target.value)}
                  placeholder={tx('vos@correo.com', 'you@email.com')} className={inputClass} style={inputStyle}
                  data-campo="email" aria-invalid={!!errores.email} aria-describedby={errores.email ? 'err-email' : undefined}
                />
                <ErrorCampo id="err-email" msg={errores.email} />
              </label>
              <label className={labelClass} style={labelStyle}>
                <span>
                  <T en="WhatsApp / phone" es="WhatsApp / teléfono" />{' '}
                  <span className="font-normal" style={{ color: 'var(--mute)' }}><T en="(recommended)" es="(recomendado)" /></span>
                </span>
                <input
                  type="tel" autoComplete="tel" inputMode="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)}
                  placeholder="+504 9999-9999" className={inputClass} style={inputStyle} maxLength={40}
                  data-campo="phone" aria-invalid={!!errores.phone}
                  aria-describedby={`ayuda-tel${errores.phone ? ' err-phone' : ''}`}
                />
                <span id="ayuda-tel" className="text-xs font-normal" style={{ color: 'var(--mute)' }}>
                  <T en="Honduran numbers: +504 and 8 digits." es="Números de Honduras: +504 y 8 dígitos." />
                </span>
                <ErrorCampo id="err-phone" msg={errores.phone} />
              </label>
              <label className={labelClass} style={labelStyle}>
                <T en="Company (optional)" es="Empresa (opcional)" />
                <input
                  type="text" autoComplete="organization" value={empresa} onChange={(e) => setEmpresa(e.target.value)}
                  placeholder={tx('Nombre del negocio', 'Business name')} className={inputClass} style={inputStyle} maxLength={200}
                />
              </label>
            </div>

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-[13px] font-medium" style={labelStyle}>
                <T en="How should we contact you?" es="¿Por dónde preferís que te contactemos?" />
              </legend>
              <div className="flex flex-wrap gap-2">
                {CANALES.map((c) => (
                  <Pastilla
                    key={c.valor}
                    name="kz-canal"
                    valor={c.valor}
                    activa={canal === c.valor}
                    onElegir={(v) => {
                      setCanal(v as Canal);
                      setErrores((e) => ({ ...e, phone: undefined }));
                    }}
                  >
                    <T es={c.es} en={c.en} />
                  </Pastilla>
                ))}
              </div>
            </fieldset>

            {status === 'error' && (
              <p className="rounded-[10px] border px-3.5 py-3 text-sm" style={{ borderColor: 'rgba(217,72,72,.4)', background: 'rgba(217,72,72,.06)', color: '#d94848' }} role="alert">
                {errorMsg}
              </p>
            )}
          </>
        )}

        {/* Navegación: misma fila en los tres pasos, sin saltos de layout. */}
        <div className="flex items-center gap-2.5 pt-1">
          {paso > 1 && (
            <button type="button" onClick={() => irA(paso - 1)} className="kz-btn kz-btn-secundario shrink-0" style={{ minHeight: 48, padding: '12px 16px' }}>
              <ArrowLeft size={16} aria-hidden="true" />
              <T en="Back" es="Atrás" />
            </button>
          )}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="kz-btn kz-btn-primario min-w-0 flex-1 disabled:opacity-60"
            style={{ minHeight: 48, padding: '12px 18px', fontSize: 16 }}
          >
            {paso < 3 ? (
              <>
                <T en="Continue" es="Siguiente" />
                <ArrowRight size={16} aria-hidden="true" />
              </>
            ) : status === 'loading' ? (
              <T en="Sending..." es="Enviando..." />
            ) : (
              <T en="Request free consultation" es="Solicitar consulta gratis" />
            )}
          </button>
        </div>

        <p className="-mt-1 text-center text-xs" style={{ color: 'var(--mute)' }}>
          <T en="Free diagnosis · reply in under 24 h · no spam" es="Diagnóstico gratis · respuesta en menos de 24 h · nada de spam" />
        </p>
      </form>
    </div>
  );
}
