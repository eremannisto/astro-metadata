import { getConfig, localize } from "./config.ts"
import type { MetadataImage } from "./config.ts"
import { i18n } from "./i18n.ts"
import type { I18nPage } from "./i18n.ts"
import { openGraphAlternates, openGraphLocale } from "./open-graph.ts"
import type { SchemaAuthor, SchemaBreadcrumb, SchemaData } from "./schema.ts"
import { pageUrl } from "./url.ts"

export type HreflangLink = {
  /** The locale of the version, e.g. "en", "fi" or "en-US", or "x-default". */
  hreflang: string
  /** The path or URL of the page in that locale. */
  href: string
}

/** The props of `<Metadata>`. The small components take the props that they use. */
export type MetadataProps = {
  /** The page title. The title template of the config adds the site name. */
  title?: string
  /** Defaults to the description of the config. */
  description?: string
  /** The social image. Defaults to the image of the config. */
  image?: MetadataImage
  /**
   * The Open Graph type. Defaults to "website". "article" also adds the `Article`
   * structured data, with the title, the description, the image and the dates.
   */
  type?: string
  /**
   * The author of an article: a name, or `{ name, url, twitter }`. The Twitter (X) handle
   * gives `twitter:creator`.
   */
  author?: SchemaAuthor | SchemaAuthor[]
  /** The publication date of an article. */
  published?: Date | string
  /** The date of the last change of an article. */
  modified?: Date | string
  /**
   * The canonical path or URL. Defaults to the current page. With `@mannisto/astro-i18n`,
   * the default is the public URL of the page.
   */
  canonical?: string
  /** Set to false to keep the page out of search results. Defaults to true. */
  index?: boolean
  /** Set to false to tell search engines not to follow the links. Defaults to true. */
  follow?: boolean
  /**
   * The hreflang links: the page in each locale, and `x-default`. With `@mannisto/astro-i18n`
   * or the `i18n` option of Astro, the links are made for you. `[]` turns them off.
   */
  hreflang?: HreflangLink[]
  /** The path from the home page to this page. It adds the `BreadcrumbList` structured data. */
  breadcrumbs?: SchemaBreadcrumb[]
  /**
   * Structured data items of your own, e.g. a `Product`. They go into the structured data
   * of the page, with the site from the config.
   */
  schema?: SchemaData | SchemaData[]
  /**
   * The locale of the page. Defaults to `Astro.currentLocale`, or the locale of
   * `@mannisto/astro-i18n`.
   */
  locale?: string
}

/**
 * Returns the full title of a page: the title in the title template, or the site name
 * for a page without a title.
 *
 * @example fullTitle("About") // "About | My Site"
 */
export function fullTitle(title?: string, locale?: string): string | undefined {
  const config = getConfig()
  if (!title) return localize(config.siteName, locale)

  const template = localize(config.titleTemplate, locale)
  if (!template?.includes("%s")) return title

  // A replacer function keeps "$&" and other "$" patterns in the title as text
  return template.replace("%s", () => {
    return title
  })
}

/**
 * Returns the locale of the page: the prop, `Astro.currentLocale`, or the locale of the
 * i18n setup of the project.
 */
export function pageLocale(page: I18nPage, props: MetadataProps): string | undefined {
  return props.locale ?? page.currentLocale ?? i18n?.locale(page)
}

/**
 * Returns the absolute canonical URL of the page: the prop, the public path of the
 * i18n setup, or the current path.
 */
export function pageCanonical(page: I18nPage, props: MetadataProps): string {
  return pageUrl(props.canonical ?? i18n?.path(page) ?? page.url.pathname)
}

/**
 * Returns the hreflang links of the page: the prop, or the links of the i18n setup.
 */
export function pageHreflang(page: I18nPage, props: MetadataProps): HreflangLink[] {
  return props.hreflang ?? i18n?.alternates(page) ?? []
}

/**
 * Returns the social image of the page: the prop, or the image of the config with the alt
 * text of the locale.
 */
export function pageImage(props: MetadataProps, locale?: string): MetadataImage | undefined {
  if (props.image) return props.image

  const image = getConfig().image
  if (!image) return undefined
  return { ...image, alt: localize(image.alt, locale) }
}

/**
 * Returns the description of the page: the prop, or the description of the config.
 */
export function pageDescription(props: MetadataProps, locale?: string): string | undefined {
  return props.description ?? localize(getConfig().description, locale)
}

/**
 * Returns the content of the robots tag, or an empty text. Search engines index and follow
 * by default, so the tag is only necessary for other values.
 */
export function pageRobots(props: MetadataProps): string {
  const robots = getConfig().robots
  const index = props.index ?? robots?.index ?? true
  const follow = props.follow ?? robots?.follow ?? true

  return [!index && "noindex", !follow && "nofollow", robots?.extra].filter(Boolean).join(", ")
}

/**
 * Returns the Open Graph locale of the page and its other locales: "fi_FI".
 */
export function pageOpenGraphLocales(
  locale: string | undefined,
  hreflang: HreflangLink[]
): { locale?: string; alternates: string[] } {
  const codes = hreflang.map((link) => {
    return link.hreflang
  })
  return { locale: openGraphLocale(locale), alternates: openGraphAlternates(locale, codes) }
}

/**
 * Returns the authors of an article as a list.
 */
export function pageAuthors(props: MetadataProps): SchemaAuthor[] {
  return props.author === undefined ? [] : [props.author].flat()
}

/**
 * Returns a date as an ISO 8601 text. A text stays unchanged.
 */
export function isoDate(value: Date | string): string {
  return typeof value === "string" ? value : value.toISOString()
}
