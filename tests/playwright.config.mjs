import { defineConfig } from '@playwright/test';

export default defineConfig({
  testMatch: 'site.spec.mjs',
  use: { baseURL: 'http://127.0.0.1:8080' },
  webServer: { command: 'node serve.mjs', url: 'http://127.0.0.1:8080/', reuseExistingServer: true },
  reporter: [['list']],
});
