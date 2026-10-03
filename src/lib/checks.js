// Plain JavaScript: the integration runs in Node, which does not strip types in node_modules.
// The dev toolbar app uses the same functions, so the build and the toolbar give the same results.

import { ASSET_RULES, RULES, SITE_RULES } from "./rules.js"

export { findLink, parseHead } from "./head.js"
export { LIMITS } from "./rules.js"

const ORDER = ["error", "warning", "info"]

const LEVELS = ["error", "warning", "info"]

/**
 * Returns true for a rule that the `rules.ignore` option does not turn off.
 *
 * @param {{ id: string }} rule
 * @param {import("./checks").CheckOptions} options
 * @returns {boolean}
 */
function isOn(rule, options) {
  return !options.ignore?.includes(rule.id)
}

/**
 * Checks the custom rules of the `rules.custom` option.
 *
 * @param {import("./checks").CustomRule[] | undefined} custom
 * @throws {Error} For a rule without an id, a message, a valid level or a check function,
 * and for an id that another rule already has.
 */
export function validateCustomRules(custom) {
  const ids = new Set(
    [...RULES, ...ASSET_RULES, ...SITE_RULES].map((rule) => {
      return rule.id
    })
  )
  for (const rule of custom ?? []) {
    const name = rule?.id ? `The custom rule "${rule.id}"` : "A custom rule"
    if (!rule?.id || typeof rule.id !== "string") throw new Error(`${name} has no \`id\`.`)
    if (ids.has(rule.id)) throw new Error(`${name} has the id of another rule.`)
    if (!LEVELS.includes(rule.level)) {
      throw new Error(`${name} needs a \`level\`: "error", "warning" or "info".`)
    }
    if (typeof rule.message !== "string" && typeof rule.message !== "function") {
      throw new Error(`${name} has no \`message\`.`)
    }
    if (typeof rule.check !== "function") throw new Error(`${name} has no \`check\` function.`)
    ids.add(rule.id)
  }
}

/**
 * Changes a custom rule into a rule of the same form as the rules in `rules.js`.
 *
 * @param {import("./checks").CustomRule} rule
 * @returns {import("./rules").Rule}
 */
function toRule(rule) {
  return {
    id: rule.id,
    field: rule.field ?? "custom",
    level: rule.level,
    indexed: rule.indexed,
    check(head) {
      try {
        if (!rule.check(head)) return undefined
        return typeof rule.message === "function" ? rule.message(head) : rule.message
      } catch (error) {
        // An error in a custom rule shows as its problem, and the other rules still run
        return `The custom rule \`${rule.id}\` failed: ${error instanceof Error ? error.message : error}`
      }
    },
  }
}

/**
 * Returns the checks with the errors first, then the warnings, then the information.
 *
 * @param {import("./checks").Check[]} checks
 * @returns {import("./checks").Check[]}
 */
export function sortChecks(checks) {
  return checks.sort((a, b) => {
    return ORDER.indexOf(a.level) - ORDER.indexOf(b.level)
  })
}

/**
 * Returns true for a page with `noindex`. Such a page gets no search and sharing checks.
 *
 * @param {import("./head").HeadData} head
 * @returns {boolean}
 */
export function isNoindex(head) {
  return /noindex/i.test(head.meta.robots ?? "")
}

/**
 * Returns a path without the slash at the end, e.g. "/blog" for "/blog/". The root stays "/".
 *
 * @param {string} path
 * @returns {string}
 */
function trimSlash(path) {
  return path.length > 1 ? path.replace(/\/+$/, "") : path
}

/**
 * Returns true for a page path that matches a pattern of the `ignore` option.
 * In a pattern, `*` matches one part of the path and `**` matches any number of parts.
 *
 * @example isIgnored("/drafts/hello/", ["/drafts/**"]) // true
 *
 * @param {string} path - The path of the page without the base, e.g. "/drafts/hello/".
 * @param {string[] | undefined} patterns - e.g. ["/404", "/drafts/**"].
 * @returns {boolean}
 */
export function isIgnored(path, patterns) {
  return (patterns ?? []).some((pattern) => {
    const source = trimSlash(pattern)
      .split(/(\*\*|\*)/)
      .map((part) => {
        if (part === "**") return ".*"
        if (part === "*") return "[^/]*"
        return part.replace(/[.+?^${}()|[\]\\]/g, "\\$&")
      })
      .join("")
    return new RegExp(`^${source}$`).test(trimSlash(path))
  })
}

/**
 * Checks the head of a page with the rules in `rules.js`.
 *
 * @param {import("./head").HeadData} head - The metadata from `parseHead`.
 * @param {import("./checks").CheckOptions} [options]
 * @returns {import("./checks").Check[]} The problems, errors first.
 */
export function checkHead(head, options = {}) {
  const noindex = isNoindex(head)

  /** @type {import("./checks").Check[]} */
  const checks = []
  const custom = (options.custom ?? []).map(toRule)
  for (const rule of [...RULES, ...custom]) {
    if ((noindex && rule.indexed) || !isOn(rule, options)) continue

    const message = rule.check(head)
    if (message) checks.push({ id: rule.id, field: rule.field, level: rule.level, message })
  }
  return sortChecks(checks)
}

/**
 * Checks the loaded files of a page: the `og:image` and the favicons.
 *
 * @param {import("./head").HeadData} head
 * @param {import("./rules").PageAssets} assets
 * @param {import("./checks").CheckOptions} [options]
 * @returns {import("./checks").Check[]}
 */
export function checkAssets(head, assets, options = {}) {
  /** @type {import("./checks").Check[]} */
  const checks = []
  for (const rule of ASSET_RULES) {
    if (!isOn(rule, options)) continue

    const message = rule.check(head, assets)
    if (message) checks.push({ id: rule.id, field: rule.field, level: rule.level, message })
  }
  return sortChecks(checks)
}

/**
 * Compares the pages of the site, e.g. two pages with the same title.
 *
 * @param {import("./rules").SitePage[]} pages
 * @param {import("./checks").CheckOptions} [options]
 * @returns {Map<string, import("./checks").Check[]>} The problems of each page path.
 */
export function checkSite(pages, options = {}) {
  /** @type {Map<string, import("./checks").Check[]>} */
  const result = new Map()
  for (const rule of SITE_RULES) {
    if (!isOn(rule, options)) continue

    for (const problem of rule.check(pages)) {
      const check = { id: rule.id, field: rule.field, level: rule.level, message: problem.message }
      result.set(problem.path, [...(result.get(problem.path) ?? []), check])
    }
  }
  return result
}
