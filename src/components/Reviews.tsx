'use client';
import { useEffect, useState } from 'react';
import { fetchTestimonials } from '@/lib/api';
import type { Testimonial } from '@/types';

/**
 * Testimonios reales, traídos de la API.
 *
 * Si no hay ninguno publicado, la sección entera desaparece. Antes había cinco
 * inventados y una barra con "50+ clientes felices" y "100% nos recomienda":
 * números que nadie podía sostener si se los preguntaban.
 */

const COLORES = ['var(--color-accent)', 'var(--color-accent-strong)', '#ff6b35', '#c8a0ff'];

export default function Reviews() {
  const [lista, setLista] = useState<Testimonial[] | null>(null);

  useEffect(() => {
    fetchTestimonials()
      .then(setLista)
      .catch(() => setLista([]));
  }, []);

  if (!lista) {
    return (
      <div className="mx-auto grid max-w-5xl gap-6 px-6 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-2xl border"
            style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          />
        ))}
      </div>
    );
  }
  if (lista.length === 0) return null;

  const destacado = lista.find((t) => t.featured) ?? null;
  const resto = lista.filter((t) => t !== destacado);

  return (
    <div className="mx-auto max-w-6xl px-6">
      {destacado && <Destacado t={destacado} />}

      {resto.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {resto.map((t, i) => (
            <Tarjeta key={t.id ?? i} t={t} color={COLORES[i % COLORES.length]} />
          ))}
        </div>
      )}
    </div>
  );
}

function Estrellas({ n, size = 16 }: { n: number; size?: number }) {
  return (
    <div className="flex gap-1" aria-label={`${n} de 5`}>
      {Array.from({ length: n }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 16 16" fill="#ffbd2e" aria-hidden="true">
          <path d="M8 1.5l1.9 3.8 4.2.6-3 3 .7 4.2L8 11l-3.8 2.1.7-4.2-3-3 4.2-.6z" />
        </svg>
      ))}
    </div>
  );
}

function Firma({ t, color, size = 40 }: { t: Testimonial; color: string; size?: number }) {
  const detalle = [t.role, t.company].filter(Boolean).join(' · ');
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex shrink-0 items-center justify-center rounded-full font-bold"
        style={{
          width: size,
          height: size,
          // color-mix y no `${color}18`: ahora los colores llegan como
          // var(--…) y pegarles la opacidad al final da CSS inválido.
          background: `color-mix(in srgb, ${color} 14%, transparent)`,
          border: `1px solid color-mix(in srgb, ${color} 32%, transparent)`,
          color,
          fontSize: size / 2.6,
        }}
      >
        {t.author.trim().charAt(0).toUpperCase()}
      </div>
      <div>
        <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
          {t.author}
        </p>
        {/* Solo se muestra lo que el testimonio realmente trae. */}
        {detalle && (
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            {detalle}
          </p>
        )}
      </div>
    </div>
  );
}

function Destacado({ t }: { t: Testimonial }) {
  return (
    <figure
      className="mb-10 rounded-2xl border p-8 sm:p-12"
      style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
    >
      <Estrellas n={t.rating} size={18} />
      <blockquote
        className="mt-6 text-xl leading-relaxed sm:text-2xl"
        style={{ color: 'var(--color-text)' }}
      >
        {t.text}
      </blockquote>
      <figcaption className="mt-8">
        <Firma t={t} color="var(--color-accent)" size={48} />
      </figcaption>
    </figure>
  );
}

function Tarjeta({ t, color }: { t: Testimonial; color: string }) {
  return (
    <figure
      className="flex flex-col rounded-2xl border p-7"
      style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
    >
      <Estrellas n={t.rating} />
      <blockquote
        className="mt-5 flex-1 text-sm leading-relaxed opacity-90"
        style={{ color: 'var(--color-text)' }}
      >
        {t.text}
      </blockquote>
      <figcaption className="mt-6">
        <Firma t={t} color={color} />
      </figcaption>
    </figure>
  );
}
