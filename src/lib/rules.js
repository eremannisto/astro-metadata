// Plain JavaScript: the integration runs in Node, which does not strip types in node_modules.
//
// The rules of the metadata checks. The build and the dev toolbar app use the same rules.
// To add a rule, add an object to the list below:
//
//   {
//     id: "og-title-missing",       // a short, unique name: users turn it off with `rules`
//     field: "og:title",            // the tag of the problem: the toolbar app shows its row
//     level: "warning",             // "error", "warning" or "info"
//     indexed: true,                // optional: skip the rule on a noindex page
//     check(head) {                 // returns the message of a problem, or undefined
//       if (!head.meta["og:title"]) return "The page has no `og:title`."
//     },
//   }
//
// Text between backticks shows as code in the dev toolbar app.

import { findLink, findLinks, isAbsolute } from "./head.js"

/** The approximate lengths that search results show. */
export const LIMITS = {
  title: 60,
  description: 160,
  /** A shorter description gives search engines little to show. */
  shortDescription: 50,
}

// The image sizes of the social sites, in px
const IMAGE = {
  /** All sites show a large image from this size. */
  large: { width: 1200, height: 630 },
  /** Facebook shows a small image under this size. */
  small: { width: 600, height: 315 },
  /** Facebook shows no image under this size. */
  minimum: 200,
  /** The ratios that the social sites show without a large crop. */
  ratio: { min: 1.6, max: 2.1 },
}

const TWITTER_CARDS = ["summary", "summary_large_image", "app", "player"]

/**
 * Returns "1 title tag" or "2 title tags".
 *
 * @param {number} count
 * @param {string} word
 * @returns {string}
 */
function count(count, word) {
  return `${count} ${word}${count === 1 ? "" : "s"}`
}

/**
 * Returns the JSON of each valid JSON-LD script, and the number of invalid scripts.
 *
 * @param {import("./head").HeadData} head
 * @returns {{ valid: unknown[], invalid: number }}
 */
function parseSchemas(head) {
  const valid = []
  let invalid = 0
  for (const schema of head.schemas) {
    try {
      valid.push(JSON.parse(schema))
    } catch {
      invalid++
    }
  }
  return { valid, invalid }
}

/**
 * Returns the `og:image` size, or undefined without the width and the height.
 *
 * @param {import("./head").HeadData} head
 * @returns {{ width: number, height: number } | undefined}
 */
function imageSize(head) {
  const width = Number.parseInt(head.meta["og:image:width"] ?? "", 10)
  const height = Number.parseInt(head.meta["og:image:height"] ?? "", 10)
  return Number.isNaN(width) || Number.isNaN(height) ? undefined : { width, height }
}

/**
 * Returns the language of a locale, e.g. "en" for "en-US" or "en_US".
 *
 * @param {string} locale
 * @returns {string}
 */
function language(locale) {
  return locale.split(/[-_]/)[0].toLowerCase()
}

/**
 * Returns the hreflang links of the page.
 *
 * @param {import("./head").HeadData} head
 * @returns {Record<string, string>[]}
 */
function hreflangLinks(head) {
  return findLinks(head, "alternate").filter((link) => {
    return Boolean(link.hreflang)
  })
}

// Text that a template leaves when a value is missing, e.g. "undefined | My Site"
const PLACEHOLDER = /\[object Object\]|%s|\{\{|\}\}/
const EMPTY_VALUES = ["undefined", "null", "nan"]

/**
 * Returns the first value that contains placeholder text, or undefined.
 *
 * @param {(string | undefined)[]} values
 * @returns {string | undefined}
 */
function findPlaceholder(values) {
  return values.find((value) => {
    if (!value) return false
    if (PLACEHOLDER.test(value)) return true
    // A part of a title between separators, e.g. "undefined" in "undefined | My Site"
    return value.split(/\s[|\-–—:·]\s/).some((part) => {
      return EMPTY_VALUES.includes(part.trim().toLowerCase())
    })
  })
}

// The fields that Google needs for a rich result. Without them, the type gives no rich result.
const REQUIRED_FIELDS = {
  BreadcrumbList: ["itemListElement"],
  Event: ["name", "startDate", "location"],
  FAQPage: ["mainEntity"],
  JobPosting: ["title", "datePosted", "description", "hiringOrganization"],
  Product: ["name"],
  Recipe: ["name", "image"],
  Review: ["itemReviewed", "author"],
}

