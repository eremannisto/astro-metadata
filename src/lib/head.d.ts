/** The metadata of a page, read from its HTML. */
export type HeadData = {
  /** The `lang` attribute of the html tag. */
  lang?: string
  /** The value of `<meta charset>`. */
  charset?: string
  /** The texts of all title tags. */
  titles: string[]
  /** The first `content` of each meta `name`, `property` or `http-equiv`, in lowercase. */
  meta: Record<string, string>
  /** The number of meta tags with each `name`, `property` or `http-equiv`. */
  metaCount: Record<string, number>
  /** The attributes of each link tag. */
  links: Record<string, string>[]
  /** The texts of the JSON-LD scripts. */
  schemas: string[]
}

export declare function parseHead(html: string): HeadData

export declare function findLinks(head: HeadData, rel: string): Record<string, string>[]

export declare function findLink(head: HeadData, rel: string): string | undefined

export declare function isAbsolute(value: string): boolean
