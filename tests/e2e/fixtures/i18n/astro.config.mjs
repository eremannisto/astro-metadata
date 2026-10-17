import i18n from "@mannisto/astro-i18n"
import metadata from "@mannisto/astro-metadata"
import { defineConfig } from "astro/config"

export default defineConfig({
  site: "https://example.com",
  integrations: [
    i18n({
      locales: [
        { code: "en", name: "English" },
        { code: "fi", name: "Finnish" },
      ],
      defaultLocale: "en",
      prefixDefaultLocale: false,
    }),
    metadata({
      siteName: { en: "I18n Site", fi: "I18n-sivusto" },
    }),
  ],
})