// The fields that Google recommends for an article
const ARTICLE_TYPES = ["Article", "NewsArticle", "BlogPosting"]
const ARTICLE_FIELDS = ["headline", "image", "datePublished", "author"]

/**
 * Returns all items of the valid JSON-LD scripts: the items of arrays and of `@graph`.
 *
 * @param {import("./head").HeadData} head
 * @returns {Record<string, unknown>[]}
 */
function schemaItems(head) {
  return parseSchemas(head).valid.flatMap((schema) => {
    const items = Array.isArray(schema) ? schema : [schema]
    return items.flatMap((item) => {
      if (!item || typeof item !== "object") return []
      return Array.isArray(item["@graph"]) ? [item, ...item["@graph"]] : [item]
    })
  })
}

/**
 * Returns the types of a structured data item, e.g. ["Article"].
 *
 * @param {Record<string, unknown>} item
 * @returns {string[]}
 */
function typesOf(item) {
  const type = item["@type"]
  return (Array.isArray(type) ? type : [type]).filter((value) => {
    return typeof value === "string"
  })
}

/**
 * Returns "`a`" or "`a` and `b`" or "`a`, `b` and `c`".
 *
 * @param {string[]} names
 * @returns {string}
 */
function codeList(names) {
  const codes = names.map((name) => {
    return `\`${name}\``
  })
  if (codes.length === 1) return codes[0]
  return `${codes.slice(0, -1).join(", ")} and ${codes[codes.length - 1]}`
}

