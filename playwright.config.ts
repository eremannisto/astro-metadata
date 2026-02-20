import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./tests/e2e/results",
  webServer: {
    command: "pnpm astro dev",
    cwd: "./tests/e2e/fixtures",
    port: 4321,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: "http://localhost:4321",
  },
})
