import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { servicios } from '@/lib/servicios';

/**
 * Guías (el blog): artículos en Markdown que contestan lo que la gente le
 * pregunta a Google y a ChatGPT antes de contratar. Solo en español.
 *
 * `servicio` tiene que ser un slug real de servicios.ts: de ahí sale el botón
 * del final y las migas. Un slug mal escrito rompe el build, no la página.
 */
const slugs = servicios.map((s) => s.slug) as [string, ...string[]];

const guias = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guias' }),
  schema: z.object({
    title: z.string(),
    // Lo que Google muestra bajo el título: más largo se corta.
    description: z.string().max(155),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    servicio: z.enum(slugs),
    tags: z.array(z.string()).default([]),
    /** Preguntas del final: se pintan bajo el artículo y salen como FAQPage. */
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    /** 2–3 enlaces del bloque "Seguí leyendo". */
    relacionados: z.array(z.object({ titulo: z.string(), href: z.string() })).default([]),
  }),
});

export const collections = { guias };
