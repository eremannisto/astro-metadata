import type { HeadData } from "./head"

type RuleBase = {
  /** A short, unique name, e.g. "og-title-missing". The `rules` option turns a rule off by its id. */
  id: string
  /**
   * The tag of the problem, e.g. "og:title", "title", "hreflang" or "json-ld".
   * The dev toolbar app opens the row of this tag.
   */
  field: string
  level: "error" | "warning" | "info"
}

/** A rule that checks the head of one page. */
export type Rule = RuleBase & {
  /** True for a search or sharing rule: it does not run on a noindex page. */
  indexed?: boolean
  /** Returns the message of a problem, or undefined. Text between backticks shows as code. */
  check(head: HeadData): string | undefined
}

/** A built page: its path in the output folder, and its head. */
export type SitePage = {
  path: string
  head: HeadData
}

/** A problem of one page, found by a site rule. */
export type SiteProblem = {
  path: string
  message: string
}

/** A rule that compares the pages of the site. Only the build runs it. */
export type SiteRule = RuleBase & {
  check(pages: SitePage[]): SiteProblem[]
}

/** A loaded file of the page. */
export type Asset = {
  /** The URL or path of the file. */
  url: string
  /** False when the file does not load. */
  ok: boolean
  /** The HTTP status of a file that does not load. */
  status?: number
  /** The MIME type, e.g. "image/png". */
  type?: string
  /** The file size in bytes. */
  bytes?: number
  /** The real size of an image, in px. */
  width?: number
  height?: number
}

/** The loaded files of a page. A file that can not be checked, e.g. on another site, is not in the list. */
export type PageAssets = {
  image?: Asset
  icons: Asset[]
}

/** A rule that checks the files of the page. */
export type AssetRule = RuleBase & {
  check(head: HeadData, assets: PageAssets): string | undefined
}

export declare const LIMITS: { title: number; description: number; shortDescription: number }

export declare const RULES: Rule[]

export declare const SITE_RULES: SiteRule[]

export declare const ASSET_RULES: AssetRule[]
