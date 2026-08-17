'use client';
import { useEffect, useMemo, useState } from 'react';
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
  type PanelUser,
} from '@/lib/api';
import type { Project, Testimonial } from '@/types';

/**
 * Panel de Kizercode: cargar proyectos y testimonios sin tocar código.
 *
 * Corre entero en el navegador contra la API — el sitio es estático. El token
 * vive en sessionStorage: se va al cerrar la pestaña.
 *
 * Usa el mismo sistema de diseño que la landing (.kz-card, .kz-btn, .kz-tab y
 * las variables de color), así el panel no se siente otra aplicación.
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

  if (cargando) return <Centrado>{<Cargando />}</Centrado>;
  if (!user) return <Centrado>{<Login onEntrar={setUser} />}</Centrado>;

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

function Centrado({ children }: { children: React.ReactNode }) {
  return <div className="grid min-h-[70vh] place-items-center">{children}</div>;
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

function Marca({ size = 34 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="grid shrink-0 place-items-center rounded-xl font-black"
      style={{
        width: size,
        height: size,
        background: 'var(--color-accent-strong)',
        color: '#fff',
        fontSize: size * 0.42,
        boxShadow: '0 0 0 1px rgba(91,140,255,0.35)',
      }}
    >
      K
    </span>
  );
}

// ── Escritorio ──

type Pestana = 'proyectos' | 'testimonios';

function Escritorio({ user, onSalir }: { user: PanelUser; onSalir: () => void }) {
  const [pestana, setPestana] = useState<Pestana>('proyectos');
  const [conteos, setConteos] = useState<Record<Pestana, number | null>>({
    proyectos: null,
    testimonios: null,
  });

  const marcar = (p: Pestana) => (n: number) =>
    setConteos((c) => (c[p] === n ? c : { ...c, [p]: n }));

  return (
    <div className="w-full">
      <header
        className="sticky top-0 z-20 -mx-6 mb-8 border-b px-6 py-4 backdrop-blur-xl"
        style={{ background: 'var(--color-nav-bg)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Marca />
            <div>
              <p className="kz-eyebrow">// panel</p>
              <h1 className="text-lg font-black leading-tight tracking-tight">Kizercode</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className="hidden rounded-full border px-3 py-1.5 text-[13px] sm:inline"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
            >
              {user.name}
            </span>
            <button
              onClick={onSalir}
              className="rounded-lg border px-3 py-1.5 text-[13px] transition-colors"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
            >
              Salir
            </button>
          </div>
        </div>

        <nav aria-label="Secciones del panel" className="mt-4 flex gap-2">
          {(['proyectos', 'testimonios'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPestana(p)}
              aria-current={pestana === p ? 'page' : undefined}
              className={`kz-tab capitalize ${pestana === p ? 'kz-tab-activa' : ''}`}
            >
              {p}
              {conteos[p] !== null && (
                <span className="ml-2 text-[11.5px]" style={{ color: 'var(--color-muted-2)' }}>
                  {conteos[p]}
                </span>
              )}
            </button>
          ))}
        </nav>
      </header>

      <div hidden={pestana !== 'proyectos'}>
        <Proyectos onConteo={marcar('proyectos')} />
      </div>
      <div hidden={pestana !== 'testimonios'}>
        <Testimonios onConteo={marcar('testimonios')} />
      </div>
    </div>
  );
}

// ── Piezas compartidas ──

const INPUT =
  'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]';
const INPUT_STYLE: React.CSSProperties = {
  background: 'var(--color-bg-2)',
  borderColor: 'var(--color-border)',
  color: 'var(--color-text)',
};

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
    <label
      className="flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition-colors"
      style={{
        borderColor: activo ? 'var(--color-accent)' : 'var(--color-border)',
        background: activo
          ? 'color-mix(in srgb, var(--color-accent) 8%, transparent)'
          : 'var(--color-bg-2)',
      }}
    >
      <input
        type="checkbox"
        checked={activo}
        onChange={(e) => onCambio(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-accent-strong)]"
      />
      <span>
        <span className="font-semibold">{etiqueta}</span>
        <span className="mt-0.5 block text-[11.5px]" style={{ color: 'var(--color-muted-2)' }}>
          {ayuda}
        </span>
      </span>
    </label>
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
      <button onClick={onCrear} className="kz-btn kz-btn-primario mt-6">
        {cta}
      </button>
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
      <button
        type="button"
        onClick={onCerrar}
        aria-label="Cerrar el formulario"
        className="rounded-lg border px-2.5 py-1 text-sm"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
      >
        ✕
      </button>
    </div>
  );
}

function Acciones({ busy, onCancelar }: { busy: boolean; onCancelar: () => void }) {
  return (
    <div
      className="mt-7 flex gap-3 border-t pt-5"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <button type="submit" disabled={busy} className="kz-btn kz-btn-primario disabled:opacity-50">
        {busy ? 'Guardando…' : 'Guardar'}
      </button>
      <button type="button" onClick={onCancelar} className="kz-btn kz-btn-secundario">
        Cancelar
      </button>
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
  detalle,
  etiquetas,
  onEditar,
  onBorrar,
}: {
  titulo: React.ReactNode;
  detalle: string;
  etiquetas: React.ReactNode;
  onEditar: () => void;
  onBorrar: () => void;
}) {
  return (
    <li className="kz-card flex flex-wrap items-center gap-4 p-4">
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
        <button
          onClick={onEditar}
          className="rounded-lg border px-3 py-1.5 transition-colors"
          style={{ borderColor: 'var(--color-border)' }}
        >
          Editar
        </button>
        <button onClick={onBorrar} className="rounded-lg px-3 py-1.5" style={{ color: '#ff6b6b' }}>
          Borrar
        </button>
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
        <h2 className="text-xl font-black tracking-tight">{titulo}</h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>
          {texto}
        </p>
      </div>
      <button onClick={onCrear} className="kz-btn kz-btn-primario">
        {cta}
      </button>
    </div>
  );
}

// ── Login ──

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
    <form onSubmit={entrar} className="kz-card kz-card-principal w-full max-w-sm p-8">
      <Marca size={40} />
      <p className="kz-eyebrow mt-5">// panel</p>
      <h1 className="mt-2 text-2xl font-black tracking-tight">Entrar</h1>
      <p className="mt-2 text-sm" style={{ color: 'var(--color-muted)' }}>
        La sesión dura lo que dure esta pestaña.
      </p>

      <div className="mt-6 space-y-4">
        <Campo etiqueta="Correo">
          <input
            type="email"
            autoFocus
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={INPUT}
            style={INPUT_STYLE}
          />
        </Campo>
        <Campo etiqueta="Contraseña">
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={INPUT}
            style={INPUT_STYLE}
          />
        </Campo>
      </div>

      {error && <Aviso mensaje={error} />}

      <button
        type="submit"
        disabled={busy}
        className="kz-btn kz-btn-primario mt-6 w-full justify-center disabled:opacity-50"
      >
        {busy ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
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
              detalle={`/${p.slug} · ${p.summary}`}
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
    }
    setBusy(false);
  }

  async function borrar(t: Testimonial) {
    if (!t.id || !confirm(`¿Borrar el testimonio de ${t.author}? No se puede deshacer.`)) return;
    await panelDeleteTestimonial(t.id);
    await cargar();
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
                <input
                  value={editando.author ?? ''}
                  onChange={(e) => setEditando({ ...editando, author: e.target.value })}
                  className={INPUT}
                  style={INPUT_STYLE}
                />
              </Campo>
              <Campo etiqueta="Cargo" ayuda="Opcional. Vacío no se muestra.">
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
              <Campo etiqueta="Lo que dijo" ayuda="Tal cual lo dijo. Mínimo 20 caracteres.">
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
              <Campo etiqueta="Calificación" ayuda="De 1 a 5 estrellas.">
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
              titulo={
                <>
                  {t.author}
                  <span aria-label={`${t.rating} de 5`} style={{ color: '#ffbd2e' }}>
                    {'★'.repeat(t.rating)}
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
