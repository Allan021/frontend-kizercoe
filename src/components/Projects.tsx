'use client';
import { useEffect, useState } from 'react';
import { fetchProjects } from '@/lib/api';
import type { Project } from '@/types';

/**
 * Los proyectos, leÃ­dos de la API en el navegador.
 *
 * Se piden en el cliente y no al compilar a propÃ³sito: asÃ­ publicar uno desde
 * el panel se ve en el sitio al instante, sin volver a desplegar. El precio es
 * que estas tarjetas no las indexa el buscador â€” cuando el portafolio importe
 * para SEO, esto se pasa a build-time con un redeploy por publicaciÃ³n.
 */
export default function Projects() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    fetchProjects().then(setProjects).catch(() => setFallo(true));
  }, []);

  // Si la API no responde, la secciÃ³n desaparece en vez de mostrar un error:
  // es un portafolio, no una funciÃ³n crÃ­tica del sitio.
  if (fallo || (projects && projects.length === 0)) return null;

  if (!projects) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-72 animate-pulse rounded-2xl border"
            style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => (
        <article
          key={p.slug}
          className="group flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1"
          style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          {p.imageUrl && (
            <div className="aspect-[16/10] overflow-hidden" style={{ background: 'var(--color-bg-2)' }}>
              <img
                src={p.imageUrl}
                alt={p.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          )}

          <div className="flex flex-1 flex-col p-6">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                {p.title}
              </h3>
              {p.period && (
                <span className="font-mono text-xs shrink-0" style={{ color: 'var(--color-muted-2)' }}>
                  {p.period}
                </span>
              )}
            </div>

            {p.client && (
              <p className="mt-1 text-xs" style={{ color: 'var(--color-muted-2)' }}>
                {p.client}
              </p>
            )}

            <p className="mt-3 flex-1 text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              {p.summary}
            </p>

            {p.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded px-2 py-0.5 font-mono text-[11px]"
                    style={{ background: 'rgba(91,140,255,0.1)', color: 'var(--color-accent)' }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-5 flex items-center gap-3">
              {/* El slug viaja al formulario: el correo que llega dice de cuÃ¡l vino. */}
              <a
                href={`/#contact?proyecto=${encodeURIComponent(p.slug)}`}
                className="rounded-lg px-4 py-2 text-sm font-bold transition-opacity hover:opacity-90"
                style={{ background: 'var(--color-accent-strong)', color: '#fff' }}
              >
                Quiero algo asÃ­
              </a>
              {p.liveUrl && (
                <a
                  href={p.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm transition-colors hover:opacity-80"
                  style={{ color: 'var(--color-muted)' }}
                >
                  Ver en vivo â†—
                </a>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