/** @type {import("./rules").Rule[]} */
export const RULES = [
  // The document

  {
    id: "title-missing",
    field: "title",
    level: "error",
    check(head) {
      if (!head.titles[0]) return "The page has no title."
    },
  },
  {
    id: "title-duplicate",
    field: "title",
    level: "error",
    check(head) {
      if (head.titles.length > 1) {
        return `The page has ${count(head.titles.length, "title tag")}. Keep only one.`
      }
    },
  },
  {
    id: "title-long",
    field: "title",
    level: "warning",
    check(head) {
      const title = head.titles[0] ?? ""
      if (title.length > LIMITS.title) {
        return `The title has ${title.length} characters. Search results show about ${LIMITS.title}.`
      }
    },
  },
  {
    id: "charset-missing",
    field: "charset",
    level: "warning",
    check(head) {
      if (!head.charset)
        return "The page has no `<meta charset>`. Browsers can show wrong characters."
    },
  },
  {
    id: "viewport-missing",
    field: "viewport",
    level: "warning",
    check(head) {
      if (!head.meta.viewport) {
        return "The page has no `viewport` meta tag. Phones show the page zoomed out."
      }
    },
  },
  {
    id: "lang-missing",
    field: "lang",
    level: "warning",
    check(head) {
      if (!head.lang) return "The `<html>` tag has no `lang` attribute."
    },
  },
  {
    id: "lang-invalid",
    field: "lang",
    level: "warning",
    check(head) {
      if (head.lang && !/^[a-z]{2,3}(-[a-z0-9]{2,8})*$/i.test(head.lang)) {
        return `The \`lang\` value \`${head.lang}\` is not valid. Use a code like \`en\` or \`en-US\`.`
      }
    },
  },
  {
    id: "placeholder-title",
    field: "title",
    level: "error",
    check(head) {
      const value = findPlaceholder([
        head.titles[0],
        head.meta["og:title"],
        head.meta["twitter:title"],
      ])
      if (value) return `The title contains placeholder text: "${value}".`
    },
  },
  {
    id: "placeholder-description",
    field: "description",
    level: "error",
    check(head) {
      const value = findPlaceholder([
        head.meta.description,
        head.meta["og:description"],
        head.meta["twitter:description"],
      ])
      if (value) return `The description contains placeholder text: "${value}".`
    },
  },
  {
    id: "favicon-missing",
    field: "favicon",
    level: "warning",
    check(head) {
      if (!findLink(head, "icon")) return "The page has no favicon link."
    },
  },
  {
    id: "apple-touch-icon-missing",
    field: "favicon",
    level: "info",
    check(head) {
      if (findLink(head, "icon") && !findLink(head, "apple-touch-icon")) {
        return "The page has no `apple-touch-icon`. iOS shows a screenshot of the page on the home screen."
      }
    },
  },

  // Structured data

  {
    id: "json-ld-invalid",
    field: "json-ld",
    level: "error",
    check(head) {
      const { invalid } = parseSchemas(head)
      if (invalid === 1) return "A JSON-LD script does not contain valid JSON."
      if (invalid > 1) return `${invalid} JSON-LD scripts do not contain valid JSON.`
    },
  },
  {
    id: "json-ld-context",
    field: "json-ld",
    level: "warning",
    check(head) {
      const missing = parseSchemas(head).valid.some((schema) => {
        const items = Array.isArray(schema) ? schema : [schema]
        return items.some((item) => {
          return item && typeof item === "object" && !("@context" in item)
        })
      })
      if (missing) return "A JSON-LD item has no `@context`. Set it to `https://schema.org`."
    },
  },
  {
    id: "json-ld-required",
    field: "json-ld",
    level: "error",
    check(head) {
      for (const item of schemaItems(head)) {
        for (const type of typesOf(item)) {
          const missing = (REQUIRED_FIELDS[type] ?? []).filter((field) => {
            return item[field] === undefined
          })
          if (missing.length > 0) {
            return `The \`${type}\` structured data has no ${codeList(missing)}. Google shows no rich result.`
          }
        }
      }
    },
  },
  {
    id: "json-ld-breadcrumb",
    field: "json-ld",
    level: "error",
    check(head) {
      const lists = schemaItems(head).filter((item) => {
        return typesOf(item).includes("BreadcrumbList")
      })
      for (const list of lists) {
        const items = Array.isArray(list.itemListElement) ? list.itemListElement : []
        const invalid = items.some((item) => {
          return !item || item.position === undefined || item.name === undefined
        })
        if (invalid) {
          return "An item of the `BreadcrumbList` has no `position` or `name`."
        }
      }
    },
  },
  {
    id: "json-ld-article",
    field: "json-ld",
    level: "warning",
    indexed: true,
    check(head) {
      for (const item of schemaItems(head)) {
        const type = typesOf(item).find((value) => {
          return ARTICLE_TYPES.includes(value)
        })
        if (!type) continue

        const missing = ARTICLE_FIELDS.filter((field) => {
          return item[field] === undefined
        })
        if (missing.length > 0) {
          return `The \`${type}\` structured data has no ${codeList(missing)}. Google recommends them.`
        }
      }
    },
  },

  // Search engines

  {
    id: "noindex",
    field: "robots",
    level: "info",
    check(head) {
      if (/noindex/i.test(head.meta.robots ?? "")) {
        return "The robots tag contains `noindex`: search engines do not show the page."
      }
    },
  },
  {
    id: "description-missing",
    field: "description",
    level: "warning",
    indexed: true,
    check(head) {
      if (!head.meta.description) return "The page has no description."
    },
  },
  {
    id: "description-long",
    field: "description",
    level: "warning",
    indexed: true,
    check(head) {
      const length = head.meta.description?.length ?? 0
      if (length > LIMITS.description) {
        return `The description has ${length} characters. Search results show about ${LIMITS.description}.`
      }
    },
  },
  {
    id: "description-short",
    field: "description",
    level: "info",
    indexed: true,
    check(head) {
      const length = head.meta.description?.length ?? 0
      if (length > 0 && length < LIMITS.shortDescription) {
        return `The description has ${length} characters. Use ${LIMITS.shortDescription} to ${LIMITS.description} characters.`
      }
    },
  },
  {
    id: "description-duplicate",
    field: "description",
    level: "warning",
    indexed: true,
    check(head) {
      const tags = head.metaCount.description ?? 0
      if (tags > 1) return `The page has ${tags} description tags. Search engines use only one.`
    },
  },
  {
    id: "canonical-missing",
    field: "canonical",
    level: "warning",
    indexed: true,
    check(head) {
      if (!findLink(head, "canonical")) return "The page has no canonical URL."
    },
  },
  {
    id: "canonical-duplicate",
    field: "canonical",
    level: "error",
    indexed: true,
    check(head) {
      const links = findLinks(head, "canonical").length
      if (links > 1) return `The page has ${links} canonical links. Keep only one.`
    },
  },
  {
    id: "canonical-relative",
    field: "canonical",
    level: "warning",
    indexed: true,
    check(head) {
      const canonical = findLink(head, "canonical")
      if (canonical && !isAbsolute(canonical)) {
        return "The canonical URL is not absolute. Set `site` in the Astro config."
      }
    },
  },

  // Social sites

  {
    id: "og-title-missing",
    field: "og:title",
    level: "warning",
    indexed: true,
    check(head) {
      if (!head.meta["og:title"])
        return "The page has no `og:title`. Social sites use the `<title>`."
    },
  },
  {
    id: "og-description-missing",
    field: "og:description",
    level: "warning",
    indexed: true,
    check(head) {
      if (!head.meta["og:description"]) {
        return "The page has no `og:description`. Some social cards show no description."
      }
    },
  },
  {
    id: "og-url-mismatch",
    field: "og:url",
    level: "warning",
    indexed: true,
    check(head) {
      const url = head.meta["og:url"]
      const canonical = findLink(head, "canonical")
      if (url && canonical && url !== canonical) {
        return "The `og:url` is not the same as the canonical URL. Social sites can count the shares two times."
      }
    },
  },
  {
    id: "og-locale-mismatch",
    field: "og:locale",
    level: "warning",
    indexed: true,
    check(head) {
      const locale = head.meta["og:locale"]
      if (!locale || !head.lang) return
      if (language(locale) !== language(head.lang)) {
        return `The \`og:locale\` \`${locale}\` is not the language of the \`lang\` attribute \`${head.lang}\`.`
      }
    },
  },
  {
    id: "og-image-missing",
    field: "og:image",
    level: "warning",
    indexed: true,
    check(head) {
      if (!head.meta["og:image"]) return "The page has no `og:image`. Social cards show no image."
    },
  },
  {
    id: "og-image-relative",
    field: "og:image",
    level: "warning",
    indexed: true,
    check(head) {
      const image = head.meta["og:image"]
      if (image && !isAbsolute(image)) {
        return "The `og:image` URL is not absolute. Social sites can not load it."
      }
    },
  },
  {
    id: "og-image-http",
    field: "og:image",
    level: "warning",
    indexed: true,
    check(head) {
      if (/^http:\/\//i.test(head.meta["og:image"] ?? "")) {
        return "The `og:image` URL uses `http`. Some sites, e.g. WhatsApp, load only `https` images."
      }
    },
  },
  {
    id: "og-image-size-missing",
    field: "og:image",
    level: "warning",
    indexed: true,
    check(head) {
      if (head.meta["og:image"] && !imageSize(head)) {
        return "The `og:image` has no width and height. The first share can show no image."
      }
    },
  },
  {
    id: "og-image-too-small",
    field: "og:image",
    level: "error",
    indexed: true,
    check(head) {
      const size = imageSize(head)
      if (size && (size.width < IMAGE.minimum || size.height < IMAGE.minimum)) {
        return `The \`og:image\` is ${size.width} × ${size.height} px. Facebook does not show images smaller than ${IMAGE.minimum} × ${IMAGE.minimum} px.`
      }
    },
  },
  {
    id: "og-image-small",
    field: "og:image",
    level: "warning",
    indexed: true,
    check(head) {
      const size = imageSize(head)
      if (!size || size.width < IMAGE.minimum || size.height < IMAGE.minimum) return
      if (size.width < IMAGE.small.width || size.height < IMAGE.small.height) {
        return `The \`og:image\` is ${size.width} × ${size.height} px. Social sites show it small. Use ${IMAGE.large.width} × ${IMAGE.large.height} px.`
      }
    },
  },
  {
    id: "og-image-ratio",
    field: "og:image",
    level: "warning",
    indexed: true,
    check(head) {
      const size = imageSize(head)
      // A small card can use a square image, and a too small image has its own error
      if (!size || head.meta["twitter:card"] === "summary") return
      if (size.width < IMAGE.minimum || size.height < IMAGE.minimum) return

      const ratio = size.width / size.height
      if (ratio < IMAGE.ratio.min || ratio > IMAGE.ratio.max) {
        return `The \`og:image\` ratio is ${ratio.toFixed(2)}:1. Social sites crop it to about 1.91:1.`
      }
    },
  },
  {
    id: "og-image-alt-missing",
    field: "og:image:alt",
    level: "info",
    indexed: true,
    check(head) {
      if (head.meta["og:image"] && !head.meta["og:image:alt"]) {
        return "The `og:image` has no `og:image:alt`. Screen readers can not describe the image."
      }
    },
  },
  {
    id: "twitter-card-missing",
    field: "twitter:card",
    level: "warning",
    indexed: true,
    check(head) {
      if (!head.meta["twitter:card"])
        return "The page has no `twitter:card`. Twitter (X) shows no card."
    },
  },
  {
    id: "twitter-card-invalid",
    field: "twitter:card",
    level: "error",
    indexed: true,
    check(head) {
      const card = head.meta["twitter:card"]
      if (card && !TWITTER_CARDS.includes(card)) {
        return `The \`twitter:card\` value \`${card}\` is not valid. Use \`summary\` or \`summary_large_image\`.`
      }
    },
  },

  // Locales

  {
    id: "hreflang-x-default",
    field: "hreflang",
    level: "warning",
    indexed: true,
    check(head) {
      const links = hreflangLinks(head)
      const fallback = links.some((link) => {
        return link.hreflang.toLowerCase() === "x-default"
      })
      if (links.length > 0 && !fallback) {
        return "The hreflang links have no `x-default`. Add it for the users of other locales."
      }
    },
  },
  {
    id: "hreflang-self",
    field: "hreflang",
    level: "warning",
    indexed: true,
    check(head) {
      const links = hreflangLinks(head)
      const canonical = findLink(head, "canonical")
      const self = links.some((link) => {
        return link.href === canonical
      })
      if (links.length > 0 && canonical && !self) {
        return "The hreflang links do not include this page. Each locale version must also link to itself."
      }
    },
  },
  {
    id: "hreflang-relative",
    field: "hreflang",
    level: "warning",
    indexed: true,
    check(head) {
      const relative = hreflangLinks(head).some((link) => {
        return !isAbsolute(link.href ?? "")
      })
      if (relative) return "An hreflang URL is not absolute. Search engines need absolute URLs."
    },
  },
  {
    id: "hreflang-duplicate",
    field: "hreflang",
    level: "warning",
    indexed: true,
    check(head) {
      const locales = hreflangLinks(head).map((link) => {
        return link.hreflang.toLowerCase()
      })
      const duplicate = locales.find((locale, index) => {
        return locales.indexOf(locale) !== index
      })
      if (duplicate) {
        return `The hreflang \`${duplicate}\` is on more than one link. Keep one link for each locale.`
      }
    },
  },
]

