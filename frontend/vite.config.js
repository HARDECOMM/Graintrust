import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),      // ✅ React plugin, no custom babel plugins needed
    tailwindcss() // ✅ Tailwind Vite plugin
  ],
});