import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: "Privacy Header",
    permissions: [
      "storage",
      "declarativeNetRequest",
      "declarativeNetRequestWithHostAccess"
    ],
    host_permissions: ["<all_urls>"],
    icons: {
      "16": "icon/16.png",
      "32": "icon/32.png",
      "48": "icon/48.png",
      "96": "icon/96.png",
      "128": "icon/128.png"
    },
    browser_specific_settings: {
      gecko: {
        id: "privacy-header@davidsint.com",
        // @ts-expect-error: data_collection_permissions is a new requirement not yet in WXT types
        data_collection_permissions: {
          required: ["none"]
        }
      }
    }
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
