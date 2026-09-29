// @ts-check
import { defineConfig } from 'astro/config';

// Cambia `site` por tu dominio real cuando lo publiques.
// Se usa para el sitemap, el canonical y las etiquetas Open Graph.
export default defineConfig({
  site: 'https://preciodelanuez.com',
  build: { inlineStylesheets: 'auto' },
});
