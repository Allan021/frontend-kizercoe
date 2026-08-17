import type { ContactFormData, ContactResponse, Project, Service, Testimonial } from '@/types';

const API_URL = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3001';

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

// ── Servicios ──

export function fetchServices(): Promise<Service[]> {
  return pedir<Service[]>('/v1/services');
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

export const panelServices = () => pedir<Service[]>('/v1/panel/services', conToken());

export const panelSaveService = (s: Partial<Service>) =>
  pedir<Service>('/v1/panel/services', conToken({ method: 'POST', body: JSON.stringify(s) }));

export const panelDeleteService = (id: string) =>
  pedir<{ ok: boolean }>(`/v1/panel/services/${id}`, conToken({ method: 'DELETE' }));
