import type { ContactFormData, ContactResponse, Project, Testimonial } from '@/types';

export const API_URL = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3001';

async function pedir<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...opts.headers },
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message ?? `Error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function submitContact(data: ContactFormData): Promise<ContactResponse> {
  return pedir<ContactResponse>('/api/contact', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── Proyectos ──

/** Los publicados. Es lo que ve cualquiera en el sitio. */
export function fetchProjects(): Promise<Project[]> {
  return pedir<Project[]>('/v1/projects');
}

// ── Testimonios ──

export function fetchTestimonials(): Promise<Testimonial[]> {
  return pedir<Testimonial[]>('/v1/testimonials');
}

// ── Panel ──
//
// El token vive en sessionStorage y no en localStorage: se va al cerrar la
// pestaña. Es un panel de administración que se usa de a ratos, no una sesión
// que convenga dejar abierta en una compu prestada.

const TOKEN_KEY = 'kz_panel_token';

export const getPanelToken = () =>
  typeof window === 'undefined' ? null : sessionStorage.getItem(TOKEN_KEY);
export const setPanelToken = (t: string) => sessionStorage.setItem(TOKEN_KEY, t);
export const clearPanelToken = () => sessionStorage.removeItem(TOKEN_KEY);

function conToken(opts: RequestInit = {}): RequestInit {
  const token = getPanelToken();
  return { ...opts, headers: { ...opts.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) } };
}

export type PanelUser = { id: string; email: string; name: string };

export async function panelLogin(email: string, password: string): Promise<PanelUser> {
  const r = await pedir<{ token: string; user: PanelUser }>('/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setPanelToken(r.token);
  return r.user;
}

export const panelMe = () => pedir<PanelUser>('/v1/auth/me', conToken());

/** Todos, incluidos los borradores. */
export const panelProjects = () => pedir<Project[]>('/v1/panel/projects', conToken());

export const panelSaveProject = (p: Partial<Project>) =>
  pedir<Project>('/v1/panel/projects', conToken({ method: 'POST', body: JSON.stringify(p) }));

export const panelDeleteProject = (id: string) =>
  pedir<{ ok: boolean }>(`/v1/panel/projects/${id}`, conToken({ method: 'DELETE' }));

export const panelTestimonials = () => pedir<Testimonial[]>('/v1/panel/testimonials', conToken());

export const panelSaveTestimonial = (t: Partial<Testimonial>) =>
  pedir<Testimonial>('/v1/panel/testimonials', conToken({ method: 'POST', body: JSON.stringify(t) }));

export const panelDeleteTestimonial = (id: string) =>
  pedir<{ ok: boolean }>(`/v1/panel/testimonials/${id}`, conToken({ method: 'DELETE' }));

// ── CRM ──

export type LeadEstado = 'new' | 'contacted' | 'converted' | 'closed';

export type Lead = {
  id: string;
  name: string;
  email: string;
  company?: string;
  /** WhatsApp o teléfono que dejó en el formulario. */
  phone?: string;
  service: string;
  budget?: string;
  message: string;
  status: LeadEstado;
  /** 'demo': dejó sus datos antes de abrir la app o demo de un producto. */
  source: 'form' | 'whatsapp' | 'demo';
  page?: string;
  notes?: string;
  projectSlug?: string;
  createdAt: string;
};

export const panelLeads = () => pedir<Lead[]>('/v1/panel/contacts', conToken());

export const panelUpdateLead = (id: string, cambios: { status?: LeadEstado; notes?: string }) =>
  pedir<Lead>(`/v1/panel/contacts/${id}`, conToken({ method: 'PATCH', body: JSON.stringify(cambios) }));

export const panelDeleteLead = (id: string) =>
  pedir<{ ok: boolean }>(`/v1/panel/contacts/${id}`, conToken({ method: 'DELETE' }));

export type VisitaEstado = 'pendiente' | 'confirmada' | 'realizada' | 'cancelada';

/** Lo que el bot de WhatsApp deja solicitado; el día y la hora los pone el equipo. */
export type Visita = {
  id: string;
  telefono: string;
  nombre: string;
  servicio: string;
  /** 'visita': vamos al cliente. 'local': viene él. */
  tipo: 'visita' | 'local';
  municipio: string | null;
  direccion: string;
  /** Lo que dijo el cliente: "el sábado en la mañana". */
  preferencia: string | null;
  estado: VisitaEstado;
  fecha: string | null;
  hora: string | null;
  notas: string | null;
  /** La ficha de la instalación: para no andar buscando nada en WhatsApp. */
  mapsUrl: string | null;
  contratoUrl: string | null;
  /** Usuarios y contraseñas del DVR y de la app, IP, modelo… */
  datos: string | null;
  createdAt: string;
};

/** Una nota de la bitácora de una instalación, con foto si la hay. */
export type Bitacora = {
  id: string;
  visitaId: string;
  autor: string;
  texto: string;
  fotoUrl: string | null;
  createdAt: string;
};

export const panelVisitas = () => pedir<Visita[]>('/v1/panel/visitas', conToken());

export const panelBitacora = (visitaId: string) => pedir<Bitacora[]>(`/v1/panel/visitas/${visitaId}/bitacora`, conToken());

export const panelAnotarBitacora = (visitaId: string, n: { texto: string; fotoUrl?: string | null }) =>
  pedir<Bitacora>(`/v1/panel/visitas/${visitaId}/bitacora`, conToken({ method: 'POST', body: JSON.stringify(n) }));

export type VisitaCambios = {
  fecha?: string;
  hora?: string;
  estado?: VisitaEstado;
  notas?: string;
  municipio?: string | null;
  direccion?: string;
  mapsUrl?: string | null;
  contratoUrl?: string | null;
  datos?: string | null;
};

export const panelUpdateVisita = (id: string, cambios: VisitaCambios) =>
  pedir<{ visita: Visita; whatsapp: { ok: boolean; error?: string } | null }>(
    `/v1/panel/visitas/${id}`,
    conToken({ method: 'PATCH', body: JSON.stringify(cambios) }),
  );

// ── Taller ──

export type EstadoOrden = 'recibido' | 'diagnostico' | 'reparacion' | 'listo' | 'entregado';
export type ItemOrden = { nombre: string; precio: number };
export type PagoOrden = { monto: number; metodo: string; fecha: string; ref: string; estado: 'por_confirmar' | 'confirmado'; comprobanteUrl: string | null };
export type EntradaLog = { cuando: string; quien: string; texto: string };

/** Una reparación en el taller, desde que entra el equipo hasta que se entrega. */
export type Orden = {
  id: string;
  num: string;
  tipo: 'pc' | 'cel' | 'otro';
  equipo: string;
  cliente: string;
  telefono: string | null;
  falla: string;
  modelo: string | null;
  serie: string | null;
  accesorios: string | null;
  diagnostico: string | null;
  estado: EstadoOrden;
  tecnico: string | null;
  items: ItemOrden[];
  pagos: PagoOrden[];
  fotos: string[];
  log: EntradaLog[];
  createdAt: string;
  updatedAt: string;
};
export type OrdenDatos = Partial<Omit<Orden, 'id' | 'num' | 'createdAt' | 'updatedAt'>>;

export const panelOrdenes = () => pedir<Orden[]>('/v1/panel/ordenes', conToken());
export const panelCrearOrden = (d: OrdenDatos) => pedir<Orden>('/v1/panel/ordenes', conToken({ method: 'POST', body: JSON.stringify(d) }));
export const panelEditarOrden = (id: string, d: OrdenDatos) => pedir<Orden>(`/v1/panel/ordenes/${id}`, conToken({ method: 'PATCH', body: JSON.stringify(d) }));
export const panelBorrarOrden = (id: string) => pedir<{ ok: boolean }>(`/v1/panel/ordenes/${id}`, conToken({ method: 'DELETE' }));
export const panelAvisarOrden = (id: string, texto: string) =>
  pedir<{ ok: boolean; error?: string }>(`/v1/panel/ordenes/${id}/avisar`, conToken({ method: 'POST', body: JSON.stringify({ texto }) }));

// ── Servicios (contratos) ──

export type CategoriaContrato = 'web' | 'software' | 'marketing' | 'camaras' | 'equipo';
export type CamaraContrato = { n: number; ubicacion: string; modelo: string; cable: number; canal: number };

export type Contrato = {
  id: string;
  categoria: CategoriaContrato;
  titulo: string;
  cliente: string;
  telefono: string | null;
  detalle: string | null;
  fase: string | null;
  pct: number;
  monto: number;
  estado: string;
  visitaId: string | null;
  camaras: CamaraContrato[];
  dvr: string | null;
  notasTecnico: string | null;
  contratoUrl: string | null;
  createdAt: string;
  updatedAt: string;
};
export type ContratoDatos = Partial<Omit<Contrato, 'id' | 'createdAt' | 'updatedAt'>>;

export const panelContratos = () => pedir<Contrato[]>('/v1/panel/contratos', conToken());
export const panelCrearContrato = (d: ContratoDatos) => pedir<Contrato>('/v1/panel/contratos', conToken({ method: 'POST', body: JSON.stringify(d) }));
export const panelEditarContrato = (id: string, d: ContratoDatos) => pedir<Contrato>(`/v1/panel/contratos/${id}`, conToken({ method: 'PATCH', body: JSON.stringify(d) }));
export const panelBorrarContrato = (id: string) => pedir<{ ok: boolean }>(`/v1/panel/contratos/${id}`, conToken({ method: 'DELETE' }));

// ── Cobros ──

export type EstadoFactura = 'pendiente' | 'abono' | 'pagada';
export type Factura = {
  id: string;
  num: string;
  cliente: string;
  telefono: string | null;
  concepto: string;
  monto: number;
  estado: EstadoFactura;
  metodo: string | null;
  comprobanteUrl: string | null;
  origen: 'taller' | 'contrato' | 'otro';
  origenId: string | null;
  vence: string | null;
  pagadaAt: string | null;
  createdAt: string;
};
export type FacturaDatos = Partial<Omit<Factura, 'id' | 'num' | 'createdAt' | 'pagadaAt'>>;

export const panelFacturas = () => pedir<Factura[]>('/v1/panel/facturas', conToken());
export const panelCrearFactura = (d: FacturaDatos) => pedir<Factura>('/v1/panel/facturas', conToken({ method: 'POST', body: JSON.stringify(d) }));
export const panelEditarFactura = (id: string, d: FacturaDatos) => pedir<Factura>(`/v1/panel/facturas/${id}`, conToken({ method: 'PATCH', body: JSON.stringify(d) }));
export const panelBorrarFactura = (id: string) => pedir<{ ok: boolean }>(`/v1/panel/facturas/${id}`, conToken({ method: 'DELETE' }));

export const panelAjustes = () => pedir<Record<string, string>>('/v1/panel/ajustes', conToken());
export const panelGuardarAjuste = (clave: string, valor: string) =>
  pedir<{ clave: string; valor: string }>(`/v1/panel/ajustes/${clave}`, conToken({ method: 'PUT', body: JSON.stringify({ valor }) }));

/** L 12,500 como se escribe acá. */
export const lempiras = (n: number) => `L ${Math.round(n).toLocaleString('es-HN')}`;

// ── Asistente de IA del panel ──

export type MensajeIA = { rol: 'user' | 'assistant'; texto: string };

/** Claude con el CRM a la vista: leads, visitas, instalaciones y staff. */
export const panelAsistente = (mensajes: MensajeIA[]) =>
  pedir<{ respuesta: string }>('/v1/panel/asistente', conToken({ method: 'POST', body: JSON.stringify({ mensajes }) }));

// ── Mi staff ──

/** Alguien del equipo: el bot lo reconoce por su número y le pregunta por su trabajo. */
export type Staff = {
  id: string;
  nombre: string;
  telefono: string;
  rol: string;
  activo: boolean;
  notas: string | null;
  createdAt: string;
};

export type StaffDatos = Pick<Staff, 'nombre' | 'telefono' | 'rol' | 'activo'> & { notas?: string | null };

export const panelStaff = () => pedir<Staff[]>('/v1/panel/staff', conToken());

export const panelCrearStaff = (d: StaffDatos) =>
  pedir<Staff>('/v1/panel/staff', conToken({ method: 'POST', body: JSON.stringify(d) }));

export const panelEditarStaff = (id: string, d: Partial<StaffDatos>) =>
  pedir<Staff>(`/v1/panel/staff/${id}`, conToken({ method: 'PATCH', body: JSON.stringify(d) }));

export const panelBorrarStaff = (id: string) =>
  pedir<{ ok: boolean }>(`/v1/panel/staff/${id}`, conToken({ method: 'DELETE' }));

/** Enlace wa.me con solo los dígitos; 8 dígitos sin código de país se toman como Honduras. */
export function waDe(phone: string): string | null {
  const d = phone.replace(/\D/g, '');
  if (d.length < 8) return null;
  return `https://wa.me/${d.length === 8 ? `504${d}` : d}`;
}
