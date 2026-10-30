import { fileURLToPath } from 'node:url';
export default {
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: '/wesoflow/',
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || 'https://oiwpeowxfulthjomxlke.supabase.co'),
    'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_VPGqZoXzTAvq6Oh0cDyGIA_zXgCpPmF'),
  },
  build: {
    outDir: fileURLToPath(new URL('../../public/wesoflow', import.meta.url)),
    emptyOutDir: true,
  },
};
