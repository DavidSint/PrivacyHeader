import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    permissions: [
      "storage",
      "declarativeNetRequest",
      "declarativeNetRequestWithHostAccess"
    ],
    host_permissions: ["<all_urls>"]
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