/**
 * Returns the pages that search engines index: the pages without `noindex`.
 *
 * @param {import("./rules").SitePage[]} pages
 * @returns {import("./rules").SitePage[]}
 */
function indexedPages(pages) {
  return pages.filter((page) => {
    return !/noindex/i.test(page.head.meta.robots ?? "")
  })
}

/**
 * Returns true for a page with an hreflang link to the canonical URL of another page.
 *
 * @param {import("./rules").SitePage} page
 * @param {import("./rules").SitePage} other
 * @returns {boolean}
 */
function linksTo(page, other) {
  const url = findLink(other.head, "canonical")
  if (!url) return false
  return hreflangLinks(page.head).some((link) => {
    return link.href === url
  })
}

/**
 * Returns true for two pages that are versions of one page in other locales:
 * one of the pages has an hreflang link to the other.
 *
 * @param {import("./rules").SitePage} a
 * @param {import("./rules").SitePage} b
 * @returns {boolean}
 */
function isLocaleVersion(a, b) {
  return linksTo(a, b) || linksTo(b, a)
}

/**
 * Returns a problem for each page with a value that other pages also have.
 * The versions of a page in other locales can have the same value, e.g. the name of
 * an artwork in its title, so they do not count.
 *
 * @param {import("./rules").SitePage[]} pages
 * @param {(page: import("./rules").SitePage) => string | undefined} valueOf
 * @param {string} name - The name of the value in the message, e.g. "title".
 * @returns {import("./rules").SiteProblem[]}
 */
