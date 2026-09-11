'use client';
import { useEffect, useState } from 'react';
import {
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  MessageCircle,
  Music2,
  Twitter,
  Youtube,
  type LucideIcon,
} from 'lucide-react';
import { fetchProjects } from '@/lib/api';
import { T } from '@/lib/lang';
import type { Project } from '@/types';

/** Qué icono le toca a cada red, mirando el dominio. Lo raro cae en el globo. */
function iconoDeRed(url: string): { Icono: LucideIcon; nombre: string } {
  let host = '';
  try {
    host = new URL(url).hostname.replace(/^www\./, '');
  } catch {
    /* URL rara: globo */
  }
  if (host.includes('instagram')) return { Icono: Instagram, nombre: 'Instagram' };
  if (host.includes('facebook') || host === 'fb.com') return { Icono: Facebook, nombre: 'Facebook' };
  if (host.includes('linkedin')) return { Icono: Linkedin, nombre: 'LinkedIn' };
  if (host.includes('youtube') || host === 'youtu.be') return { Icono: Youtube, nombre: 'YouTube' };
  if (host === 'x.com' || host.includes('twitter')) return { Icono: Twitter, nombre: 'X' };
  if (host === 'wa.me' || host.includes('whatsapp')) return { Icono: MessageCircle, nombre: 'WhatsApp' };
  if (host.includes('tiktok')) return { Icono: Music2, nombre: 'TikTok' };
  return { Icono: Globe, nombre: host || 'sitio' };
}

/**
 * Los proyectos, leídos de la API en el navegador.
 *
 * Se piden en el cliente y no al compilar a propósito: así publicar uno desde
 * el panel se ve en el sitio al instante, sin volver a desplegar. El precio es
 * que estas tarjetas no las indexa el buscador — cuando el portafolio importe
 * para SEO, esto se pasa a build-time con un redeploy por publicación.
 */
/** Cuántos proyectos se vieron la última vez: para pintar esa misma cantidad
 *  de skeletons y que la sección no brinque cuando conteste la API. */
const N_KEY = 'kz_proyectos_n';

/** Con 1 o 2 proyectos la grilla se centra: sin columna fantasma a la derecha. */
function clasesDeGrilla(n: number): string {
  if (n <= 1) return 'mx-auto grid max-w-sm gap-6';
  if (n === 2) return 'mx-auto grid max-w-4xl gap-6 sm:grid-cols-2';
  return 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3';
}

/** Mismo esqueleto que la tarjeta real: misma imagen 16/10, mismo padding.
 *  Si mide igual, no hay layout shift cuando llega el contenido. */
function TarjetaFantasma() {
  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
    >
      <div className="aspect-[16/10] animate-pulse" style={{ background: 'var(--color-card-2)' }} />
      <div className="animate-pulse space-y-3 p-6">
        <div className="h-5 w-2/3 rounded" style={{ background: 'var(--color-card-2)' }} />
        <div className="h-3 w-1/3 rounded" style={{ background: 'var(--color-card-2)' }} />
        <div className="h-3 w-full rounded" style={{ background: 'var(--color-card-2)' }} />
        <div className="h-3 w-5/6 rounded" style={{ background: 'var(--color-card-2)' }} />
        <div className="h-10 w-44 rounded-lg" style={{ background: 'var(--color-card-2)' }} />
      </div>
    </div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [fallo, setFallo] = useState(false);
  // 3 por defecto; si ya se visitó, la cantidad real de la última vez.
  const [esperadas, setEsperadas] = useState(3);

  useEffect(() => {
    try {
      const n = Number(localStorage.getItem(N_KEY));
      if (Number.isFinite(n) && n > 0) setEsperadas(Math.min(n, 6));
    } catch {
      /* modo incógnito o similar: quedan las 3 por defecto */
    }
    fetchProjects()
      .then((p) => {
        setProjects(p);
        try {
          localStorage.setItem(N_KEY, String(p.length));
        } catch {
          /* sin storage no pasa nada */
        }
      })
      .catch(() => setFallo(true));
  }, []);

  // Si la API no responde o no hay nada, se esconde la sección entera —
  // encabezado incluido, que vive en el .astro de afuera.
  const vacio = fallo || (projects !== null && projects.length === 0);
  useEffect(() => {
    const seccion = document.getElementById('proyectos');
    if (seccion) seccion.hidden = vacio;
  }, [vacio]);
  if (vacio) return null;

  if (!projects) {
    return (
      <div className={clasesDeGrilla(esperadas)}>
        {Array.from({ length: esperadas }, (_, i) => (
          <TarjetaFantasma key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={clasesDeGrilla(projects.length)}>
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

            {(p.client || (p.socials ?? []).length > 0) && (
              <div className="mt-1 flex items-center gap-2">
                {p.client && (
                  <p className="text-xs" style={{ color: 'var(--color-muted-2)' }}>
                    {p.client}
                  </p>
                )}
                {/* Las redes del cliente: la referencia de que es gente real. */}
                {(p.socials ?? []).map((s) => {
                  const { Icono, nombre } = iconoDeRed(s);
                  return (
                    <a
                      key={s}
                      href={s}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${nombre} — ${p.client ?? p.title}`}
                      className="transition-colors hover:text-[var(--color-accent)]"
                      style={{ color: 'var(--color-muted-2)' }}
                    >
                      <Icono size={14} strokeWidth={1.75} />
                    </a>
                  );
                })}
              </div>
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
                    style={{ background: 'var(--green-soft)', color: 'var(--green2)' }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-5 flex items-center gap-3">
              {/* El slug viaja al formulario: el correo que llega dice de cuál vino. */}
              <a
                href={`/#contacto?proyecto=${encodeURIComponent(p.slug)}`}
                className="rounded-lg px-4 py-2 text-sm font-bold transition-opacity hover:opacity-90"
                style={{ background: 'var(--color-accent-strong)', color: '#fff' }}
              >
                <T en="I want something like this" es="Quiero algo así" />
              </a>
              {p.liveUrl && (
                <a
                  href={p.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm transition-colors hover:opacity-80"
                  style={{ color: 'var(--color-muted)' }}
                >
                  <T en="View live" es="Ver en vivo" /> ↗
                </a>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
