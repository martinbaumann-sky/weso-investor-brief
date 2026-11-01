import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', testMatch: '*.spec.mjs', workers: 1, timeout: 45000,
  use: { baseURL: 'http://127.0.0.1:4400/wesoflow/', headless: true, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  webServer: [
    { command: 'node tests/server.mjs', url: 'http://127.0.0.1:4399/health', reuseExistingServer: false },
    { command: 'npm run dev -- --host 127.0.0.1 --port 4400 --strictPort --base=/wesoflow/', url: 'http://127.0.0.1:4400/wesoflow/', env: { VITE_SUPABASE_URL: 'http://127.0.0.1:4399', VITE_SUPABASE_PUBLISHABLE_KEY: 'test-public-key' }, reuseExistingServer: false },
  ],
});
