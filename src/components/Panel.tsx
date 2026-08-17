'use client';
import { useEffect, useState } from 'react';
import {
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
  panelDeleteService,
  panelSaveService,
  panelServices,
  type PanelUser,
} from '@/lib/api';
import type { Practica, Project, Service, Testimonial } from '@/types';

/**
 * Panel de Kizercode: cargar los proyectos sin tocar cÃ³digo.
 *
 * Corre entero en el navegador contra la API â€” el sitio es estÃ¡tico. El token
 * vive en sessionStorage: se va al cerrar la pestaÃ±a.
 */
export default function Panel() {
  const [user, setUser] = useState<PanelUser | null>(null);
  const [cargando, setCargando] = useState(true);

  // Si quedÃ³ un token de antes, se comprueba contra la API en vez de confiar.
  useEffect(() => {
    if (!getPanelToken()) return setCargando(false);
    panelMe()
      .then(setUser)
      .catch(() => clearPanelToken())
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <p style={{ color: 'var(--color-muted)' }}>Cargandoâ€¦</p>;
  if (!user) return <Login onEntrar={setUser} />;

  return (
    <Escritorio
      user={user}
      onSalir={() => {
        clearPanelToken();
        setUser(null);
      }}
    />
  );
}

type Pestana = 'servicios' | 'proyectos' | 'testimonios';

function Escritorio({ user, onSalir }: { user: PanelUser; onSalir: () => void }) {
  const [pestana, setPestana] = useState<Pestana>('proyectos');

  return (
    <div className="w-full">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="section-tag">// panel</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight">Kizercode</h1>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span style={{ color: 'var(--color-muted)' }}>{user.name}</span>
          <button onClick={onSalir} className="underline underline-offset-2" style={{ color: 'var(--color-muted)' }}>
            Salir
          </button>
        </div>
      </header>

      <nav className="mb-8 flex gap-2">
        {(['servicios', 'proyectos', 'testimonios'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPestana(p)}
            className="rounded-lg px-4 py-2 text-sm capitalize transition-colors"
            style={
              pestana === p
                ? { background: 'var(--color-card-2)', color: 'var(--color-text)', fontWeight: 700 }
                : { color: 'var(--color-muted)' }
            }
          >
            {p}
          </button>
        ))}
      </nav>

      {pestana === 'servicios' && <Servicios />}
      {pestana === 'proyectos' && <Proyectos />}
      {pestana === 'testimonios' && <Testimonios />}
    </div>
  );
}

const CARD: React.CSSProperties = {
  background: 'var(--color-card)',
  borderColor: 'var(--color-border)',
};
const INPUT =
  'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors focus:border-cyan-400';
const INPUT_STYLE: React.CSSProperties = {
  background: 'var(--color-bg-2)',
  borderColor: 'var(--color-border)',
  color: 'var(--color-text)',
};
const BTN: React.CSSProperties = {
  // Azul plano con texto blanco: sobre el azul nuevo, el texto oscuro del
  // degradado viejo quedaba por debajo del contraste mínimo.
  background: 'var(--color-accent-strong)',
  color: '#fff',
};

function Login({ onEntrar }: { onEntrar: (u: PanelUser) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      onEntrar(await panelLogin(email, password));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos entrar');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={entrar} className="mx-auto w-full max-w-sm rounded-2xl border p-8" style={CARD}>
      <p className="section-tag">// panel</p>
      <h1 className="mt-3 text-2xl font-black tracking-tight">Entrar</h1>

      <label className="mt-6 block text-sm" style={{ color: 'var(--color-muted)' }}>
        Correo
        <input
          type="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${INPUT} mt-1.5`}
          style={INPUT_STYLE}
        />
      </label>

      <label className="mt-4 block text-sm" style={{ color: 'var(--color-muted)' }}>
        ContraseÃ±a
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`${INPUT} mt-1.5`}
          style={INPUT_STYLE}
        />
      </label>

      {error && (
        <p role="alert" className="mt-4 text-sm" style={{ color: '#ff6b6b' }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-6 w-full rounded-lg py-3 text-sm font-bold disabled:opacity-50"
        style={BTN}
      >
        {busy ? 'Entrandoâ€¦' : 'Entrar'}
      </button>
    </form>
  );
}

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
  published: false,
  position: 0,
};

function Proyectos() {
  const [lista, setLista] = useState<Project[]>([]);
  const [editando, setEditando] = useState<Partial<Project> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const cargar = () => panelProjects().then(setLista).catch(() => setLista([]));
  useEffect(() => {
    void cargar();
  }, []);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!editando) return;
    setBusy(true);
    setError(null);
    try {
      await panelSaveProject(editando);
      setEditando(null);
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
    }
    setBusy(false);
  }

  async function borrar(p: Project) {
    // Borrar un proyecto no se deshace: se pregunta.
    if (!p.id || !confirm(`Â¿Borrar "${p.title}"? No se puede deshacer.`)) return;
    await panelDeleteProject(p.id);
    await cargar();
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setEditando({ ...VACIO, position: lista.length })}
          className="rounded-lg px-4 py-2 text-sm font-bold"
          style={BTN}
        >
          Nuevo proyecto
        </button>
      </div>

      {editando && (
        <form onSubmit={guardar} className="mb-8 rounded-2xl border p-6" style={CARD}>
          <h2 className="text-lg font-bold">{editando.id ? 'Editar' : 'Nuevo'} proyecto</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="TÃ­tulo" ayuda="Si dejÃ¡s el enlace vacÃ­o, se arma con esto.">
              <input
                value={editando.title ?? ''}
                onChange={(e) => setEditando({ ...editando, title: e.target.value })}
                className={INPUT}
                style={INPUT_STYLE}
              />
            </Campo>
            <Campo etiqueta="Enlace (slug)" ayuda="/proyectos/kizer-pos">
              <input
                value={editando.slug ?? ''}
                onChange={(e) => setEditando({ ...editando, slug: e.target.value })}
                placeholder="se arma solo del tÃ­tulo"
                className={INPUT}
                style={INPUT_STYLE}
              />
            </Campo>
            <Campo etiqueta="Cliente">
              <input
                value={editando.client ?? ''}
                onChange={(e) => setEditando({ ...editando, client: e.target.value })}
                className={INPUT}
                style={INPUT_STYLE}
              />
            </Campo>
            <Campo etiqueta="PerÃ­odo" ayuda="2026, o 2025â€“2026">
              <input
                value={editando.period ?? ''}
                onChange={(e) => setEditando({ ...editando, period: e.target.value })}
                className={INPUT}
                style={INPUT_STYLE}
              />
            </Campo>
            <Campo etiqueta="Imagen (URL)">
              <input
                value={editando.imageUrl ?? ''}
                onChange={(e) => setEditando({ ...editando, imageUrl: e.target.value })}
                placeholder="https://â€¦"
                className={INPUT}
                style={INPUT_STYLE}
              />
            </Campo>
            <Campo etiqueta="Ver en vivo (URL)">
              <input
                value={editando.liveUrl ?? ''}
                onChange={(e) => setEditando({ ...editando, liveUrl: e.target.value })}
                placeholder="https://â€¦"
                className={INPUT}
                style={INPUT_STYLE}
              />
            </Campo>
          </div>

          <div className="mt-4">
            <Campo etiqueta="Resumen" ayuda="Una lÃ­nea. Es lo que se lee en la tarjeta.">
              <input
                value={editando.summary ?? ''}
                onChange={(e) => setEditando({ ...editando, summary: e.target.value })}
                className={INPUT}
                style={INPUT_STYLE}
              />
            </Campo>
          </div>

          <div className="mt-4">
            <Campo etiqueta="El caso completo" ayuda="Opcional: quÃ© problema resolvÃ­a y cÃ³mo.">
              <textarea
                rows={5}
                value={editando.body ?? ''}
                onChange={(e) => setEditando({ ...editando, body: e.target.value })}
                className={INPUT}
                style={INPUT_STYLE}
              />
            </Campo>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Etiquetas" ayuda="Separadas por coma: pos, tauri, react">
              <input
                value={(editando.tags ?? []).join(', ')}
                onChange={(e) => setEditando({ ...editando, tags: e.target.value.split(',') })}
                className={INPUT}
                style={INPUT_STYLE}
              />
            </Campo>
            <Campo etiqueta="Orden" ayuda="Menor primero.">
              <input
                type="number"
                value={editando.position ?? 0}
                onChange={(e) => setEditando({ ...editando, position: Number(e.target.value) })}
                className={INPUT}
                style={INPUT_STYLE}
              />
            </Campo>
          </div>

          <label className="mt-5 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={editando.published ?? false}
              onChange={(e) => setEditando({ ...editando, published: e.target.checked })}
              className="h-4 w-4"
            />
            <span>
              Publicado
              <span className="ml-2 text-xs" style={{ color: 'var(--color-muted-2)' }}>
                sin esto queda como borrador y no sale en el sitio
              </span>
            </span>
          </label>

          {error && (
            <p role="alert" className="mt-4 text-sm" style={{ color: '#ff6b6b' }}>
              {error}
            </p>
          )}

          <div className="mt-6 flex gap-3">
            <button type="submit" disabled={busy} className="rounded-lg px-5 py-2.5 text-sm font-bold disabled:opacity-50" style={BTN}>
              {busy ? 'Guardandoâ€¦' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={() => setEditando(null)}
              className="rounded-lg border px-5 py-2.5 text-sm"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {lista.length === 0 && (
          <p style={{ color: 'var(--color-muted)' }}>
            TodavÃ­a no hay proyectos. AgregÃ¡ el primero y aparece en el sitio al instante.
          </p>
        )}
        {lista.map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap items-center gap-4 rounded-xl border p-4"
            style={CARD}
          >
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 font-semibold">
                {p.title}
                {!p.published && (
                  <span
                    className="rounded px-2 py-0.5 text-[11px] font-normal"
                    style={{ background: 'rgba(255,107,53,0.15)', color: '#ff6b35' }}
                  >
                    borrador
                  </span>
                )}
              </p>
              <p className="truncate text-sm" style={{ color: 'var(--color-muted)' }}>
                /{p.slug} Â· {p.summary}
              </p>
            </div>
            <div className="flex gap-2 text-sm">
              <button
                onClick={() => setEditando({ ...p })}
                className="rounded-lg border px-3 py-1.5"
                style={{ borderColor: 'var(--color-border)' }}
              >
                Editar
              </button>
              <button onClick={() => void borrar(p)} className="rounded-lg px-3 py-1.5" style={{ color: '#ff6b6b' }}>
                Borrar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const PRACTICAS: { id: Practica; label: string }[] = [
  { id: 'software', label: 'Software y plataformas' },
  { id: 'ia', label: 'IA y automatizaciÃ³n' },
  { id: 'marketing', label: 'Marketing y crecimiento' },
];

const SERVICIO_VACIO: Partial<Service> = {
  slug: '',
  practice: 'software',
  title: '',
  summary: '',
  bullets: [],
  icon: null,
  featured: false,
  published: false,
  position: 0,
};

function Servicios() {
  const [lista, setLista] = useState<Service[]>([]);
  const [editando, setEditando] = useState<Partial<Service> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const cargar = () => panelServices().then(setLista).catch(() => setLista([]));
  useEffect(() => {
    void cargar();
  }, []);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!editando) return;
    setBusy(true);
    setError(null);
    try {
      await panelSaveService(editando);
      setEditando(null);
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
    }
    setBusy(false);
  }

  async function borrar(s: Service) {
    if (!s.id || !confirm(`Â¿Borrar "${s.title}"? No se puede deshacer.`)) return;
    await panelDeleteService(s.id);
    await cargar();
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setEditando({ ...SERVICIO_VACIO, position: lista.length })}
          className="rounded-lg px-4 py-2 text-sm font-bold"
          style={BTN}
        >
          Nuevo servicio
        </button>
      </div>

      {editando && (
        <form onSubmit={guardar} className="mb-8 rounded-2xl border p-6" style={CARD}>
          <h2 className="text-lg font-bold">{editando.id ? 'Editar' : 'Nuevo'} servicio</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="TÃ­tulo">
              <input
                value={editando.title ?? ''}
                onChange={(e) => setEditando({ ...editando, title: e.target.value })}
                className={INPUT}
                style={INPUT_STYLE}
              />
            </Campo>
            <Campo etiqueta="PrÃ¡ctica" ayuda="Define en quÃ© pestaÃ±a sale.">
              <select
                value={editando.practice ?? 'software'}
                onChange={(e) => setEditando({ ...editando, practice: e.target.value as Practica })}
                className={INPUT}
                style={INPUT_STYLE}
              >
                {PRACTICAS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </Campo>
          </div>

          <div className="mt-4">
            <Campo etiqueta="Resumen" ayuda="Dos o tres lÃ­neas. Es lo que se lee debajo del tÃ­tulo.">
              <textarea
                rows={3}
                value={editando.summary ?? ''}
                onChange={(e) => setEditando({ ...editando, summary: e.target.value })}
                className={INPUT}
                style={INPUT_STYLE}
              />
            </Campo>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="QuÃ© incluye" ayuda="Separado por coma: Panel propio, Roles, Reportes">
              <input
                value={(editando.bullets ?? []).join(', ')}
                onChange={(e) => setEditando({ ...editando, bullets: e.target.value.split(',') })}
                className={INPUT}
                style={INPUT_STYLE}
              />
            </Campo>
            <Campo etiqueta="Orden" ayuda="Menor primero.">
              <input
                type="number"
                value={editando.position ?? 0}
                onChange={(e) => setEditando({ ...editando, position: Number(e.target.value) })}
                className={INPUT}
                style={INPUT_STYLE}
              />
            </Campo>
          </div>

          <div className="mt-5 space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editando.published ?? false}
                onChange={(e) => setEditando({ ...editando, published: e.target.checked })}
                className="h-4 w-4"
              />
              <span>
                Publicado
                <span className="ml-2 text-xs" style={{ color: 'var(--color-muted-2)' }}>
                  sin esto no sale en el sitio
                </span>
              </span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editando.featured ?? false}
                onChange={(e) => setEditando({ ...editando, featured: e.target.checked })}
                className="h-4 w-4"
              />
              <span>
                Principal de su prÃ¡ctica
                <span className="ml-2 text-xs" style={{ color: 'var(--color-muted-2)' }}>
                  sale grande y de primero en esa pestaÃ±a
                </span>
              </span>
            </label>
          </div>

          {error && (
            <p role="alert" className="mt-4 text-sm" style={{ color: '#ff6b6b' }}>
              {error}
            </p>
          )}

          <div className="mt-6 flex gap-3">
            <button type="submit" disabled={busy} className="rounded-lg px-5 py-2.5 text-sm font-bold disabled:opacity-50" style={BTN}>
              {busy ? 'Guardandoâ€¦' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={() => setEditando(null)}
              className="rounded-lg border px-5 py-2.5 text-sm"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {lista.length === 0 && (
          <p style={{ color: 'var(--color-muted)' }}>
            Sin servicios todavÃ­a. Mientras no haya ninguno publicado, esa secciÃ³n no aparece en el
            sitio.
          </p>
        )}
        {lista.map((s) => (
          <div key={s.id} className="flex flex-wrap items-center gap-4 rounded-xl border p-4" style={CARD}>
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 font-semibold">
                {s.title}
                <span className="text-xs" style={{ color: 'var(--color-muted-2)' }}>
                  {PRACTICAS.find((p) => p.id === s.practice)?.label}
                </span>
                {s.featured && (
                  <span
                    className="rounded px-2 py-0.5 text-[11px] font-normal"
                    style={{ background: 'rgba(91,140,255,0.15)', color: '#5b8cff' }}
                  >
                    principal
                  </span>
                )}
                {!s.published && (
                  <span
                    className="rounded px-2 py-0.5 text-[11px] font-normal"
                    style={{ background: 'rgba(255,107,53,0.15)', color: '#ff6b35' }}
                  >
                    borrador
                  </span>
                )}
              </p>
              <p className="truncate text-sm" style={{ color: 'var(--color-muted)' }}>
                {s.summary}
              </p>
            </div>
            <div className="flex gap-2 text-sm">
              <button
                onClick={() => setEditando({ ...s })}
                className="rounded-lg border px-3 py-1.5"
                style={{ borderColor: 'var(--color-border)' }}
              >
                Editar
              </button>
              <button onClick={() => void borrar(s)} className="rounded-lg px-3 py-1.5" style={{ color: '#ff6b6b' }}>
                Borrar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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

function Testimonios() {
  const [lista, setLista] = useState<Testimonial[]>([]);
  const [editando, setEditando] = useState<Partial<Testimonial> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const cargar = () => panelTestimonials().then(setLista).catch(() => setLista([]));
  useEffect(() => {
    void cargar();
  }, []);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!editando) return;
    setBusy(true);
    setError(null);
    try {
      await panelSaveTestimonial(editando);
      setEditando(null);
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
    }
    setBusy(false);
  }

  async function borrar(t: Testimonial) {
    if (!t.id || !confirm(`Â¿Borrar el testimonio de ${t.author}? No se puede deshacer.`)) return;
    await panelDeleteTestimonial(t.id);
    await cargar();
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setEditando({ ...TESTIMONIO_VACIO, position: lista.length })}
          className="rounded-lg px-4 py-2 text-sm font-bold"
          style={BTN}
        >
          Nuevo testimonio
        </button>
      </div>

      {editando && (
        <form onSubmit={guardar} className="mb-8 rounded-2xl border p-6" style={CARD}>
          <h2 className="text-lg font-bold">{editando.id ? 'Editar' : 'Nuevo'} testimonio</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <Campo etiqueta="QuiÃ©n lo dijo">
              <input
                value={editando.author ?? ''}
                onChange={(e) => setEditando({ ...editando, author: e.target.value })}
                className={INPUT}
                style={INPUT_STYLE}
              />
            </Campo>
            <Campo etiqueta="Cargo" ayuda="Opcional. VacÃ­o no se muestra.">
              <input
                value={editando.role ?? ''}
                onChange={(e) => setEditando({ ...editando, role: e.target.value })}
                className={INPUT}
                style={INPUT_STYLE}
              />
            </Campo>
            <Campo etiqueta="Empresa" ayuda="Opcional.">
              <input
                value={editando.company ?? ''}
                onChange={(e) => setEditando({ ...editando, company: e.target.value })}
                className={INPUT}
                style={INPUT_STYLE}
              />
            </Campo>
          </div>

          <div className="mt-4">
            <Campo etiqueta="Lo que dijo" ayuda="Tal cual lo dijo. MÃ­nimo 20 caracteres.">
              <textarea
                rows={4}
                value={editando.text ?? ''}
                onChange={(e) => setEditando({ ...editando, text: e.target.value })}
                className={INPUT}
                style={INPUT_STYLE}
              />
            </Campo>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="CalificaciÃ³n" ayuda="De 1 a 5 estrellas.">
              <select
                value={editando.rating ?? 5}
                onChange={(e) => setEditando({ ...editando, rating: Number(e.target.value) })}
                className={INPUT}
                style={INPUT_STYLE}
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo etiqueta="Orden" ayuda="Menor primero.">
              <input
                type="number"
                value={editando.position ?? 0}
                onChange={(e) => setEditando({ ...editando, position: Number(e.target.value) })}
                className={INPUT}
                style={INPUT_STYLE}
              />
            </Campo>
          </div>

          <div className="mt-5 space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editando.published ?? false}
                onChange={(e) => setEditando({ ...editando, published: e.target.checked })}
                className="h-4 w-4"
              />
              <span>
                Publicado
                <span className="ml-2 text-xs" style={{ color: 'var(--color-muted-2)' }}>
                  sin esto no sale en el sitio
                </span>
              </span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editando.featured ?? false}
                onChange={(e) => setEditando({ ...editando, featured: e.target.checked })}
                className="h-4 w-4"
              />
              <span>
                Destacado
                <span className="ml-2 text-xs" style={{ color: 'var(--color-muted-2)' }}>
                  sale grande y de primero; marcar este apaga el anterior
                </span>
              </span>
            </label>
          </div>

          {error && (
            <p role="alert" className="mt-4 text-sm" style={{ color: '#ff6b6b' }}>
              {error}
            </p>
          )}

          <div className="mt-6 flex gap-3">
            <button type="submit" disabled={busy} className="rounded-lg px-5 py-2.5 text-sm font-bold disabled:opacity-50" style={BTN}>
              {busy ? 'Guardandoâ€¦' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={() => setEditando(null)}
              className="rounded-lg border px-5 py-2.5 text-sm"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {lista.length === 0 && (
          <p style={{ color: 'var(--color-muted)' }}>
            Sin testimonios todavÃ­a. Mientras no haya ninguno publicado, esa secciÃ³n no aparece en el
            sitio.
          </p>
        )}
        {lista.map((t) => (
          <div key={t.id} className="flex flex-wrap items-center gap-4 rounded-xl border p-4" style={CARD}>
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 font-semibold">
                {t.author}
                <span style={{ color: '#ffbd2e' }}>{'â˜…'.repeat(t.rating)}</span>
                {t.featured && (
                  <span
                    className="rounded px-2 py-0.5 text-[11px] font-normal"
                    style={{ background: 'rgba(91,140,255,0.15)', color: 'var(--color-accent)' }}
                  >
                    destacado
                  </span>
                )}
                {!t.published && (
                  <span
                    className="rounded px-2 py-0.5 text-[11px] font-normal"
                    style={{ background: 'rgba(255,107,53,0.15)', color: '#ff6b35' }}
                  >
                    borrador
                  </span>
                )}
              </p>
              <p className="truncate text-sm" style={{ color: 'var(--color-muted)' }}>
                {t.text}
              </p>
            </div>
            <div className="flex gap-2 text-sm">
              <button
                onClick={() => setEditando({ ...t })}
                className="rounded-lg border px-3 py-1.5"
                style={{ borderColor: 'var(--color-border)' }}
              >
                Editar
              </button>
              <button onClick={() => void borrar(t)} className="rounded-lg px-3 py-1.5" style={{ color: '#ff6b6b' }}>
                Borrar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Campo({
  etiqueta,
  ayuda,
  children,
}: {
  etiqueta: string;
  ayuda?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span style={{ color: 'var(--color-muted)' }}>{etiqueta}</span>
      <div className="mt-1.5">{children}</div>
      {ayuda && (
        <span className="mt-1 block text-[11.5px]" style={{ color: 'var(--color-muted-2)' }}>
          {ayuda}
        </span>
      )}
    </label>
  );
}
