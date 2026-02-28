import { defineConfig } from "@playwright/test"

const ports = {
  basic: 4321,
}

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./tests/e2e/results",
  webServer: {
    command: "pnpm astro dev",
    cwd: "./tests/e2e/fixtures/basic",
    port: ports.basic,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: `http://localhost:${ports.basic}`,
  },
})