function duplicates(pages, valueOf, name) {
  /** @type {Map<string, import("./rules").SitePage[]>} */
  const groups = new Map()
  for (const page of indexedPages(pages)) {
    const value = valueOf(page)
    if (value) groups.set(value, [...(groups.get(value) ?? []), page])
  }

  return [...groups.values()].flatMap((group) => {
    return group.flatMap((page) => {
      const others = group.filter((other) => {
        return other !== page && !isLocaleVersion(page, other)
      })
      if (others.length === 0) return []

      const list =
        others.length === 1
          ? others[0].path
          : `${others[0].path} and ${count(others.length - 1, "other page")}`
      return [{ path: page.path, message: `The ${name} is the same as on ${list}.` }]
    })
  })
}

/**
 * The rules that compare the pages of the site. Only the build runs them, because the
 * dev toolbar app sees one page at a time. A check returns the problems of the pages.
 *
 * @type {import("./rules").SiteRule[]}
 */
export const SITE_RULES = [
  {
    id: "title-not-unique",
    field: "title",
    level: "warning",
    check(pages) {
      return duplicates(
        pages,
        (page) => {
          return page.head.titles[0]
        },
        "title"
      )
    },
  },
  {
    id: "description-not-unique",
    field: "description",
    level: "warning",
    check(pages) {
      return duplicates(
        pages,
        (page) => {
          return page.head.meta.description
        },
        "description"
      )
    },
  },
  {
    id: "hreflang-no-return",
    field: "hreflang",
    level: "warning",
    check(pages) {
      // The pages by their canonical URL
      const byUrl = new Map()
      for (const page of pages) {
        const canonical = findLink(page.head, "canonical")
        if (canonical) byUrl.set(canonical, page)
      }

      return pages.flatMap((page) => {
        const canonical = findLink(page.head, "canonical")
        if (!canonical) return []

        return hreflangLinks(page.head).flatMap((link) => {
          const other = byUrl.get(link.href)
          if (!other || other === page || link.hreflang.toLowerCase() === "x-default") return []

          const back = hreflangLinks(other.head).some((otherLink) => {
            return otherLink.href === canonical
          })
          if (back) return []
          return [
            {
              path: page.path,
              message: `The hreflang page ${other.path} does not link back to this page. Search engines ignore one-way hreflang links.`,
            },
          ]
        })
      })
    },
  },
]

