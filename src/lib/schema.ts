import type { Graph, Thing, WithContext } from "schema-dts"

import { getConfig, localize } from "./config.ts"
import type { Localized } from "./config.ts"
import { url } from "./url.ts"

/**
 * A structured data item of your own, e.g. a `Product` or an `Event`. The schema.org types
 * give the editor completion, and other objects are also accepted. `@context` is not
 * necessary: the items go into one graph with the context.
 */
export type SchemaData = Thing | WithContext<Thing> | Record<string, unknown>

/**
 * The organization or the person behind the site. It is the publisher of the site and of
 * the articles.
 */
export type SchemaPublisher = {
  /** Defaults to "Organization". */
  type?: "Organization" | "Person"
  /** Defaults to `siteName` in the config. */
  name?: Localized
  /** The path or URL of the logo of an organization, e.g. "/logo.png". */
  logo?: string
  /** The profiles on other sites, e.g. the GitHub or LinkedIn page. */
  sameAs?: string[]
}

/** The `schema` option: the structured data of the site. Set to false to turn it off. */
export type SchemaConfig =
  | false
  | {
      publisher?: SchemaPublisher
    }

/** The author of an article: a name, or a name with a profile URL and a Twitter (X) handle. */
export type SchemaAuthor =
  | string
  | {
      name: string
      /** The path or URL of the profile page of the author, e.g. "/about". */
      url?: string
      /** The Twitter (X) handle of the author, e.g. "@acmewriter". */
      twitter?: string
    }

/** A step in the breadcrumbs: from the home page to the current page. */
export type SchemaBreadcrumb = {
  name: string
  /** The path or URL of the page, e.g. "/exhibitions". */
  url: string
}

/** The values of a page that the structured data uses. `<Metadata>` gives them. */
export type SchemaPage = {
  /** The absolute URL of the page. */
  url: string
  /** The title of the page without the title template. */
  title?: string
  description?: string
  /** The absolute URL of the social image. */
  image?: string
  locale?: string
  /** The Open Graph type: "article" adds an `Article`. */
  type?: string
  published?: Date | string
  modified?: Date | string
  author?: SchemaAuthor | SchemaAuthor[]
  breadcrumbs?: SchemaBreadcrumb[]
  /** Your own items. */
  items?: SchemaData[]
}

/**
 * Returns a date as an ISO 8601 text. A text stays unchanged.
 */
function isoDate(value: Date | string | undefined): string | undefined {
  if (value === undefined || typeof value === "string") return value
  return value.toISOString()
}

/**
 * Returns the authors as a list.
 */
function authorList(author: SchemaPage["author"]): SchemaAuthor[] {
  if (author === undefined) return []
  return Array.isArray(author) ? author : [author]
}

/**
 * Returns an author as a schema.org person.
 */
function person(author: SchemaAuthor): Record<string, unknown> {
  if (typeof author === "string") return { "@type": "Person", name: author }
  return {
    "@type": "Person",
    name: author.name,
    url: author.url ? url(author.url) : undefined,
  }
}

/**
 * Returns the publisher of the site, or undefined without a name.
 */
function publisher(page: SchemaPage, id: string): Record<string, unknown> | undefined {
  const config = getConfig()
  const options = (config.schema || undefined)?.publisher ?? {}
  const name = localize(options.name, page.locale) ?? localize(config.siteName, page.locale)
  if (!name) return undefined

  const type = options.type ?? "Organization"
  return {
    "@type": type,
    "@id": id,
    name,
    url: url("/"),
    logo: type === "Organization" && options.logo ? url(options.logo) : undefined,
    sameAs: options.sameAs,
  }
}

/**
 * Returns an item without `@context`: the graph has the context.
 */
function withoutContext(item: SchemaData): Record<string, unknown> {
  const copy = { ...(item as Record<string, unknown>) }
  delete copy["@context"]
  return copy
}

/**
 * Returns the structured data of a page as one graph:
 * - the `WebSite` and its publisher, from the config,
 * - an `Article` for a page with the type "article",
 * - a `BreadcrumbList` for a page with breadcrumbs,
 * - and your own items.
 * The items link to each other with `@id`. Returns undefined without items.
 */
function graph(page: SchemaPage): Graph | undefined {
  const config = getConfig()
  const site = url("/")
  const items: Record<string, unknown>[] = []

  const owner = config.schema === false ? undefined : publisher(page, `${site}#publisher`)
  const ownerLink = owner ? { "@id": owner["@id"] } : undefined

  if (config.schema !== false && owner) {
    items.push({
      "@type": "WebSite",
      "@id": `${site}#website`,
      name: owner.name,
      description: localize(config.description, page.locale),
      url: site,
      inLanguage: page.locale,
      publisher: ownerLink,
    })
    items.push(owner)
  }

  if (page.type === "article") {
    const authors = authorList(page.author)
    items.push({
      "@type": "Article",
      "@id": `${page.url}#article`,
      headline: page.title,
      description: page.description,
      image: page.image ? [page.image] : undefined,
      datePublished: isoDate(page.published),
      dateModified: isoDate(page.modified),
      author: authors.length > 0 ? authors.map(person) : undefined,
      publisher: ownerLink,
      mainEntityOfPage: page.url,
      inLanguage: page.locale,
    })
  }

  if (page.breadcrumbs && page.breadcrumbs.length > 0) {
    items.push({
      "@type": "BreadcrumbList",
      "@id": `${page.url}#breadcrumbs`,
      itemListElement: page.breadcrumbs.map((step, index) => {
        return { "@type": "ListItem", position: index + 1, name: step.name, item: url(step.url) }
      }),
    })
  }

  for (const item of page.items ?? []) {
    items.push(withoutContext(item))
  }

  if (items.length === 0) return undefined
  return { "@context": "https://schema.org", "@graph": items } as unknown as Graph
}

/**
 * The structured data of the pages. `<Metadata>` renders it: the site from the config,
 * and the article, the breadcrumbs and your own items of a page.
 */
export const Schema = {
  graph,

  /**
   * Returns the data as JSON that is safe inside a script tag. Empty values are removed.
   *
   * @example <script type="application/ld+json" set:html={Schema.stringify(data)} />
   */
  stringify(data: unknown): string {
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
