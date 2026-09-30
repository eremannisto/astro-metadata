import { localize } from "./config.ts"
import type { Localized, MetadataConfig } from "./config.ts"
import { icons } from "./favicon.ts"
import { withBase } from "./url.ts"

/**
 * The web app manifest in `src/metadata.config.ts`. Text values can have one
 * value for each locale: then each locale gets its own manifest file.
 */
export type ManifestConfig = {
  name: Localized
  shortName?: Localized
  description?: Localized
  /** How the installed app opens. Defaults to "standalone". */
  display?: "standalone" | "fullscreen" | "minimal-ui" | "browser"
  /** The page that the installed app opens. Defaults to the site root. */
  startUrl?: Localized
  /** Defaults to `themeColor` in the config, or its light color. */
  themeColor?: string
  backgroundColor?: string
  /** Other manifest fields, e.g. `shortcuts`, copied into the file unchanged. */
  extra?: Record<string, unknown>
}

/**
 * Returns the locales of the manifest: the keys of the first localized text,
 * or an empty list for a manifest with one language.
 */
function manifestLocales(manifest: ManifestConfig): string[] {
  const texts = [manifest.name, manifest.shortName, manifest.description, manifest.startUrl]
  const localized = texts.find((text) => {
    return typeof text === "object"
  })
  return localized ? Object.keys(localized) : []
}

/**
 * Returns the paths of the manifest files: `undefined` for `/manifest.webmanifest`,
 * and a locale for `/<locale>/manifest.webmanifest`. The first locale uses the root.
 *
 * @param config - The site config.
 * @returns One entry for each manifest file, or an empty list without a manifest.
 */
export function manifestPaths(config: MetadataConfig): { lang?: string; locale?: string }[] {
  if (!config.manifest) return []

  const locales = manifestLocales(config.manifest)
  if (locales.length === 0) return [{}]

  return locales.map((locale, index) => {
    return { lang: index === 0 ? undefined : locale, locale }
  })
}

/**
 * Returns the URL of the manifest for a locale, or undefined without a manifest.
 */
export function manifestUrl(config: MetadataConfig, locale?: string): string | undefined {
  if (!config.manifest) return undefined

  const path = manifestPaths(config).find((entry) => {
    return entry.locale === locale
  })
  return withBase(path?.lang ? `/${path.lang}/manifest.webmanifest` : "/manifest.webmanifest")
}

/**
 * Builds the web app manifest for a locale.
 *
 * @param config - The site config.
 * @param locale - The locale of the manifest, or undefined for one language.
 * @returns The manifest as a JSON object.
 */
export function buildManifest(config: MetadataConfig, locale?: string): Record<string, unknown> {
  const manifest = config.manifest ?? { name: "" }
  const themeColor =
    manifest.themeColor ??
    (typeof config.themeColor === "string" ? config.themeColor : config.themeColor?.light)
  const favicons = icons()

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
    icons: favicons.length > 0 ? favicons : undefined,
    ...manifest.extra,
  }

  // Remove empty fields, so the file has only the values that the config gives
  for (const key of Object.keys(json)) {
    if (json[key] === undefined) delete json[key]
  }
  return json
}
