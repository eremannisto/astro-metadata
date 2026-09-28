import { defineConfig } from "@playwright/test"

// The fixture runs twice: with the dev server and with a production build.
// `pnpm test:fixtures` builds the fixture before the tests start.
const servers = [
  { name: "dev", port: 4321, command: "pnpm astro dev --port 4321" },
  { name: "build", port: 4322, command: "pnpm astro preview --port 4322" },
]

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./tests/e2e/results",
  projects: servers.map((server) => {
    return {
      name: server.name,
      use: { baseURL: `http://localhost:${server.port}` },
    }
  }),
  webServer: servers.map((server) => {
    return {
      command: server.command,
      cwd: "./tests/e2e/fixtures/basic",
      port: server.port,
      reuseExistingServer: !process.env.CI,
    }
  }),
})
