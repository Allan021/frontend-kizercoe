'use client';
import { useEffect, useMemo, useState } from 'react';
import { fetchServices } from '@/lib/api';
import type { Practica, Service } from '@/types';

/**
 * Servicios agrupados por práctica, con pestañas.
 *
 * Todo viene del panel. Sin servicios publicados la sección desaparece: nada
 * de tarjetas de relleno.
 *
 * Las pestañas siguen el patrón ARIA de tablist — flechas para moverse, Home y
 * End para los extremos — porque una fila de <div> con onClick no se puede usar
 * con el teclado.
 */

const PRACTICAS: { id: Practica; label: string }[] = [
  { id: 'software', label: 'Software y plataformas' },
  { id: 'ia', label: 'IA y automatización' },
  { id: 'marketing', label: 'Marketing y crecimiento' },
];

export default function Services() {
  const [lista, setLista] = useState<Service[] | null>(null);
  const [activa, setActiva] = useState<Practica>('software');

  useEffect(() => {
    fetchServices()
      .then(setLista)
      .catch(() => setLista([]));
  }, []);

  // Solo se muestran las pestañas que tienen algo adentro.
  const conContenido = useMemo(
    () => PRACTICAS.filter((p) => (lista ?? []).some((s) => s.practice === p.id)),
    [lista],
  );

  useEffect(() => {
    if (conContenido.length > 0 && !conContenido.some((p) => p.id === activa)) {
      setActiva(conContenido[0].id);
    }
  }, [conContenido, activa]);

  if (!lista) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="kz-skeleton h-56 rounded-2xl" />
        ))}
      </div>
    );
  }
  if (conContenido.length === 0) return null;

  const visibles = lista.filter((s) => s.practice === activa);
  const destacado = visibles.find((s) => s.featured) ?? null;
  const resto = visibles.filter((s) => s !== destacado);

  function moverFoco(e: React.KeyboardEvent, i: number) {
    const teclas: Record<string, number> = {
      ArrowRight: i + 1,
      ArrowLeft: i - 1,
      Home: 0,
      End: conContenido.length - 1,
    };
    const destino = teclas[e.key];
    if (destino === undefined) return;
    e.preventDefault();
    const j = (destino + conContenido.length) % conContenido.length;
    setActiva(conContenido[j].id);
    document.getElementById(`tab-${conContenido[j].id}`)?.focus();
  }

  return (
    <>
      {conContenido.length > 1 && (
        <div role="tablist" aria-label="Prácticas" className="mb-10 flex flex-wrap gap-2">
          {conContenido.map((p, i) => (
            <button
              key={p.id}
              id={`tab-${p.id}`}
              role="tab"
              type="button"
              aria-selected={activa === p.id}
              aria-controls={`panel-${p.id}`}
              tabIndex={activa === p.id ? 0 : -1}
              onClick={() => setActiva(p.id)}
              onKeyDown={(e) => moverFoco(e, i)}
              className={`kz-tab ${activa === p.id ? 'kz-tab-activa' : ''}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      <div id={`panel-${activa}`} role="tabpanel" aria-labelledby={`tab-${activa}`} tabIndex={-1}>
        {destacado && <Principal s={destacado} />}

        {resto.length > 0 && (
          <ul className="grid list-none gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {resto.map((s, i) => (
              <li key={s.slug}>
                <Tarjeta s={s} n={i + (destacado ? 2 : 1)} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

/** El número correlativo que el diseño usa como acento: 01, 02, 03… */
const numero = (n: number) => String(n).padStart(2, '0');

function Principal({ s }: { s: Service }) {
  return (
    <article className="kz-card kz-card-principal mb-5 p-8 sm:p-10">
      <p className="kz-eyebrow">
        {numero(1)} <span aria-hidden="true">·</span> CORE
      </p>
      <h3 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">{s.title}</h3>
      <p className="mt-4 max-w-2xl leading-relaxed" style={{ color: 'var(--color-muted)' }}>
        {s.summary}
      </p>

      {s.bullets.length > 0 && (
        <ul className="mt-7 flex list-none flex-wrap gap-2">
          {s.bullets.map((b) => (
            <li key={b} className="kz-chip">
              {b}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function Tarjeta({ s, n }: { s: Service; n: number }) {
  return (
    <article className="kz-card h-full p-6">
      <p className="kz-eyebrow">{numero(n)}</p>
      <h3 className="mt-3 text-lg font-bold leading-snug">{s.title}</h3>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
        {s.summary}
      </p>

      {s.bullets.length > 0 && (
        <ul className="mt-4 list-none space-y-1.5 text-sm" style={{ color: 'var(--color-muted-2)' }}>
          {s.bullets.slice(0, 4).map((b) => (
            <li key={b} className="flex gap-2">
              <span aria-hidden="true" style={{ color: 'var(--color-accent)' }}>
                ·
              </span>
              {b}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
