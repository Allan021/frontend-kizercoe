import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  site: 'https://kizercode.com',
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
    sitemap(),
    // Iconos como SVG en línea, solo los que se usan: cero JavaScript y cero
    // petición extra. Se escriben <Icon name="lucide:arrow-right" />.
    icon({ include: { lucide: ['*'] } }),
  ],
  output: 'static',
  compressHTML: true,
  vite: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      // Split GSAP into its own chunk to reduce main bundle (~21 KiB savings)
      rollupOptions: {
        output: {
          manualChunks: {
            gsap: ['gsap', 'gsap/ScrollTrigger', 'gsap/SplitText'],
          },
        },
      },
      // Better minification
      cssMinify: true,
    },
  },
});
