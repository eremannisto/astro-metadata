import type { AstroIntegration } from "astro"

import type { CheckOptions, CustomRule, HeadData } from "./lib/checks"
import type { MetadataConfig } from "./lib/config.ts"
import type { FaviconFile } from "./lib/favicon-files"

export type { FaviconFile, HeadData, MetadataConfig }

/** A check rule of your own, for the `rules.custom` option. */
export type MetadataRule = CustomRule

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
   * The debug features: the Metadata app in the Astro dev toolbar (`client`), and the
   * checks of the built pages in the build log (`build`). Set to false to turn off both.
   *
   * @default true
   * @example { client: true, build: false }
   */
  debug?: boolean | { client?: boolean; build?: boolean }
  /**
   * The pages to check.
   */
  pages?: {
    /**
     * The pages without checks, as path patterns without the base. `*` matches one part
     * of the path, and `**` matches any number of parts. The dev toolbar app shows the
     * other values of these pages, without problems.
     *
     * @example ["/404", "/drafts/**"]
     */
    ignore?: string[]
  }
  /**
   * The check rules: turn off rules of the package, and add your own rules.
   * The rules run in the dev toolbar app and in the build.
   */
  rules?: {
    /**
     * The ids of the rules to turn off. The ids are in `src/lib/rules.js`.
     *
     * @example ["description-short", "og-image-alt-missing"]
     */
    ignore?: string[]
    /** Your own rules. */
    custom?: MetadataRule[]
  }
}

/** The values that the build checks need. */
export type BuildContext = {
  /** The output directory of the build. */
  dir: string
  root?: URL
  site?: string
  base: string
  /** The path patterns of the pages without checks. */
  pages?: string[]
  /** The rules to turn off, and the custom rules. */
  checks: CheckOptions
  /** sharp, for the size of the images. Without sharp, the checks skip the size. */
  sharp?: (file: string) => { metadata(): Promise<{ width?: number; height?: number }> }
}

/**
 * The Astro integration of `@mannisto/astro-metadata`. It gives the site values to the
 * `<Metadata>` component, generates the favicons and the web app manifest, and checks
 * the metadata of the built pages.
 */
export default function metadata(options?: MetadataOptions): AstroIntegration
