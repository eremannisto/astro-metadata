import type { AstroIntegration } from "astro"

import type { MetadataConfig } from "./lib/config.ts"
import type { FaviconFile } from "./lib/favicon-files"

export type { FaviconFile, MetadataConfig }

export type FaviconOptions = {
  /**
   * The path of the source image, relative to the project root. An SVG gives the best
   * result. A PNG, WebP or JPEG source must be square and at least 512 px.
   *
   * @example "./src/assets/logo.svg"
   */
  source: string
  /**
   * The background color of the Apple icon. iOS shows transparent pixels as black,
   * so the icon needs a solid color. Defaults to "#ffffff".
   */
  background?: string
  /**
   * The files to generate. This list replaces the default files. The format comes from
   * the extension (.ico, .png or .svg), and the use comes from the name, format and size:
   * `.ico` and `.svg` files get an icon link tag, `apple-touch-icon.png` gets the Apple
   * link tag, other `.png` files smaller than 192 px get an icon link tag, and `.png`
   * files of 192 px or larger go into the web app manifest.
   *
   * @default
   * [
   *   { path: "/favicon.ico", sizes: [16, 32] },
   *   { path: "/favicon.svg" }, // only for an SVG source
   *   { path: "/favicon-16.png", size: 16 },
   *   { path: "/favicon-32.png", size: 32 },
   *   { path: "/apple-touch-icon.png", size: 180 },
   *   { path: "/favicon-192.png", size: 192 },
   *   { path: "/favicon-512.png", size: 512 },
   * ]
   */
  files?: FaviconFile[]
}

/**
 * The options of the integration: the site values, which the props of `<Metadata>`
 * override, and the build features.
 */
export type MetadataOptions = MetadataConfig & {
  /**
   * Generates the favicon files from one source image.
   */
  favicon?: FaviconOptions
  /**
   * Checks the metadata of the built pages and logs the problems, e.g. a missing
   * description or a title that is too long. Defaults to true.
   */
  checks?: boolean
  /**
   * Adds the Metadata app to the Astro dev toolbar. Defaults to true.
   */
  debug?: boolean
}

/**
 * The Astro integration of `@mannisto/astro-metadata`. It gives the site values to the
 * `<Metadata>` component, generates the favicons and the web app manifest, and checks
 * the metadata of the built pages.
 */
export default function metadata(options?: MetadataOptions): AstroIntegration
