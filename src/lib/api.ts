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
  createdAt: string;
};

export const panelVisitas = () => pedir<Visita[]>('/v1/panel/visitas', conToken());

export const panelUpdateVisita = (
  id: string,
  cambios: { fecha?: string; hora?: string; estado?: VisitaEstado; notas?: string },
) =>
  pedir<{ visita: Visita; whatsapp: { ok: boolean; error?: string } | null }>(
    `/v1/panel/visitas/${id}`,
    conToken({ method: 'PATCH', body: JSON.stringify(cambios) }),
  );

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
