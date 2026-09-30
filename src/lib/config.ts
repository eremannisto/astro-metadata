import type { OpenGraphImage } from "../components/OpenGraph.astro"
import type { Props as RobotsProps } from "../components/Robots.astro"
import type { Props as TwitterProps } from "../components/Twitter.astro"

/**
 * A text value: one string for all locales, or one string for each locale.
 *
 * @example "Tischenko Gallery"
 * @example { en: "Tischenko Gallery", fi: "Tischenkon galleria" }
 */
export type Localized = string | Record<string, string>

/**
 * The site-wide defaults in `src/metadata.config.ts`. Props on `Head` override them.
 */
export type MetadataConfig = {
  /** The name of the site. The title of a page without a title, and `og:site_name`. */
  siteName?: Localized
  /** The title template, e.g. "%s | My Site". */
  titleTemplate?: Localized
  /** The default description. */
  description?: Localized
  /** The default image for OpenGraph and Twitter. */
  image?: OpenGraphImage
  /** The default robots directives. */
  robots?: RobotsProps
  /** The default Twitter values, e.g. the `site` and `creator` handles. */
  twitter?: Pick<TwitterProps, "card" | "site" | "creator">
}

const KEY = Symbol.for("@mannisto/astro-metadata/config")

/**
 * Returns the config from `src/metadata.config.ts`, or an empty config without the integration.
 */
export function getConfig(): MetadataConfig {
  const store = globalThis as { [KEY]?: MetadataConfig }
  return store[KEY] ?? {}
}

/**
 * Returns the value of a text for a locale. A missing locale uses the first value.
 *
 * @param value - A string or an object with one string for each locale.
 * @param locale - The current locale, e.g. "fi".
 * @returns The text, or undefined without a value.
 */
export function localize(value: Localized | undefined, locale?: string): string | undefined {
  if (value === undefined || typeof value === "string") return value
  if (locale && Object.hasOwn(value, locale)) return value[locale]
  return Object.values(value)[0]
}

/**
 * Defines the site-wide defaults in `src/metadata.config.ts`.
 * Returns the config unchanged: the function only gives the editor the types.
 *
 * @param config - The site-wide defaults.
 * @returns The same config.
 */
export function defineMetadata(config: MetadataConfig): MetadataConfig {
  return config
}
