import { servicios, type Servicio } from './servicios';
import { industrias, type Industria } from './industrias';

/**
 * Qué servicios le sirven a cada industria. Una sola tabla alimenta los dos
 * sentidos del enlace interno: la industria lista sus servicios y cada
 * servicio lista "para qué negocios". Google entiende el sitio por cómo se
 * enlaza; páginas sueltas que nadie enlaza pesan poco.
 */
const mapa: Record<string, string[]> = {
  farmacias: ['sistemas-a-la-medida', 'tiendas-en-linea', 'automatizacion-ia', 'instalacion-camaras'],
  ferreterias: ['sistemas-a-la-medida', 'tiendas-en-linea', 'paginas-web', 'instalacion-camaras'],
  boutiques: ['tiendas-en-linea', 'redes-sociales', 'anuncios', 'paginas-web'],
  restaurantes: ['automatizacion-ia', 'redes-sociales', 'paginas-web', 'instalacion-camaras'],
  prestamistas: ['sistemas-a-la-medida', 'automatizacion-ia', 'crm-a-la-medida', 'apps-moviles'],
  clinicas: ['paginas-web', 'automatizacion-ia', 'seo', 'sistemas-a-la-medida'],
  'bienes-raices': ['paginas-web', 'crm-a-la-medida', 'anuncios', 'automatizacion-ia'],
  abogados: ['paginas-web', 'crm-a-la-medida', 'sistemas-a-la-medida', 'seo'],
  distribuidoras: ['sistemas-a-la-medida', 'apps-moviles', 'crm-a-la-medida', 'instalacion-camaras'],
  talleres: ['sistemas-a-la-medida', 'seo', 'paginas-web', 'instalacion-camaras'],
};

export const serviciosDe = (industria: string): Servicio[] =>
  (mapa[industria] ?? []).map((s) => servicios.find((x) => x.slug === s)).filter((s): s is Servicio => !!s);

export const industriasDe = (servicio: string): Industria[] =>
  industrias.filter((i) => mapa[i.slug]?.includes(servicio));
