import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import unIdioma from './src/integrations/un-idioma';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // Con www: el apex redirige (308) a www, y el canonical debe apuntar a la
  // URL final, no a la que redirige.
  site: 'https://www.kizercode.com',
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
    // El panel lleva noindex: en el sitemap solo confunde a Google.
    sitemap({ filter: (page) => !page.includes('/panel') }),
    // Iconos como SVG en línea, solo los que se usan: cero JavaScript y cero
    // petición extra. Se escriben <Icon name="lucide:arrow-right" />.
    icon({ include: { lucide: ['*'] } }),
    // En páginas con URL por idioma, borra del HTML final el texto del otro
    // idioma (los <span class="en">/"es"> que el CSS escondía).
    unIdioma(),
  ],
  output: 'static',
  compressHTML: true,
  // El CSS va dentro del HTML: era la única petición que bloqueaba el primer
  // pintado. Son ~8 KB comprimidos; en un sitio de visitas de una página
  // pesa más el viaje extra que la caché.
  build: { inlineStylesheets: 'always' },
  vite: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      cssMinify: true,
    },
  },
});
