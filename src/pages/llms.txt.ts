import type { APIRoute } from 'astro';
import { servicios } from '@/lib/servicios';
import { productos } from '@/lib/productos';
import { industrias } from '@/lib/industrias';
import { guiasOrdenadas } from '@/lib/guias';

/**
 * /llms.txt — el resumen del sitio para ChatGPT, Claude, Perplexity y compañía
 * (formato de llmstxt.org). Sale de los mismos datos que las páginas, así que
 * un precio que cambia en servicios.ts cambia acá solo.
 */
const SITIO = 'https://www.kizercode.com';

export const GET: APIRoute = async () => {
  const guias = await guiasOrdenadas();
  const lineas = [
    '# Kizercode',
    '',
    '> Agencia de software y taller de tecnología en Plaza Bendeck, El Progreso, Yoro, Honduras. Páginas web, tiendas en línea, sistemas a la medida, apps, automatización con IA, marketing digital, instalación de cámaras de seguridad y reparación de computadoras y celulares. Precio fijo por escrito antes de empezar y 30 días de garantía en el software.',
    '',
    '- Dirección: Plaza Bendeck, El Progreso, Yoro, Honduras',
    '- Horario: lunes a sábado, 7:00 a.m. a 6:00 p.m.',
    '- WhatsApp y teléfono: +504 8809-1744',
    '- Correo: hello@kizercode.com',
    '- Software y marketing: para todo Honduras y el extranjero, de forma remota. Cámaras: El Progreso y el valle de Sula. Reparaciones: en el local.',
    '- Precios en lempiras (L) y dólares (USD); los indicados son precios "desde", pago único.',
    '',
    '## Servicios',
    '',
    ...servicios.map(
      (s) =>
        `- [${s.nombre}](${SITIO}/servicios/${s.slug}/): ${s.descEs}${s.lps ? ` Desde ${s.lps} (${s.usd}).` : ''}`,
    ),
    '',
    '## Productos propios',
    '',
    ...productos.map(
      (p) =>
        `- [${p.nombre}](${SITIO}/productos/${p.slug}/)${p.estrella ? ' (producto estrella)' : ''}: ${p.descEs} ${p.casoEs ? 'Caso en producción' : 'App'}: ${p.url}`,
    ),
    '',
    '## Industrias',
    '',
    ...industrias.map((i) => `- [Software para ${i.nombre.toLowerCase()}](${SITIO}/industrias/${i.slug}/)`),
    '',
    '## Guías',
    '',
    ...guias.map((g) => `- [${g.data.title}](${SITIO}/guias/${g.id}/): ${g.data.description}`),
    '',
    '## Más',
    '',
    `- [Precios](${SITIO}/precios/): todos los precios en una página`,
    `- [Proyectos](${SITIO}/proyectos/): casos reales`,
    `- [Nosotros](${SITIO}/nosotros/): historia y equipo`,
    `- [Guías](${SITIO}/guias/): artículos para decidir antes de contratar (solo en español)`,
    `- [Contacto](${SITIO}/contacto/): cotización gratis en menos de 24 horas`,
    `- [English version](${SITIO}/en/services/)`,
    '',
  ];
  return new Response(lineas.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
