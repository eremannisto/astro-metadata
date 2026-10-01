/** A favicon file in the `files` option. The format comes from the extension. */
export type FaviconFile = {
  /** The URL of the file, e.g. "/favicon-96.png". Must end in .ico, .png or .svg. */
  path: string
  /** The size in px. Required for a PNG file. */
  size?: number
  /** The sizes of the images in an ICO file. Defaults to [16, 32]. */
  sizes?: number[]
}

/** A favicon file after the checks, with its format and its use. */
export type ResolvedFaviconFile = {
  path: string
  type: "ico" | "png" | "svg"
  /**
   * "icon": an icon link tag. "apple": the Apple link tag.
   * "manifest": the web app manifest (PNG files of 192 px or larger).
   */
  use: "icon" | "apple" | "manifest"
  /** The sizes in px, smallest first. Empty for an SVG file. */
  sizes: number[]
}

export declare function defaultFaviconFiles(svg: boolean): FaviconFile[]

export declare function resolveFaviconFiles(
  files: FaviconFile[],
  svg: boolean
): ResolvedFaviconFile[]
