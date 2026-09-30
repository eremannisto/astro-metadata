import { withBase } from "./url.ts"

/**
 * The favicon data that the integration gives to all code with Vite's `define`.
 */
export type FaviconInfo = {
  /** The absolute path of the source file. */
  source: string
  /** The background color of the Apple and maskable icons. */
  background: string
  /** True for an SVG source. Only an SVG source gives `icon.svg`. */
  svg: boolean
  /** A short hash of the source file, for cache busting. */
  hash: string
  /** The absolute path of the sharp package, found from this package. */
  sharp: string
}

/**
 * An icon entry for the `icons` field of a web app manifest.
 */
export type ManifestIcon = {
  src: string
  sizes: string
  type: string
  purpose?: "maskable"
}

declare const __ASTRO_METADATA_FAVICON__: FaviconInfo | undefined

/**
 * Returns the favicon data, or undefined without the `favicon` option of the integration.
 */
export function getFavicon(): FaviconInfo | undefined {
  return typeof __ASTRO_METADATA_FAVICON__ === "undefined" ? undefined : __ASTRO_METADATA_FAVICON__
}

/**
 * Returns the URL of a generated favicon file, with the base and the hash.
 *
 * @param file - The file name, e.g. "favicon.ico".
 * @param favicon - The favicon data.
 * @returns The URL, e.g. "/favicon.ico?v=3f2a1c9e".
 */
export function faviconUrl(file: string, favicon: FaviconInfo): string {
  return `${withBase(`/${file}`)}?v=${favicon.hash}`
}

/**
 * Returns the generated icons for the `icons` field of your own web app manifest.
 * Returns an empty list without the `favicon` option of the integration.
 *
 * @example
 * // src/pages/manifest.webmanifest.ts
 * export const GET = () => Response.json({ name: "My Site", icons: icons() })
 *
 * @returns The manifest icons: 192 px, 512 px and a 512 px maskable icon.
 */
export function icons(): ManifestIcon[] {
  const favicon = getFavicon()
  if (!favicon) return []

  return [
    { src: faviconUrl("icon-192.png", favicon), sizes: "192x192", type: "image/png" },
    { src: faviconUrl("icon-512.png", favicon), sizes: "512x512", type: "image/png" },
    {
      src: faviconUrl("icon-maskable.png", favicon),
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ]
}
