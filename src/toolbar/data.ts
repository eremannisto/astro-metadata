import { parseHead } from "../lib/checks.js"
import type { Check } from "../lib/checks.js"
import { getConfig } from "../lib/config.ts"
import { loadAssets } from "./assets.ts"

export type { Check }

/** A meta tag: its `name` or `property`, and its `content`. */
export type MetaTag = {
  key: string
  value: string
}

/** A link tag and its attributes. */
export type LinkTag = {
  rel: string
  href: string
  type?: string
  sizes?: string
  hreflang?: string
  title?: string
  media?: string
  /** The tag as HTML. */
  html: string
}

/** A JSON-LD script: its source, and its data when the JSON is valid. */
export type JsonLd = {
  source: string
  data?: unknown
  /** The `@type` values, e.g. ["WebSite", "BreadcrumbList"]. */
  types: string[]
  error?: string
}

/** The web app manifest of the page, loaded from its URL. */
export type ManifestData = {
  url: string
  data?: unknown
  error?: string
}

/** All metadata of the current page. The tabs of the panel only read this object. */
export type PageMetadata = {
  url: string
  lang?: string
  title?: string
  description?: string
  canonical?: string
  robots?: string
  themeColors: { color: string; media?: string }[]
  openGraph: MetaTag[]
  twitter: MetaTag[]
  icons: LinkTag[]
  feeds: LinkTag[]
  hreflang: LinkTag[]
  manifest?: ManifestData
  schemas: JsonLd[]
  /** True for a page that the `pages.ignore` option matches: it gets no checks. */
  ignored: boolean
  /** The metadata tags of the head as HTML, one tag on each line. */
  source: string
  checks: Check[]
}

// The link tags of the metadata. Other links, e.g. stylesheets, are not metadata.
const METADATA_LINKS = ["canonical", "icon", "apple-touch-icon", "manifest", "alternate"]

/**
 * Returns the attributes of a link tag.
 */
function linkTag(element: HTMLLinkElement): LinkTag {
  return {
    rel: element.rel,
    href: element.getAttribute("href") ?? "",
    type: element.getAttribute("type") ?? undefined,
    sizes: element.getAttribute("sizes") ?? undefined,
    hreflang: element.getAttribute("hreflang") ?? undefined,
    title: element.getAttribute("title") ?? undefined,
    media: element.getAttribute("media") ?? undefined,
    html: element.outerHTML,
  }
}

/**
 * Returns the meta tags with a `name` or `property` that starts with a prefix, in their order.
 */
function metaTags(prefix: string): MetaTag[] {
  const tags = [...document.head.querySelectorAll("meta")]
  return tags.flatMap((element) => {
    const key = element.getAttribute("property") ?? element.getAttribute("name") ?? ""
    return key.startsWith(prefix) ? [{ key, value: element.content }] : []
  })
}

/**
 * Returns the content of the first meta tag with a name.
 */
function metaContent(name: string): string | undefined {
  return document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)?.content
}

/**
 * Returns the JSON-LD scripts of the page, in the head and in the body.
 */
function jsonLd(): JsonLd[] {
  const scripts = [...document.querySelectorAll('script[type="application/ld+json"]')]
  return scripts.map((script) => {
    const source = script.textContent ?? ""
    try {
      const data = JSON.parse(source)
      // The items of a list, or of a graph
      const list = Array.isArray(data) ? data : [data]
      const items = list.flatMap((item) => {
        return Array.isArray(item?.["@graph"]) ? item["@graph"] : [item]
      })
      const types = items.map((item) => {
        return String(item?.["@type"] ?? "?")
      })
      return { source, data, types }
    } catch (error) {
      return { source, types: [], error: error instanceof Error ? error.message : String(error) }
    }
  })
}

/**
 * Returns the metadata tags of the head as HTML. The scripts and styles of the dev server
 * are left out, so the source shows only what the site renders.
 */
function headSource(): string {
  const elements = [...document.head.children].filter((element) => {
    const tag = element.tagName.toLowerCase()
    if (tag === "title" || tag === "meta") return true
    if (tag === "link") return METADATA_LINKS.includes((element as HTMLLinkElement).rel)
    return tag === "script" && element.getAttribute("type") === "application/ld+json"
  })
  return elements
    .map((element) => {
      return element.outerHTML
    })
    .join("\n")
}

