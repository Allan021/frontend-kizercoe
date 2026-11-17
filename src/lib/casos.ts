import { getCollection, type CollectionEntry } from 'astro:content';

export type Caso = CollectionEntry<'casos'>;

/** Los casos de un idioma, más recientes primero. Los de inglés viven en casos/en/. */
export async function casosDe(en: boolean): Promise<Caso[]> {
  const todos = await getCollection('casos', (c) => c.id.startsWith('en/') === en);
  return todos.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** Slug público: sin el prefijo en/. */
export const slugCaso = (c: Caso) => c.id.replace(/^en\//, '');

export const urlCaso = (slug: string, en: boolean) => (en ? `/en/case-studies/${slug}/` : `/casos/${slug}/`);
