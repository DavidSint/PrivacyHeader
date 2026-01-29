import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"

import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    exclude: ["**/node_modules/**", "**/dist/**", "**/e2e/**"],
    alias: {
      "#imports": path.resolve(__dirname, "./__mocks__/wxt.ts"),
      "@": path.resolve(__dirname, "./"),
    },
    setupFiles: ["./vitest.setup.ts"],
  },
})
