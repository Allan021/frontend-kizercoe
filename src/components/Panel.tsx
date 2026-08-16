'use client';
import { useEffect, useState } from 'react';
import {
  clearPanelToken,
  getPanelToken,
  panelDeleteProject,
  panelLogin,
  panelMe,
  panelProjects,
  panelSaveProject,
  type PanelUser,
} from '@/lib/api';
import type { Project } from '@/types';

/**
 * Panel de Kizercode: cargar los proyectos sin tocar código.
 *
 * Corre entero en el navegador contra la API — el sitio es estático. El token
 * vive en sessionStorage: se va al cerrar la pestaña.
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

  if (cargando) return <p style={{ color: 'var(--color-muted)' }}>Cargando…</p>;
  if (!user) return <Login onEntrar={setUser} />;

  return (
    <Proyectos
      user={user}
      onSalir={() => {
        clearPanelToken();
        setUser(null);
      }}
    />
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
  background: 'linear-gradient(135deg,#00c8ff,#00ff9d)',
  color: '#040d18',
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
        Contraseña
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
        {busy ? 'Entrando…' : 'Entrar'}
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

function Proyectos({ user, onSalir }: { user: PanelUser; onSalir: () => void }) {
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
    if (!p.id || !confirm(`¿Borrar "${p.title}"? No se puede deshacer.`)) return;
    await panelDeleteProject(p.id);
    await cargar();
  }

  return (
    <div className="w-full">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="section-tag">// panel</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight">Proyectos</h1>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span style={{ color: 'var(--color-muted)' }}>{user.name}</span>
          <button onClick={onSalir} className="underline underline-offset-2" style={{ color: 'var(--color-muted)' }}>
            Salir
          </button>
          <button
            onClick={() => setEditando({ ...VACIO, position: lista.length })}
            className="rounded-lg px-4 py-2 font-bold"
            style={BTN}
          >
            Nuevo proyecto
          </button>
        </div>
      </header>

      {editando && (
        <form onSubmit={guardar} className="mb-8 rounded-2xl border p-6" style={CARD}>
          <h2 className="text-lg font-bold">{editando.id ? 'Editar' : 'Nuevo'} proyecto</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Título" ayuda="Si dejás el enlace vacío, se arma con esto.">
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
                placeholder="se arma solo del título"
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
            <Campo etiqueta="Período" ayuda="2026, o 2025–2026">
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
                placeholder="https://…"
                className={INPUT}
                style={INPUT_STYLE}
              />
            </Campo>
            <Campo etiqueta="Ver en vivo (URL)">
              <input
                value={editando.liveUrl ?? ''}
                onChange={(e) => setEditando({ ...editando, liveUrl: e.target.value })}
                placeholder="https://…"
                className={INPUT}
                style={INPUT_STYLE}
              />
            </Campo>
          </div>

          <div className="mt-4">
            <Campo etiqueta="Resumen" ayuda="Una línea. Es lo que se lee en la tarjeta.">
              <input
                value={editando.summary ?? ''}
                onChange={(e) => setEditando({ ...editando, summary: e.target.value })}
                className={INPUT}
                style={INPUT_STYLE}
              />
            </Campo>
          </div>

          <div className="mt-4">
            <Campo etiqueta="El caso completo" ayuda="Opcional: qué problema resolvía y cómo.">
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
              {busy ? 'Guardando…' : 'Guardar'}
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
            Todavía no hay proyectos. Agregá el primero y aparece en el sitio al instante.
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
                /{p.slug} · {p.summary}
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
