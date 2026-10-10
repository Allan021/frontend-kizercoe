// Genera .avif y .webp junto a cada .jpg de las carpetas de fotos (no el -og:
// las redes sociales leen JPEG). Idempotente: salta lo que ya existe y está
// más nuevo que su .jpg. Correr al agregar fotos: `node scripts/optimizar-fotos.mjs`.
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
// sharp viene con Astro: se resuelve desde ahí en vez de sumar otra dependencia.
const require = createRequire(import.meta.url);
const sharp = require(require.resolve('sharp', { paths: [require.resolve('astro')] }));

const CARPETAS = ['servicios', 'productos', 'industrias', 'bienes', 'web', 'ia', 'camaras'];
let hechas = 0;
for (const c of CARPETAS) {
  const dir = join(raiz, 'public', c);
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.jpg') || f.endsWith('-og.jpg')) continue;
    const jpg = join(dir, f);
    const t = statSync(jpg).mtimeMs;
    for (const [ext, opts] of [['avif', { quality: 50, effort: 4 }], ['webp', { quality: 74 }]]) {
      const out = jpg.replace(/\.jpg$/, `.${ext}`);
      if (existsSync(out) && statSync(out).mtimeMs >= t) continue;
      await sharp(jpg)[ext](opts).toFile(out);
      hechas++;
    }
  }
}
console.log(`fotos optimizadas: ${hechas}`);
