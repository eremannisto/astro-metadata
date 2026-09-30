/** The metadata of a page, read from its HTML. */
export type HeadData = {
  /** The `lang` attribute of the html tag. */
  lang?: string
  /** The texts of all title tags. */
  titles: string[]
  /** The first `content` of each meta `name`, `property` or `http-equiv`, in lowercase. */
  meta: Record<string, string>
  /** The attributes of each link tag. */
  links: Record<string, string>[]
  /** The texts of the JSON-LD scripts. */
  schemas: string[]
}

/** A problem in the metadata of a page. */
export type Check = {
  level: "error" | "warning" | "info"
  message: string
}

export declare const LIMITS: { title: number; description: number }

export declare function parseHead(html: string): HeadData

export declare function findLink(head: HeadData, rel: string): string | undefined

export declare function checkHead(head: HeadData): Check[]
