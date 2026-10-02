import type { HeadData } from "./head"
import type { PageAssets, SitePage } from "./rules"

export type { HeadData } from "./head"
export { findLink, parseHead } from "./head"
export type { Asset, PageAssets, SitePage } from "./rules"
export { LIMITS } from "./rules"

/** A problem in the metadata of a page. */
export type Check = {
  /** The id of the rule, e.g. "og-title-missing". */
  id: string
  /** The tag of the problem, e.g. "og:title". */
  field: string
  level: "error" | "warning" | "info"
  message: string
}

/**
 * A rule of your own. It runs in the build and in the dev toolbar app, after the
 * rules of the package.
 *
 * @example
 * {
 *   id: "title-brand",
 *   level: "warning",
 *   message: "The title must contain the brand name.",
 *   check(head) {
 *     return !head.titles[0]?.includes("Acme Studio")
 *   },
 * }
 */
export type CustomRule = {
  /** A short, unique name. `rules.ignore` turns the rule off with this id. */
  id: string
  level: "error" | "warning" | "info"
  /** The message of the problem. Text between backticks shows as code in the dev toolbar app. */
  message: string | ((head: HeadData) => string)
  /** Returns true when the page has the problem. */
  check(head: HeadData): boolean | undefined
  /** The tag of the problem, e.g. "og:title". The dev toolbar app opens its row. */
  field?: string
  /** True for a search or sharing rule: it does not run on a noindex page. */
  indexed?: boolean
}

export type CheckOptions = {
  /** The ids of the rules to turn off, e.g. ["description-short"]. */
  ignore?: string[]
  /** Your own rules. */
  custom?: CustomRule[]
}

export declare function validateCustomRules(custom: CustomRule[] | undefined): void

export declare function isIgnored(path: string, patterns: string[] | undefined): boolean

export declare function sortChecks(checks: Check[]): Check[]

export declare function isNoindex(head: HeadData): boolean

export declare function checkHead(head: HeadData, options?: CheckOptions): Check[]

export declare function checkAssets(
  head: HeadData,
  assets: PageAssets,
  options?: CheckOptions
): Check[]

export declare function checkSite(pages: SitePage[], options?: CheckOptions): Map<string, Check[]>
