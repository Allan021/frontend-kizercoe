import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Bot, CalendarCheck, CalendarDays, MapPin, MessageCircle, Sparkles, UserCog, Users, Wrench } from 'lucide-react';
import { panelLeads, panelStaff, panelVisitas, waDe, type Lead, type Staff, type Visita } from '@/lib/api';
import type { Pestana } from '@/components/Panel';

/**
 * "Hoy": lo que hay que atender ahora, en una pantalla. Leads nuevos, visitas
 * por confirmar, la agenda de hoy y el estado del asistente de WhatsApp.
 * Cada número lleva a su sección. No decide nada: muestra y enlaza.
 */

const hoyISO = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Tegucigalpa' });
const SEMANA = 7 * 24 * 3600 * 1000;

function hora(h: string): string {
  const [hh, mm] = h.split(':').map(Number);
  return `${((hh! + 11) % 12) + 1}:${String(mm).padStart(2, '0')} ${hh! < 12 ? 'a.m.' : 'p.m.'}`;
}

export function PanelHoy({ user, onIr }: { user: string; onIr: (p: Pestana) => void }) {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [visitas, setVisitas] = useState<Visita[] | null>(null);
  const [staff, setStaff] = useState<Staff[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([panelLeads(), panelVisitas(), panelStaff()])
      .then(([l, v, s]) => {
        setLeads(l);
        setVisitas(v);
        setStaff(s);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'No se pudo cargar'));
  }, []);

  const n = useMemo(() => {
    const l = leads ?? [];
    const v = visitas ?? [];
    const hoy = hoyISO();
    return {
      nuevos: l.filter((x) => x.status === 'new'),
      semana: l.filter((x) => Date.now() - new Date(x.createdAt).getTime() < SEMANA).length,
      pendientes: v.filter((x) => x.estado === 'pendiente'),
      agendaHoy: v.filter((x) => x.estado === 'confirmada' && x.fecha === hoy).sort((a, b) => (a.hora ?? '').localeCompare(b.hora ?? '')),
      proximas: v.filter((x) => x.estado === 'confirmada' && x.fecha && x.fecha > hoy).length,
      hechas: v.filter((x) => x.estado === 'realizada').length,
      tecnicos: (staff ?? []).filter((s) => s.activo && s.rol === 'tecnico'),
    };
  }, [leads, visitas, staff]);

  const saludo = (() => {
    const h = Number(new Date().toLocaleTimeString('en-GB', { timeZone: 'America/Tegucigalpa', hour: '2-digit' }));
    return h < 12 ? 'Buenos días' : h < 18 ? 'Buenas tardes' : 'Buenas noches';
  })();
  const fecha = new Date().toLocaleDateString('es-HN', { timeZone: 'America/Tegucigalpa', weekday: 'long', day: 'numeric', month: 'long' });
  const cargando = !leads && !error;

  return (
    <section className="kzp-vista">
      <p className="kz-eyebrow">// {fecha}</p>
      <h2 className="kzp-titulo mt-1">
        {saludo}, {user.split(' ')[0]}.
      </h2>
      <p className="kzp-sub">
        {cargando
          ? 'Revisando qué hay…'
          : n.nuevos.length + n.pendientes.length === 0
            ? 'Nada pendiente. Todo atendido.'
            : `${n.nuevos.length} lead${n.nuevos.length === 1 ? '' : 's'} por contestar y ${n.pendientes.length} visita${n.pendientes.length === 1 ? '' : 's'} por confirmar.`}
      </p>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: 'rgba(255,107,107,0.4)', background: 'rgba(255,107,107,0.08)', color: 'var(--kzp-rojo)' }}>
          {error}
        </p>
      )}

      {/* ── Números ── */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cargando ? (
          Array.from({ length: 4 }, (_, i) => <div key={i} className="kzp-esqueleto h-[108px]" />)
        ) : (
          <>
            <Kpi titulo="Leads nuevos" valor={n.nuevos.length} nota={`+${n.semana} esta semana`} tono="var(--kzp-azul)" Icono={Users} onClick={() => onIr('leads')} />
            <Kpi titulo="Por confirmar" valor={n.pendientes.length} nota="visitas que pidió la gente" tono="var(--kzp-ambar)" Icono={CalendarCheck} onClick={() => onIr('visitas')} />
            <Kpi titulo="Hoy en ruta" valor={n.agendaHoy.length} nota={`${n.proximas} más esta semana y después`} tono="var(--green)" Icono={CalendarDays} onClick={() => onIr('visitas')} />
            <Kpi titulo="Instalaciones" valor={n.hechas} nota="con ficha y bitácora" tono="var(--navy)" Icono={Wrench} onClick={() => onIr('visitas')} />
          </>
        )}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* ── Para atender ahora ── */}
        <div className="space-y-4">
          <Bloque titulo="Leads por contestar" accion="Ver todos" onAccion={() => onIr('leads')} vacio={!cargando && n.nuevos.length === 0 ? 'Ninguno sin contestar.' : undefined}>
            {n.nuevos.slice(0, 5).map((l) => (
              <li key={l.id} className="flex items-center gap-3 py-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[12px] font-bold" style={{ background: 'color-mix(in srgb, var(--kzp-azul) 14%, transparent)', color: 'var(--kzp-azul)' }}>
                  {l.name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('')}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{l.name}</span>
                  <span className="block truncate text-[12.5px]" style={{ color: 'var(--color-muted)' }}>
                    {l.service} · {l.source === 'whatsapp' ? 'WhatsApp' : l.source === 'demo' ? 'Demo' : 'Formulario'}
                  </span>
                </span>
                {l.phone && waDe(l.phone) ? (
                  <a href={waDe(l.phone)!} target="_blank" rel="noreferrer" className="kzp-icono-btn" aria-label={`WhatsApp a ${l.name}`}>
                    <MessageCircle size={16} />
                  </a>
                ) : (
                  <a href={`mailto:${l.email}`} className="kz-tab text-[12.5px]">Correo</a>
                )}
              </li>
            ))}
          </Bloque>

          <Bloque titulo="Visitas por confirmar" accion="Programar" onAccion={() => onIr('visitas')} vacio={!cargando && n.pendientes.length === 0 ? 'Nada pendiente.' : undefined}>
            {n.pendientes.slice(0, 5).map((v) => (
              <li key={v.id} className="flex items-center gap-3 py-2.5">
                <MapPin size={16} className="shrink-0" style={{ color: 'var(--kzp-ambar)' }} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    {v.nombre} <span className="font-normal" style={{ color: 'var(--color-muted)' }}>· {v.servicio}</span>
                  </span>
                  <span className="block truncate text-[12.5px]" style={{ color: 'var(--color-muted)' }}>
                    {v.tipo === 'local' ? 'En el local' : [v.municipio, v.direccion].filter(Boolean).join(', ')}
                    {v.preferencia ? ` · le queda bien: ${v.preferencia}` : ''}
                  </span>
                </span>
              </li>
            ))}
          </Bloque>
        </div>

        {/* ── Hoy y asistente ── */}
        <div className="space-y-4">
          <Bloque titulo="Agenda de hoy" accion="Agenda" onAccion={() => onIr('visitas')} vacio={!cargando && n.agendaHoy.length === 0 ? 'Sin visitas confirmadas para hoy.' : undefined}>
            {n.agendaHoy.map((v) => (
              <li key={v.id} className="flex items-start gap-3 py-2.5">
                <span className="w-16 shrink-0 font-mono text-[12.5px] font-semibold" style={{ color: 'var(--green2)' }}>
                  {v.hora ? hora(v.hora) : '—'}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{v.nombre}</span>
                  <span className="block truncate text-[12.5px]" style={{ color: 'var(--color-muted)' }}>
                    {v.tipo === 'local' ? 'En el local' : [v.municipio, v.direccion].filter(Boolean).join(', ')}
                  </span>
                </span>
              </li>
            ))}
          </Bloque>

          <div className="kz-card p-5">
            <p className="flex items-center gap-2 text-sm font-bold">
              <Bot size={16} style={{ color: 'var(--green2)' }} /> Asistente de WhatsApp
              <span className="kz-latido ml-auto" aria-hidden="true" />
            </p>
            <p className="mt-2 text-[13px]" style={{ color: 'var(--color-muted)' }}>
              Atiende el +504 8809-1744 las 24 horas: cotiza, pide visitas y deja cada lead acá.
            </p>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[13px]">
              <dt style={{ color: 'var(--color-muted)' }}>Técnicos</dt>
              <dd>
                {cargando ? '…' : n.tecnicos.length ? n.tecnicos.map((t) => t.nombre.split(' ')[0]).join(', ') : (
                  <button onClick={() => onIr('staff')} className="underline-offset-2 hover:underline" style={{ color: 'var(--kzp-ambar)' }}>
                    ninguno activo: agregalo
                  </button>
                )}
              </dd>
              <dt style={{ color: 'var(--color-muted)' }}>Agente</dt>
              <dd>+504 8921-0653</dd>
            </dl>
            <button onClick={() => onIr('staff')} className="kz-tab mt-4 inline-flex items-center gap-1.5">
              <UserCog size={14} /> Mi staff
            </button>
          </div>

          <button onClick={() => onIr('asistente')} className="w-full rounded-2xl border p-4 text-left text-[13px] transition-colors hover:border-ring" style={{ borderColor: 'var(--line)', background: 'color-mix(in srgb, var(--green) 6%, transparent)' }}>
            <p className="flex items-center gap-2 font-semibold" style={{ color: 'var(--green2)' }}>
              <Sparkles size={14} /> Preguntale al asistente
            </p>
            <p className="mt-1" style={{ color: 'var(--color-muted)' }}>
              "¿Qué leads de cámaras no he contestado?", "¿cuál es la clave del DVR de Wendy?", "resumime el día".
              También <kbd className="kzp-kbd !ml-0">Ctrl K</kbd> busca desde cualquier parte.
            </p>
          </button>
        </div>
      </div>
    </section>
  );
}

