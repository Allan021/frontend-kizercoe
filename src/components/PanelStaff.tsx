import { useEffect, useState } from 'react';
import { MessageCircle, Pencil, Plus, Trash2, UserCog, X } from 'lucide-react';
import { panelBorrarStaff, panelCrearStaff, panelEditarStaff, panelStaff, waDe, type Staff, type StaffDatos } from '@/lib/api';

/**
 * Mi staff: el equipo que el bot de WhatsApp reconoce por su número. A ellos
 * no les vende: los saluda por su nombre, les pregunta por su trabajo (a un
 * técnico, por las instalaciones de la agenda) y lo que reportan te llega a
 * vos. Apagar a alguien lo devuelve al trato de cliente sin borrarlo.
 */

const ROLES = [
  ['tecnico', 'Técnico'],
  ['ventas', 'Ventas'],
  ['admin', 'Administración'],
  ['otro', 'Otro'],
] as const;

const etiquetaRol = (r: string) => ROLES.find(([k]) => k === r)?.[1] ?? r;

const VACIO: StaffDatos = { nombre: '', telefono: '', rol: 'tecnico', activo: true, notas: '' };

export function PanelStaff({ onConteo }: { onConteo: (n: number) => void }) {
  const [lista, setLista] = useState<Staff[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editando, setEditando] = useState<Staff | 'nuevo' | null>(null);

  const cargar = () => {
    setError(null);
    panelStaff()
      .then(setLista)
      .catch((e) => setError(e instanceof Error ? e.message : 'No se pudo cargar el staff'));
  };
  useEffect(cargar, []);
  useEffect(() => {
    if (lista) onConteo(lista.filter((p) => p.activo).length);
  }, [lista, onConteo]);

  async function guardar(d: StaffDatos) {
    setError(null);
    try {
      const p = editando === 'nuevo' ? await panelCrearStaff(d) : await panelEditarStaff((editando as Staff).id, d);
      setLista((l) => {
        const resto = (l ?? []).filter((x) => x.id !== p.id);
        return [...resto, p].sort((a, b) => a.nombre.localeCompare(b.nombre));
      });
      setEditando(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar');
    }
  }

  async function alternar(p: Staff) {
    try {
      const n = await panelEditarStaff(p.id, { activo: !p.activo });
      setLista((l) => (l ?? []).map((x) => (x.id === p.id ? n : x)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cambiar');
    }
  }

  async function borrar(p: Staff) {
    if (!confirm(`¿Quitar a ${p.nombre} del staff? El bot lo vuelve a tratar como cliente.`)) return;
    try {
      await panelBorrarStaff(p.id);
      setLista((l) => (l ?? []).filter((x) => x.id !== p.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo borrar');
    }
  }

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm" style={{ color: 'var(--color-muted)' }}>
          Cuando alguien de esta lista le escribe al WhatsApp, el bot no le vende: lo saluda por su nombre, le pregunta por
          su trabajo y lo que reporta te llega a vos. A los técnicos les pregunta por las instalaciones de la agenda.
        </p>
        <button onClick={() => setEditando('nuevo')} className="kz-btn kz-btn-primario inline-flex items-center gap-1.5 px-3 py-1.5 text-sm">
          <Plus size={14} /> Agregar persona
        </button>
      </div>

      {error && (
        <p role="status" className="mb-4 rounded-lg border px-4 py-3 text-sm" style={{ borderColor: 'rgba(255,107,107,0.4)', background: 'rgba(255,107,107,0.08)', color: '#ff8f8f' }}>
          {error}
        </p>
      )}

      {editando && (
        <Formulario
          inicial={editando === 'nuevo' ? VACIO : { ...editando, notas: editando.notas ?? '' }}
          titulo={editando === 'nuevo' ? 'Nueva persona' : `Editar a ${editando.nombre}`}
          onGuardar={guardar}
          onCerrar={() => setEditando(null)}
        />
      )}

      {!lista ? (
        <p className="kz-eyebrow">// cargando</p>
      ) : lista.length === 0 ? (
        <div className="kz-card p-8 text-center">
          <UserCog className="mx-auto" size={26} style={{ color: 'var(--color-muted)' }} />
          <p className="mt-3 text-sm" style={{ color: 'var(--color-muted)' }}>
            Todavía no hay nadie. Agregá a tus técnicos para que el bot los reconozca.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {lista.map((p) => {
            const wa = waDe(p.telefono);
            return (
              <li key={p.id} className="kz-card p-4" style={{ opacity: p.activo ? 1 : 0.55 }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-black"
                      style={{ background: 'color-mix(in srgb, var(--color-accent) 18%, transparent)', color: 'var(--color-accent-soft)' }}
                    >
                      {p.nombre.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('')}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-bold">{p.nombre}</p>
                      <p className="text-[12.5px]" style={{ color: 'var(--color-muted)' }}>
                        {etiquetaRol(p.rol)} · {p.activo ? 'el bot lo reconoce' : 'apagado'}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button onClick={() => setEditando(p)} className="kz-tab p-1.5" aria-label={`Editar a ${p.nombre}`}><Pencil size={14} /></button>
                    <button onClick={() => borrar(p)} className="kz-tab p-1.5" aria-label={`Quitar a ${p.nombre}`}><Trash2 size={14} /></button>
                  </div>
                </div>
                {p.notas && <p className="mt-3 text-[13px]">{p.notas}</p>}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {wa && (
                    <a href={wa} target="_blank" rel="noreferrer" className="kz-tab inline-flex items-center gap-1.5">
                      <MessageCircle size={14} /> {p.telefono}
                    </a>
                  )}
                  <label className="ml-auto inline-flex cursor-pointer items-center gap-2 text-[13px]" style={{ color: 'var(--color-muted)' }}>
                    <input type="checkbox" checked={p.activo} onChange={() => alternar(p)} />
                    Activo
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function Formulario({
  inicial,
  titulo,
  onGuardar,
  onCerrar,
}: {
  inicial: StaffDatos;
  titulo: string;
  onGuardar: (d: StaffDatos) => void;
  onCerrar: () => void;
}) {
  const [d, setD] = useState<StaffDatos>(inicial);
  const campo = 'w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]';
  const estilo = { background: 'var(--color-bg-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' };
  const listo = d.nombre.trim().length >= 2 && d.telefono.replace(/\D/g, '').length >= 8;

  return (
    <form
      className="kz-card mb-6 p-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (listo) onGuardar({ ...d, notas: d.notas?.trim() || null });
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="font-bold">{titulo}</p>
        <button type="button" onClick={onCerrar} className="kz-tab p-1.5" aria-label="Cerrar"><X size={14} /></button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-[13px]">
          Nombre
          <input className={`${campo} mt-1`} style={estilo} value={d.nombre} onChange={(e) => setD({ ...d, nombre: e.target.value })} placeholder="Saúl Castro" required />
        </label>
        <label className="text-[13px]">
          WhatsApp
          <input className={`${campo} mt-1`} style={estilo} value={d.telefono} onChange={(e) => setD({ ...d, telefono: e.target.value })} placeholder="8921-0653" inputMode="tel" required />
        </label>
        <label className="text-[13px]">
          Rol
          <select className={`${campo} mt-1`} style={estilo} value={d.rol} onChange={(e) => setD({ ...d, rol: e.target.value })}>
            {ROLES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </label>
        <label className="flex items-end gap-2 pb-2.5 text-[13px]">
          <input type="checkbox" checked={d.activo} onChange={(e) => setD({ ...d, activo: e.target.checked })} />
          El bot lo reconoce
        </label>
        <label className="text-[13px] sm:col-span-2">
          Qué tiene que saber el bot de esta persona <span style={{ color: 'var(--color-muted)' }}>(opcional)</span>
          <input className={`${campo} mt-1`} style={estilo} value={d.notas ?? ''} onChange={(e) => setD({ ...d, notas: e.target.value })} placeholder="Anda haciendo las instalaciones de cámaras" />
        </label>
      </div>
      <p className="mt-3 text-[12px]" style={{ color: 'var(--color-muted)' }}>
        Los números de 8 dígitos se toman como de Honduras (+504).
      </p>
      <div className="mt-4 flex gap-2">
        <button type="submit" disabled={!listo} className="kz-btn kz-btn-primario px-4 py-2 text-sm disabled:opacity-40">Guardar</button>
        <button type="button" onClick={onCerrar} className="kz-tab">Cancelar</button>
      </div>
    </form>
  );
}
