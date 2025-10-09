import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// CKEditor doit être transpilé
const ckeditorRegex = /ckeditor5-[^/\\]+[/\\]src[/\\].+\.js$/;

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  optimizeDeps: {
    include: [
      "@ckeditor/ckeditor5-react",
      "@ckeditor/ckeditor5-editor-classic/src/classiceditor",
      "@ckeditor/ckeditor5-essentials/src/essentials",
      "@ckeditor/ckeditor5-paragraph/src/paragraph",
      "@ckeditor/ckeditor5-basic-styles/src/bold",
      "@ckeditor/ckeditor5-basic-styles/src/italic",
      // ajoute tous tes plugins CKEditor ici
    ],
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          ckeditor: ["@ckeditor/ckeditor5-react"],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
