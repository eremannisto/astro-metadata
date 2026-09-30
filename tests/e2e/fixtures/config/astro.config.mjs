import metadata from "@mannisto/astro-metadata/integration"
import { defineConfig } from "astro/config"

export default defineConfig({
  site: "https://example.com",
  integrations: [metadata()],
})
