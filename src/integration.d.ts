import type { AstroIntegration } from "astro"

export type FaviconOptions = {
  /**
   * The path of the source image, relative to the project root. An SVG gives the best
   * result. A PNG, WebP or JPEG source must be square and at least 512 px.
   *
   * @example "./src/assets/logo.svg"
   */
  source: string
  /**
   * The background color of the Apple and maskable icons. Defaults to "#ffffff".
   */
  background?: string
}

export type MetadataOptions = {
  /**
   * The path of the config file, relative to the project root.
   * Defaults to `src/metadata.config.ts`, `.js` or `.mjs`.
   */
  config?: string
  /**
   * Generates the favicon files from one source image.
   */
  favicon?: FaviconOptions
  /**
   * Checks the metadata of the built pages and logs the problems, e.g. a missing
   * description or a title that is too long. Defaults to true.
   */
  checks?: boolean
}

/**
 * The Astro integration of `@mannisto/astro-metadata`. It loads the site-wide defaults
 * from `src/metadata.config.ts` and gives them to the components.
 */
export default function metadata(options?: MetadataOptions): AstroIntegration
