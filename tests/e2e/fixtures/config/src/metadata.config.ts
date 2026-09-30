import { defineMetadata } from "@mannisto/astro-metadata"

export default defineMetadata({
  siteName: {
    en: "Config Site",
    fi: "Config-sivusto",
  },
  titleTemplate: {
    en: "%s | Config Site",
    fi: "%s | Config-sivusto",
  },
  description: {
    en: "The default description",
    fi: "Oletuskuvaus",
  },
  image: {
    url: "/og.jpg",
    width: 1200,
    height: 630,
  },
  robots: {
    archive: false,
  },
  twitter: {
    site: "@configsite",
  },
})
