import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const localSiteMetadata = {
  name: 'jamia-site-metadata-dev-origin',
  transformIndexHtml(html, context) {
    // In Vite dev mode only, avoid leaving metadata placeholders visible in the
    // local source preview. Production Express replaces the placeholder with
    // the configured/request origin after the frontend bundle is built.
    if (!context.server) return html;
    const origin = (process.env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/$/, '');
    return html.replaceAll('__SITE_URL__', origin);
  }
};

export default defineConfig({ plugins: [react(), localSiteMetadata] });
