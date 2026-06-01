import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  assetsInclude: ["**/*.glb", "**/*.gltf"],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-swiper': ['swiper'],
          'vendor-gsap': ['gsap', '@gsap/react'],
          'vendor-icons': ['lucide-react', 'react-icons', '@heroicons/react'],
          'vendor-swr': ['swr', 'axios'],
        },
      },
    },
  },
  plugins: [
    {
      name: "async-css",
      transformIndexHtml(html, ctx) {
        if (ctx?.server) return html;

        const cssLinkRegex = /<link\s+rel="stylesheet"\s+([^>]*href="[^"]+\.css"[^>]*)>/g;

        return html.replace(cssLinkRegex, (match, attrs) => {
          const hrefMatch = attrs.match(/href="([^"]+)"/);
          if (!hrefMatch) return match;

          // Excluir archivos de Swiper del preload agresivo
          const href = hrefMatch[1];
          if (href.includes('effect-coverflow') || href.includes('swiper')) {
            return match; // Dejar como stylesheet normal
          }

          const safeAttrs = attrs.replace(/\s+rel="stylesheet"/g, "");
          const preloadTag = `<link rel="preload" as="style" ${safeAttrs} onload="this.onload=null;this.rel='stylesheet'">`;
          const noscriptTag = `<noscript><link rel="stylesheet" ${safeAttrs}></noscript>`;
          return `${preloadTag}${noscriptTag}`;
        });
      },
    },
    react(),
    tailwindcss(),

  ],
});
