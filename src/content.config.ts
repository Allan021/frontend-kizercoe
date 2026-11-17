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
    /** Título corto para Google (<title>) cuando el H1 pasa de ~50 caracteres. */
    metaTitle: z.string().max(50).optional(),
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

/**
 * Casos de éxito: reto → solución → resultado, con números. Solo datos que el
 * cliente confirmó; un caso sin número no va. La versión en inglés vive en
 * casos/en/<mismo-nombre>.md y sale en /en/case-studies/.
 */
const casos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/casos' }),
  schema: z.object({
    title: z.string(),
    metaTitle: z.string().max(50).optional(),
    description: z.string().max(155),
    cliente: z.string(),
    /** Lugar del cliente, ej. "Bogotá, Colombia". */
    lugar: z.string(),
    industria: z.string(),
    servicio: z.enum(slugs),
    /** Si el caso es de un producto propio (slug de productos.ts): la ficha y el CTA llevan al producto. */
    producto: z.string().optional(),
    periodo: z.string(),
    date: z.coerce.date(),
    /** 2–4 cifras grandes del encabezado. La primera es la principal. */
    metricas: z.array(z.object({ valor: z.string(), etiqueta: z.string() })).min(1).max(4),
    stack: z.array(z.string()).default([]),
    imagen: z.string().url().optional(),
    enlace: z.string().url().optional(),
    testimonio: z.object({ texto: z.string(), autor: z.string(), cargo: z.string() }).optional(),
  }),
});

export const collections = { guias, casos };
