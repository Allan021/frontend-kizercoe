import { getCollection, type CollectionEntry } from 'astro:content';

export type Guia = CollectionEntry<'guias'>;

/** Todas las guías, la más reciente primero. */
export async function guiasOrdenadas(): Promise<Guia[]> {
  const todas = await getCollection('guias');
  return todas.sort((a, b) => fechaMod(b).getTime() - fechaMod(a).getTime());
}

export const fechaMod = (g: Guia) => g.data.updated ?? g.data.date;

/** Minutos de lectura a ~200 palabras por minuto, contando también el FAQ. */
export function minutosLectura(g: Guia): number {
  const texto = [g.body ?? '', ...g.data.faq.flatMap((f) => [f.q, f.a])].join(' ');
  const palabras = texto.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palabras / 200));
}

const formato = new Intl.DateTimeFormat('es-HN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
export const fechaLarga = (d: Date) => formato.format(d);
/** AAAA-MM-DD, para <time datetime> y el JSON-LD. */
export const fechaIso = (d: Date) => d.toISOString().slice(0, 10);
