import { defineConfig } from "@playwright/test"

// Each fixture and the tests that use it
const fixtures = [
  { name: "basic", testMatch: ["components/**/*.test.ts", "integration.test.ts"] },
  { name: "config", testMatch: ["config/**/*.test.ts"] },
]

// Each fixture runs twice: with the dev server and with a production build.
// `pnpm test:fixtures` builds the fixtures before the tests start.
const servers = fixtures.flatMap((fixture, index) => {
  return [
    {
      ...fixture,
      name: `${fixture.name} (dev)`,
      cwd: `./tests/e2e/fixtures/${fixture.name}`,
      port: 4321 + index,
      command: `pnpm astro dev --port ${4321 + index}`,
    },
    {
      ...fixture,
      name: `${fixture.name} (build)`,
      cwd: `./tests/e2e/fixtures/${fixture.name}`,
      port: 4421 + index,
      command: `pnpm astro preview --port ${4421 + index}`,
    },
  ]
})

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./tests/e2e/results",
  projects: servers.map((server) => {
    return {
      name: server.name,
      testMatch: server.testMatch,
      use: { baseURL: `http://localhost:${server.port}` },
    }
  }),
  webServer: servers.map((server) => {
    return {
      command: server.command,
      cwd: server.cwd,
      port: server.port,
      reuseExistingServer: !process.env.CI,
    }
  }),
})
