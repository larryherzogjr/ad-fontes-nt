import { sites } from '@openai/sites-vite-plugin';
import tailwindcss from '@tailwindcss/postcss';
import vinext from 'vinext';
import { defineConfig } from 'vite';

// Public Scripture corpora are reproduced offline before builds.
export default defineConfig({
  css: { postcss: { plugins: [tailwindcss()] } },
  // Reproducing immutable assets must not trigger thousands of RSC reloads.
  server: { watch: {
    ignored: ['**/public/analysis/**', '**/public/corpus/**', '**/public/om/**', '**/public/lexical/**', '**/public/library/**', '**/public/visuals/**', '**/public/connections/**', '**/desktop/dist/**', '**/desktop/public/**', '**/app/dist/**'],
    ...(process.env.CODEX_SANDBOX === 'seatbelt' ? { useFsEvents: false, usePolling: true } : {}),
  } },
  plugins: [vinext(), sites()],
});