function Kpi({ titulo, valor, nota, tono, Icono, onClick }: { titulo: string; valor: number; nota: string; tono: string; Icono: typeof Users; onClick: () => void }) {
  return (
    <button onClick={onClick} className="kzp-kpi" style={{ '--kzp-tono': tono } as React.CSSProperties}>
      <span className="kzp-kpi-titulo">
        <Icono size={14} style={{ color: tono }} /> {titulo}
      </span>
      <span className="kzp-kpi-valor">{valor}</span>
      <span className="kzp-kpi-nota">{nota}</span>
    </button>
  );
}

function Bloque({ titulo, accion, onAccion, vacio, children }: { titulo: string; accion: string; onAccion: () => void; vacio?: string; children: React.ReactNode }) {
  return (
    <div className="kz-card p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold">{titulo}</p>
        <button onClick={onAccion} className="inline-flex items-center gap-1 text-[12.5px] font-semibold" style={{ color: 'var(--green2)' }}>
          {accion} <ArrowRight size={13} />
        </button>
      </div>
      {vacio ? (
        <p className="mt-3 text-[13px]" style={{ color: 'var(--color-muted-2)' }}>{vacio}</p>
      ) : (
        <ul className="mt-2 divide-y" style={{ borderColor: 'var(--line)' }}>{children}</ul>
      )}
    </div>
  );
}
