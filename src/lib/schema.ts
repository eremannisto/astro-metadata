import type {
  Article,
  BreadcrumbList,
  Graph,
  Organization,
  Person,
  Thing,
  WebSite,
  WithContext,
} from "schema-dts"

import { getConfig, localize } from "./config.ts"
import { url } from "./url.ts"

/**
 * The data of a JSON-LD script. The schema.org types give the editor completion,
 * and other objects are also accepted.
 */
export type SchemaData = WithContext<Thing> | Graph | Record<string, unknown>

export type SchemaWebsite = {
  /** Defaults to `siteName` in the config. */
  name?: string
  /** Defaults to `description` in the config. */
  description?: string
  /** Defaults to the site root. */
  url?: string
  /** The locale of the localized config values, e.g. `Astro.currentLocale`. */
  locale?: string
}

export type SchemaOrganization = {
  /** Defaults to `siteName` in the config. */
  name?: string
  /** Defaults to the site root. */
  url?: string
  /** The path or URL of the logo, e.g. "/logo.png". */
  logo?: string
  /** The profiles of the organization on other sites. */
  sameAs?: string[]
  /** The locale of the localized config values, e.g. `Astro.currentLocale`. */
  locale?: string
}

export type SchemaAuthor = string | { name: string; url?: string }

export type SchemaArticle = {
  /** Defaults to "Article". */
  type?: "Article" | "BlogPosting" | "NewsArticle"
  title: string
  description?: string
  /** The paths or URLs of the images. */
  image?: string | string[]
  published?: Date | string
  modified?: Date | string
  author?: SchemaAuthor | SchemaAuthor[]
  /** The URL of the article page, e.g. `Astro.url.pathname`. */
  url?: string
  /** The locale of the article. The publisher name uses it too. */
  locale?: string
}

export type SchemaBreadcrumb = {
  name: string
  /** The path or URL of the page, e.g. "/exhibitions". */
  url: string
}

/**
 * Returns a date as an ISO 8601 text. A text stays unchanged.
 */
function isoDate(value: Date | string | undefined): string | undefined {
  if (value === undefined || typeof value === "string") return value
  return value.toISOString()
}

/**
 * Returns an author as a schema.org person.
 */
function person(author: SchemaAuthor): Person {
  if (typeof author === "string") {
    return { "@type": "Person", name: author }
  }
  return {
    "@type": "Person",
    name: author.name,
    url: author.url ? url(author.url) : undefined,
  }
}

/**
 * Returns the `WebSite` schema, with the name and the URL of the site.
 *
 * @example Schema.website({ locale: Astro.currentLocale })
 */
function website(options: SchemaWebsite = {}): WithContext<WebSite> {
  const config = getConfig()
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: options.name ?? localize(config.siteName, options.locale),
    description: options.description ?? localize(config.description, options.locale),
    url: url(options.url ?? "/"),
    inLanguage: options.locale,
  }
}

/**
 * Returns the `Organization` schema of the site owner.
 *
 * @example Schema.organization({ logo: "/logo.png" })
 */
function organization(options: SchemaOrganization = {}): WithContext<Organization> {
  const config = getConfig()
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: options.name ?? localize(config.siteName, options.locale),
    url: url(options.url ?? "/"),
    logo: options.logo ? url(options.logo) : undefined,
    sameAs: options.sameAs,
  }
}

/**
 * Returns the `Article` schema of a page. The publisher is the site from the config.
 *
 * @example Schema.article({ title, published: post.date, author: "Acme Writer" })
 */
function article(options: SchemaArticle): WithContext<Article> {
  const config = getConfig()
  const siteName = localize(config.siteName, options.locale)
  const images = typeof options.image === "string" ? [options.image] : options.image
  const authors = Array.isArray(options.author) ? options.author : [options.author]

  return {
    "@context": "https://schema.org",
    "@type": options.type ?? "Article",
    headline: options.title,
    description: options.description,
    image: images?.map((image) => {
      return url(image)
    }),
    datePublished: isoDate(options.published),
    dateModified: isoDate(options.modified),
    author: options.author
      ? authors.flatMap((author) => {
          return author ? [person(author)] : []
        })
      : undefined,
    publisher: siteName
      ? {
          "@type": "Organization",
          name: siteName,
          url: url("/"),
        }
      : undefined,
    mainEntityOfPage: options.url ? url(options.url) : undefined,
    inLanguage: options.locale,
  } as WithContext<Article>
}

/**
 * Returns the `BreadcrumbList` schema: the path from the home page to the current page.
 *
 * @example Schema.breadcrumbs([{ name: "Home", url: "/" }, { name: "Blog", url: "/blog" }])
 */
function breadcrumbs(items: SchemaBreadcrumb[]): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => {
      return {
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: url(item.url),
      }
    }),
  }
}

/**
 * Builders for common JSON-LD schemas. They fill in values from the config of the
 * integration and make all URLs absolute. Give the result to `<Metadata schema>`.
 */
export const Schema = {
  website,
  organization,
  article,
  breadcrumbs,

  /**
   * Returns the data as JSON that is safe inside a script tag.
   *
   * @example <script type="application/ld+json" set:html={Schema.stringify(data)} />
   */
  stringify(data: SchemaData | SchemaData[]): string {
    // Escape the characters that can end the script tag or break the JavaScript parser.
    // A value such as "</script>" in the schema then stays inside the JSON.
    return JSON.stringify(data)
      .replace(/</g, "\\u003c")
      .replace(/>/g, "\\u003e")
      .replace(/&/g, "\\u0026")
      .replace(/\u2028/g, "\\u2028")
      .replace(/\u2029/g, "\\u2029")
  },
}
