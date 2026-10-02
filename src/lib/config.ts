import type { FaviconInfo } from "./favicon.ts"
import type { ManifestConfig } from "./manifest.ts"

/**
 * A text value: one string for all locales, or one string for each locale.
 *
 * @example "Acme Studio"
 * @example { en: "Acme Studio", fi: "Acme Studio Suomi" }
 */
export type Localized = string | Record<string, string>

/**
 * An image for the social cards. Use an image of 1200 × 630 px.
 */
export type MetadataImage = {
  /** The path or URL of the image, e.g. "/og.jpg". */
  url: string
  /** A description of the image. */
  alt?: string
  width?: number
  height?: number
}

/**
 * The color of the browser interface: one color, or one color for each color mode.
 */
export type ThemeColor = string | { light: string; dark: string }

/**
 * A feed of the site: RSS, Atom or JSON.
 */
export type Feed = {
  /** The path of the feed, e.g. "/rss.xml". */
  href: string
  title?: Localized
  /** Defaults to "rss". */
  type?: "rss" | "atom" | "json"
}

/**
 * The site values in the `metadata()` integration. The props of `<Metadata>` override them.
 */
export type MetadataConfig = {
  /** The name of the site: the title of a page without a title, and `og:site_name`. */
  siteName?: Localized
  /** The title template, e.g. "%s | My Site". */
  titleTemplate?: Localized
  /** The description of a page without a description. */
  description?: Localized
  /** The social image of a page without an image. */
  image?: Omit<MetadataImage, "alt"> & { alt?: Localized }
  twitter?: {
    /** The card type for pages with an image. Defaults to "summary_large_image". */
    card?: "summary" | "summary_large_image"
    /** The Twitter (X) handle of the site, e.g. "@mysite". */
    site?: string
  }
  /** The color of the browser interface, e.g. the address bar on Android. */
  themeColor?: ThemeColor
  /** The feeds of the site. */
  feeds?: Feed[]
  robots?: {
    /** Set to false to keep all pages out of search results, e.g. on a staging site. */
    index?: boolean
    /** Set to false to tell search engines not to follow the links. */
    follow?: boolean
    /** Other directives for all pages, e.g. "max-image-preview:large". */
    extra?: string
  }
  /** The web app manifest: an object to generate it, or the path of your own manifest. */
  manifest?: ManifestConfig | string
}

/**
 * The data that the integration gives to the components at build time.
 */
export type RuntimeConfig = MetadataConfig & {
  /** The generated favicon files. */
  favicon?: FaviconInfo
  /** The `trailingSlash` setting of the Astro config. */
  trailingSlash?: "always" | "never" | "ignore"
  /** The `build.format` setting of the Astro config. */
  buildFormat?: "directory" | "file" | "preserve"
  /** The `base` of the Astro config. */
  base?: string
  /** The `site` of the Astro config. The dev toolbar app loads its files from the dev server. */
  site?: string
}

// The integration replaces this name with the config, with Vite's `define`
declare const __ASTRO_METADATA__: RuntimeConfig | undefined

/**
 * Returns the config of the integration, or an empty config without the integration.
 */
export function getConfig(): RuntimeConfig {
  return typeof __ASTRO_METADATA__ === "undefined" ? {} : __ASTRO_METADATA__
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