/**
 * Loads the web app manifest of the page.
 */
async function loadManifest(url: string): Promise<ManifestData> {
  try {
    const response = await fetch(url)
    if (!response.ok) return { url, error: `The server answered ${response.status}.` }
    return { url, data: await response.json() }
  } catch (error) {
    return { url, error: error instanceof Error ? error.message : String(error) }
  }
}

/**
 * Reads the metadata of the current page. The checks are the same as the build checks.
 */
export async function collect(): Promise<PageMetadata> {
  const head = document.head
  const links = [...head.querySelectorAll<HTMLLinkElement>("link")].map(linkTag)
  const manifestUrl = links.find((link) => {
    return link.rel === "manifest"
  })?.href

  return {
    url: location.href,
    lang: document.documentElement.lang || undefined,
    title: head.querySelector("title")?.textContent ?? undefined,
    description: metaContent("description"),
    canonical: links.find((link) => {
      return link.rel === "canonical"
    })?.href,
    robots: metaContent("robots"),
    themeColors: [...head.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')].map(
      (element) => {
        return { color: element.content, media: element.media || undefined }
      }
    ),
    openGraph: metaTags("og:"),
    twitter: metaTags("twitter:"),
    icons: links.filter((link) => {
      return link.rel === "icon" || link.rel === "apple-touch-icon"
    }),
    feeds: links.filter((link) => {
      return link.rel === "alternate" && !link.hreflang && Boolean(link.type)
    }),
    hreflang: links.filter((link) => {
      return link.rel === "alternate" && Boolean(link.hreflang)
    }),
    manifest: manifestUrl ? await loadManifest(manifestUrl) : undefined,
    schemas: jsonLd(),
    source: headSource(),
    ...(await checkPage()),
  }
}

/**
 * Returns the value of a meta tag of a list, e.g. "og:image" of the Open Graph tags.
 */
export function findMeta(tags: MetaTag[], key: string): string | undefined {
  return tags.find((tag) => {
    return tag.key === key
  })?.value
}

/** The problems of a page: the number of errors and warnings, and the worst level. */
export type CheckSummary = {
  errors: number
  warnings: number
  /** "error" or "warning", or undefined for a page without problems. */
  level?: "error" | "warning"
}

/**
 * Counts the errors and the warnings. Information, e.g. noindex, is not a problem.
 * The toolbar badge, the tab badge and the status alert use the same summary.
 */
export function summarize(checks: Check[]): CheckSummary {
  const errors = checks.filter((check) => {
    return check.level === "error"
  }).length
  const warnings = checks.filter((check) => {
    return check.level === "warning"
  }).length

  let level: CheckSummary["level"]
  if (errors > 0) level = "error"
  else if (warnings > 0) level = "warning"
  return { errors, warnings, level }
}

/** The result of the checks of a page. */
export type PageChecks = {
  /** True for a page that the `pages.ignore` option matches: it gets no checks. */
  ignored: boolean
  checks: Check[]
}

// The check endpoint of the dev server. The integration adds it.
const CHECK_PATH = "/__astro-metadata/check"

/**
 * Returns the path of the current page without the base, e.g. "/blog/" for "/docs/blog/".
 */
function pagePath(): string {
  const prefix = (getConfig().base ?? "/").replace(/\/$/, "")
  const path = location.pathname
  return prefix && path.startsWith(prefix) ? path.slice(prefix.length) || "/" : path
}

/**
 * Checks the current page with the same rules as the build. The app loads the files of the
 * page, and the dev server runs the rules: the custom rules are functions in the Astro
 * config, so only the server has them.
 */
export async function checkPage(): Promise<PageChecks> {
  const html = document.documentElement.outerHTML
  const assets = await loadAssets(parseHead(html))
  const prefix = (getConfig().base ?? "/").replace(/\/$/, "")

  try {
    const response = await fetch(`${prefix}${CHECK_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html, path: pagePath(), assets }),
    })
    if (!response.ok) throw new Error(`The server answered ${response.status}.`)
    return (await response.json()) as PageChecks
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    return {
      ignored: false,
      checks: [
        {
          id: "check-failed",
          field: "custom",
          level: "error",
          message: `The dev server could not check the page: ${reason}`,
        },
      ],
    }
  }
}
