import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The app talks to Supabase directly from the browser — no local backend,
// no `/api` proxy needed.
export default defineConfig({
  plugins: [react()],
});
