import { getConfig, localize } from "./config.ts"
import type { Localized } from "./config.ts"
import { Favicon } from "./favicon.ts"
import { withBase } from "./url.ts"

/**
 * The web app manifest to generate. Text values can have one value for each locale:
 * then each locale gets its own manifest file.
 */
export type ManifestConfig = {
  name: Localized
  shortName?: Localized
  description?: Localized
  /** How the installed app opens. Defaults to "standalone". */
  display?: "standalone" | "fullscreen" | "minimal-ui" | "browser"
  /** The page that the installed app opens. Defaults to the site root. */
  startUrl?: Localized
  /** Defaults to the `themeColor` of the config, or its light color. */
  themeColor?: string
  backgroundColor?: string
  /** Other manifest fields, e.g. `shortcuts`, copied into the file unchanged. */
  extra?: Record<string, unknown>
}

/**
 * A generated manifest file: its locale, and its folder when it is not at the root.
 */
export type ManifestPath = {
  /** The folder of the file, e.g. "fi" for /fi/manifest.webmanifest. */
  lang?: string
  /** The locale of the texts in the file. */
  locale?: string
}

/**
 * Returns the manifest to generate, or undefined for no manifest or your own manifest.
 */
function generated(): ManifestConfig | undefined {
  const manifest = getConfig().manifest
  return typeof manifest === "object" ? manifest : undefined
}

/**
 * The web app manifest of the `manifest` option: an object generates the manifest,
 * and a string is the path of your own manifest.
 */
export const Manifest = {
  /**
   * Returns the `manifest` option, or undefined without it.
   */
  get config(): ManifestConfig | string | undefined {
    return getConfig().manifest
  },

  /**
   * Returns the generated manifest files. The first locale of the texts uses
   * /manifest.webmanifest, the other locales use /<locale>/manifest.webmanifest.
   * Returns an empty list for no manifest or your own manifest.
   */
  paths(): ManifestPath[] {
    const manifest = generated()
    if (!manifest) return []

    // The locales are the keys of the first localized text
    const texts = [manifest.name, manifest.shortName, manifest.description, manifest.startUrl]
    const localized = texts.find((text) => {
      return typeof text === "object"
    })
    if (!localized) return [{}]

    return Object.keys(localized).map((locale, index) => {
      return { lang: index === 0 ? undefined : locale, locale }
    })
  },

  /**
   * Returns the URL of the manifest for a locale, with the base.
   * An unknown locale gets the manifest at the root.
   *
   * @example Manifest.url("fi") // "/fi/manifest.webmanifest"
   */
  url(locale?: string): string | undefined {
    const manifest = getConfig().manifest
    if (!manifest) return undefined
    if (typeof manifest === "string") return withBase(manifest)

    const path = Manifest.paths().find((entry) => {
      return entry.locale === locale
    })
    return withBase(path?.lang ? `/${path.lang}/manifest.webmanifest` : "/manifest.webmanifest")
  },

  /**
   * Builds the manifest for a locale, with the generated favicons as its icons.
   * Returns undefined for no manifest or your own manifest.
   */
  build(locale?: string): Record<string, unknown> | undefined {
    const manifest = generated()
    if (!manifest) return undefined

    const siteColor = getConfig().themeColor
    const themeColor =
      manifest.themeColor ?? (typeof siteColor === "string" ? siteColor : siteColor?.light)
    const icons = Favicon.icons()

    const json: Record<string, unknown> = {
      name: localize(manifest.name, locale),
      short_name: localize(manifest.shortName, locale),
      description: localize(manifest.description, locale),
      lang: locale,
      start_url: withBase(localize(manifest.startUrl, locale) ?? "/"),
      scope: withBase("/"),
      display: manifest.display ?? "standalone",
      theme_color: themeColor,
      background_color: manifest.backgroundColor,
      icons: icons.length > 0 ? icons : undefined,
      ...manifest.extra,
    }

    // Remove empty fields, so the file has only the values that the config gives
    for (const key of Object.keys(json)) {
      if (json[key] === undefined) delete json[key]
    }
    return json
  },
}
