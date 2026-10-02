// Plain JavaScript: the integration runs in Node, which does not strip types in node_modules.
// The dev toolbar app uses the same functions, so the build and the toolbar give the same results.

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
 * @returns {import("./head").HeadData}
 */
export function parseHead(html) {
  const end = html.search(/<\/head>/i)
  const head = end === -1 ? html : html.slice(0, end)

  /** @type {Record<string, string>} */
  const meta = {}
  /** @type {Record<string, number>} */
  const metaCount = {}
  /** @type {Record<string, string>[]} */
  const links = []
  let charset

  for (const match of head.matchAll(TAG)) {
    const attributes = parseAttributes(match[2])
    if (match[1].toLowerCase() === "link") {
      links.push(attributes)
      continue
    }
    if (attributes.charset !== undefined) charset = attributes.charset

    const key = (attributes.name ?? attributes.property ?? attributes["http-equiv"])?.toLowerCase()
    if (!key || attributes.content === undefined) continue

    metaCount[key] = (metaCount[key] ?? 0) + 1
    // Keep the first value, as crawlers do
    if (!(key in meta)) meta[key] = attributes.content
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
    charset,
    titles,
    meta,
    metaCount,
    links,
    schemas,
  }
}

/**
 * Returns the link tags with a `rel` value, e.g. all "alternate" links.
 *
 * @param {import("./head").HeadData} head
 * @param {string} rel - e.g. "canonical".
 * @returns {Record<string, string>[]}
 */
export function findLinks(head, rel) {
  return head.links.filter((attributes) => {
    return (attributes.rel ?? "").toLowerCase().split(/\s+/).includes(rel)
  })
}

/**
 * Returns the `href` of the first link with a `rel` value.
 *
 * @param {import("./head").HeadData} head
 * @param {string} rel - e.g. "canonical".
 * @returns {string | undefined}
 */
export function findLink(head, rel) {
  return findLinks(head, rel)[0]?.href
}

/**
 * Returns true for a URL with "http:" or "https:".
 *
 * @param {string} value
 * @returns {boolean}
 */
export function isAbsolute(value) {
  return /^https?:\/\//i.test(value)
}
