import metadata from "@mannisto/astro-metadata"
import { defineConfig } from "astro/config"

export default defineConfig({
  site: "https://example.com",
  i18n: {
    locales: ["en", "fi"],
    defaultLocale: "en",
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    metadata({
      siteName: { en: "Native Site", fi: "Natiivi sivusto" },
    }),
  ],
})