// The image formats that all social sites show
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]

/** WhatsApp shows no image over this file size, in bytes. */
const MAX_IMAGE_BYTES = 600 * 1024

/**
 * The rules that load the files of the page: the `og:image` and the favicons.
 * The build reads the files from the output folder, and the dev toolbar app loads them
 * from the dev server. A check gets the head and the loaded files.
 *
 * @type {import("./rules").AssetRule[]}
 */
export const ASSET_RULES = [
  {
    id: "og-image-not-found",
    field: "og:image",
    level: "error",
    check(head, assets) {
      const image = assets.image
      if (image && !image.ok) {
        const status = image.status ? `: the server answered ${image.status}` : ""
        return `The \`og:image\` does not load${status}.`
      }
    },
  },
  {
    id: "og-image-svg",
    field: "og:image",
    level: "error",
    check(head, assets) {
      if (assets.image?.ok && assets.image.type === "image/svg+xml") {
        return "The `og:image` is an SVG file. Social sites do not show SVG images."
      }
    },
  },
  {
    id: "og-image-format",
    field: "og:image",
    level: "warning",
    check(head, assets) {
      const type = assets.image?.ok ? assets.image.type : undefined
      if (type && type !== "image/svg+xml" && !IMAGE_TYPES.includes(type)) {
        return `The \`og:image\` is a \`${type}\` file. Use JPEG, PNG or WebP: some sites show no other formats.`
      }
    },
  },
  {
    id: "og-image-file-large",
    field: "og:image",
    level: "warning",
    check(head, assets) {
      const bytes = assets.image?.ok ? assets.image.bytes : undefined
      if (bytes && bytes > MAX_IMAGE_BYTES) {
        return `The \`og:image\` file is ${Math.round(bytes / 1024)} KB. WhatsApp shows no image over 600 KB.`
      }
    },
  },
  {
    id: "og-image-size-mismatch",
    field: "og:image",
    level: "warning",
    check(head, assets) {
      const image = assets.image
      const size = imageSize(head)
      if (!image?.ok || !image.width || !image.height || !size) return
      if (image.width !== size.width || image.height !== size.height) {
        return `The \`og:image\` is ${image.width} × ${image.height} px, but \`og:image:width\` and \`og:image:height\` give ${size.width} × ${size.height}.`
      }
    },
  },
  {
    id: "favicon-not-found",
    field: "favicon",
    level: "error",
    check(head, assets) {
      const missing = assets.icons.find((icon) => {
        return !icon.ok
      })
      if (missing) return `The favicon \`${missing.url}\` does not load.`
    },
  },
]
