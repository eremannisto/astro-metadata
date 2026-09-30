// Plain JavaScript: the integration runs in Node, which does not strip types in node_modules.
// The dev toolbar app uses the same functions, so the build and the toolbar give the same results.

/** The approximate lengths that search results show. */
export const LIMITS = {
  title: 60,
  description: 160,
}

const ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
}

// A tag with its attributes. Quoted values can contain ">".
const TAG = /<(meta|link)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi
const ATTRIBUTE = /([^\s=/>"']+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g
const SCRIPT = /<script\b((?:[^>"']|"[^"]*"|'[^']*')*)>([\s\S]*?)<\/script>/gi

/**
 * Replaces the HTML entities in a text with their characters.
 *
 * @param {string} text
 * @returns {string}
 */
function decode(text) {
  return text.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match, code) => {
    if (code[0] !== "#") return ENTITIES[code.toLowerCase()] ?? match

    const hex = code[1].toLowerCase() === "x"
    const point = hex ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10)
    return point <= 0x10ffff ? String.fromCodePoint(point) : match
  })
}

/**
 * Returns the attributes of a tag. The names are in lowercase, the values are decoded.
 *
 * @param {string} source - The text between the tag name and ">".
 * @returns {Record<string, string>}
 */
function parseAttributes(source) {
  /** @type {Record<string, string>} */
  const attributes = {}
  for (const match of source.matchAll(ATTRIBUTE)) {
    const value = match[2] ?? match[3] ?? match[4] ?? ""
    attributes[match[1].toLowerCase()] = decode(value)
  }
  return attributes
}

/**
 * Reads the metadata of a page from its HTML.
 *
 * @param {string} html - The HTML of the page.
 * @returns {import("./checks").HeadData}
 */
export function parseHead(html) {
  const end = html.search(/<\/head>/i)
  const head = end === -1 ? html : html.slice(0, end)

  /** @type {Record<string, string>} */
  const meta = {}
  /** @type {Record<string, string>[]} */
  const links = []
  for (const match of head.matchAll(TAG)) {
    const attributes = parseAttributes(match[2])
    if (match[1].toLowerCase() === "link") {
      links.push(attributes)
      continue
    }

    // Keep the first value, as crawlers do
    const key = (attributes.name ?? attributes.property ?? attributes["http-equiv"])?.toLowerCase()
    if (key && attributes.content !== undefined && !(key in meta)) {
      meta[key] = attributes.content
    }
  }

  const titles = [...head.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)].map((match) => {
    return decode(match[1]).trim()
  })

  // JSON-LD can also be in the body
  const schemas = [...html.matchAll(SCRIPT)]
    .filter((match) => {
      return /application\/ld\+json/i.test(parseAttributes(match[1]).type ?? "")
    })
    .map((match) => {
      return match[2]
    })

  const lang = /<html\b(?:[^>"']|"[^"]*"|'[^']*')*>/i.exec(html)
  return {
    lang: lang ? parseAttributes(lang[0].slice(5, -1)).lang : undefined,
    titles,
    meta,
    links,
    schemas,
  }
}

/**
 * Returns the `href` of the first link with a `rel` value.
 *
 * @param {import("./checks").HeadData} head
 * @param {string} rel - e.g. "canonical".
 * @returns {string | undefined}
 */
export function findLink(head, rel) {
  const link = head.links.find((attributes) => {
    return (attributes.rel ?? "").toLowerCase().split(/\s+/).includes(rel)
  })
  return link?.href
}

/**
 * Returns true for a URL with "http:" or "https:".
 *
 * @param {string} value
 * @returns {boolean}
 */
function isAbsolute(value) {
  return /^https?:\/\//i.test(value)
}

/**
 * Checks the metadata of a page. A page with `noindex` gets no search and sharing checks.
 *
 * @param {import("./checks").HeadData} head - The metadata from `parseHead`.
 * @returns {import("./checks").Check[]} The problems, errors first.
 */
export function checkHead(head) {
  /** @type {import("./checks").Check[]} */
  const checks = []

  /**
   * @param {import("./checks").Check["level"]} level
   * @param {string} message
   */
  function add(level, message) {
    checks.push({ level, message })
  }

  const title = head.titles[0]
  if (title === undefined || title === "") {
    add("error", "The page has no title.")
  } else if (head.titles.length > 1) {
    add("error", `The page has ${head.titles.length} title tags. Keep only one.`)
  } else if (title.length > LIMITS.title) {
    add(
      "warning",
      `The title has ${title.length} characters. Search results show about ${LIMITS.title}.`
    )
  }

  for (const schema of head.schemas) {
    try {
      JSON.parse(schema)
    } catch {
      add("error", "A JSON-LD script does not contain valid JSON.")
    }
  }

  if (!head.lang) {
    add("warning", "The html tag has no lang attribute.")
  }

  if (/noindex/i.test(head.meta.robots ?? "")) {
    add("info", "The robots tag contains noindex: search engines do not show the page.")
    return sortChecks(checks)
  }

  const description = head.meta.description
  if (!description) {
    add("warning", "The page has no description.")
  } else if (description.length > LIMITS.description) {
    add(
      "warning",
      `The description has ${description.length} characters. Search results show about ${LIMITS.description}.`
    )
  }

  const canonical = findLink(head, "canonical")
  if (!canonical) {
    add("warning", "The page has no canonical URL.")
  } else if (!isAbsolute(canonical)) {
    add("warning", "The canonical URL is not absolute. Set `site` in the Astro config.")
  }

  const image = head.meta["og:image"]
  if (!image) {
    add("warning", "The page has no og:image. Social cards show no image.")
  } else if (!isAbsolute(image)) {
    add("warning", "The og:image URL is not absolute. Social sites can not load it.")
  } else if (!head.meta["og:image:width"] || !head.meta["og:image:height"]) {
    add("warning", "The og:image has no width and height. The first share can show no image.")
  }

  return sortChecks(checks)
}

/**
 * Sorts the checks: errors first, then warnings, then information.
 *
 * @param {import("./checks").Check[]} checks
 * @returns {import("./checks").Check[]}
 */
function sortChecks(checks) {
  const order = ["error", "warning", "info"]
  return checks.sort((a, b) => {
    return order.indexOf(a.level) - order.indexOf(b.level)
  })
}
