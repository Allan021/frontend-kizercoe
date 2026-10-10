import type { AstroIntegration } from 'astro';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, type DefaultTreeAdapterMap } from 'parse5';

type Nodo = DefaultTreeAdapterMap['node'];
type Elemento = DefaultTreeAdapterMap['element'];

/**
 * El sitio pinta los dos idiomas (`.es` / `.en`) y el CSS esconde el que
 * sobra según `<html lang>`. En las páginas con URL por idioma (/nosotros ↔
 * /en/about) el idioma es fijo y el toggle navega a la contraparte, así que el
 * otro idioma es peso muerto que Google igual lee como contenido mezclado.
 *
 * Después del build se borra del HTML. Solo se toca una página si:
 *  - `<html lang>` es es o en,
 *  - sus hreflang es/en apuntan a URLs distintas (tiene contraparte real), y
 *  - el script de arranque trae `forzarLang = "<lang>"` (el idioma no se
 *    puede cambiar en el cliente sin navegar).
 * Lo que vive dentro de `<astro-island>` no se toca: la isla hidrata con su
 * propio render (<T> pinta las dos versiones) y borrar ahí desajusta React.
 *
 * Se parsea con parse5 solo para ubicar cada elemento; el borrado se hace por
 * offsets sobre el texto original, así el resto queda byte por byte igual.
 */

const VACIOS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta',
  'source', 'track', 'wbr',
]);

function attr(el: Elemento, nombre: string): string | undefined {
  return el.attrs.find((a) => a.name === nombre)?.value;
}

function esElemento(n: Nodo): n is Elemento {
  return 'tagName' in n;
}

function* recorrer(n: Nodo): Generator<Elemento> {
  const hijos = 'childNodes' in n ? n.childNodes : [];
  for (const h of hijos) {
    if (!esElemento(h)) continue;
    yield h;
  }
}

async function* indices(dir: string): AsyncGenerator<string> {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* indices(p);
    else if (e.name === 'index.html') yield p;
  }
}

interface Resultado {
  html: string;
  quitados: number;
  saltados: number;
}

/** Devuelve null si la página no califica. */
export function dejarUnIdioma(html: string): Resultado | null {
  const doc = parse(html, { sourceCodeLocationInfo: true });
  const raiz = doc.childNodes.find((n): n is Elemento => esElemento(n) && n.tagName === 'html');
  if (!raiz) return null;
  const lang = attr(raiz, 'lang');
  if (lang !== 'es' && lang !== 'en') return null;

  const fijo = /\bforzarLang\s*=\s*"(es|en)"/.exec(html)?.[1];
  if (fijo !== lang) return null;

  const head = [...recorrer(raiz)].find((e) => e.tagName === 'head');
  const alternos = new Map<string, string>();
  if (head) {
    for (const e of recorrer(head)) {
      const hl = attr(e, 'hreflang');
      if (e.tagName === 'link' && attr(e, 'rel') === 'alternate' && hl) {
        alternos.set(hl, attr(e, 'href') ?? '');
      }
    }
  }
  const es = alternos.get('es');
  const en = alternos.get('en');
  // Contraparte real (es ≠ en), o página de un solo idioma (soloEs: no declara
  // en). Lo que se salta es la página que dice tener inglés en su misma URL.
  const unSoloIdioma = lang === 'es' && es && !en;
  if (!unSoloIdioma && (!es || !en || es === en)) return null;

  const otro = lang === 'es' ? 'en' : 'es';
  const rangos: [number, number][] = [];
  let saltados = 0;

  const visitar = (n: Nodo) => {
    for (const el of recorrer(n)) {
      if (el.tagName === 'astro-island') continue;
      const clases = (attr(el, 'class') ?? '').split(/\s+/);
      if (clases.includes(otro)) {
        const loc = el.sourceCodeLocation;
        // Sin etiqueta de cierre explícita no se sabe con certeza dónde
        // termina en el texto original: mejor dejarlo que romper el HTML.
        if (!loc || (!loc.endTag && !VACIOS.has(el.tagName))) {
          saltados++;
          continue;
        }
        rangos.push([loc.startOffset, loc.endOffset]);
        continue;
      }
      visitar(el);
      if (el.tagName === 'template') visitar((el as DefaultTreeAdapterMap['template']).content);
    }
  };
  visitar(raiz);

  if (rangos.length === 0) return { html, quitados: 0, saltados };
  rangos.sort((a, b) => a[0] - b[0]);
  let salida = '';
  let desde = 0;
  for (const [ini, fin] of rangos) {
    salida += html.slice(desde, ini);
    desde = fin;
  }
  salida += html.slice(desde);
  return { html: salida, quitados: rangos.length, saltados };
}

export default function unIdioma(): AstroIntegration {
  return {
    name: 'kizer:un-idioma',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const raiz = fileURLToPath(dir);
        let paginas = 0;
        let elementos = 0;
        let saltados = 0;
        let ahorro = 0;
        for await (const archivo of indices(raiz)) {
          const html = await readFile(archivo, 'utf8');
          const r = dejarUnIdioma(html);
          if (!r) continue;
          paginas++;
          elementos += r.quitados;
          saltados += r.saltados;
          if (r.quitados === 0) continue;
          ahorro += Buffer.byteLength(html) - Buffer.byteLength(r.html);
          await writeFile(archivo, r.html);
        }
        logger.info(
          `${paginas} páginas con un solo idioma, ${elementos} elementos del otro idioma quitados, ` +
            `${(ahorro / 1024).toFixed(1)} KB menos` +
            (saltados ? ` (${saltados} sin cierre explícito, dejados)` : ''),
        );
      },
    },
  };
}
