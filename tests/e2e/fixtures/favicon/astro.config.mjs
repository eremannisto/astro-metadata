import metadata from "@mannisto/astro-metadata"
import { defineConfig } from "astro/config"

export default defineConfig({
  site: "https://example.com",
  base: "/docs",
  trailingSlash: "never",
  integrations: [
    metadata({
      // Your own manifest endpoint: src/pages/manifest.webmanifest.ts
      manifest: "/manifest.webmanifest",
      favicon: {
        source: "./src/assets/logo.png",
        // Replaces the default files
        files: [
          { path: "/favicon.ico", sizes: [16, 32, 48] },
          { path: "/apple-touch-icon.png", size: 180 },
          { path: "/favicon-96.png", size: 96 },
          { path: "/favicon-256.png", size: 256 },
        ],
      },
    }),
  ],
})
