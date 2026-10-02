import metadata from "@mannisto/astro-metadata"
import { defineConfig } from "astro/config"

export default defineConfig({
  site: "https://example.com",
  integrations: [
    metadata({
      siteName: { en: "Config Site", fi: "Config-sivusto" },
      titleTemplate: { en: "%s | Config Site", fi: "%s | Config-sivusto" },
      description: { en: "The default description", fi: "Oletuskuvaus" },
      image: {
        url: "/og.jpg",
        alt: { en: "Config Site", fi: "Config-sivusto" },
        width: 1200,
        height: 630,
      },
      twitter: { site: "@configsite" },
      themeColor: "#123456",
      feeds: [{ href: "/rss.xml", title: { en: "Blog", fi: "Blogi" } }],
      robots: { extra: "max-image-preview:large" },
      manifest: {
        name: { en: "Config Site", fi: "Config-sivusto" },
        shortName: "Config",
        extra: { categories: ["art"] },
      },
      favicon: {
        source: "./src/assets/logo.svg",
        background: "#1e40af",
      },
      pages: { ignore: ["/unknown-locale"] },
      rules: {
        ignore: ["description-short"],
        custom: [
          {
            id: "own-title",
            level: "warning",
            message: "The page has its own title.",
            check(head) {
              return head.titles[0]?.startsWith("Own") ?? false
            },
          },
        ],
      },
    }),
  ],
})
