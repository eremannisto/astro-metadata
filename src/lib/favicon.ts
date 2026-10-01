import { getConfig } from "./config.ts"
import type { ResolvedFaviconFile } from "./favicon-files.js"
import { withBase } from "./url.ts"

/**
 * The favicon data that the integration gives to the components and the endpoints.
 */
export type FaviconInfo = {
  /** The absolute path of the source file. */
  source: string
  /** The background color of the Apple icon. */
  background: string
  /** True for an SVG source. Only an SVG source can give an SVG file. */
  svg: boolean
  /** A short hash of the source file, for cache busting. */
  hash: string
  /** The absolute path of the sharp package. */
  sharp: string
  /** The files to generate, with their formats and uses. */
  files: ResolvedFaviconFile[]
}

/**
 * The favicon config: the `favicon` option after the checks.
 */
export type FaviconConfig = Omit<FaviconInfo, "sharp">

/**
 * An icon entry for the `icons` field of a web app manifest.
 */
export type ManifestIcon = {
  src: string
  sizes: string
  type: string
}

/**
 * A link tag of a generated favicon file.
 */
export type FaviconLink = {
  rel: "icon" | "apple-touch-icon"
  href: string
  type?: string
  sizes?: string
}

// The order of the link tags: ICO first, then the PNG files, the SVG and the Apple icon
const LINK_ORDER = { ico: 0, png: 1, svg: 2 }

const MIME_TYPES = {
  ico: "image/x-icon",
  png: "image/png",
  svg: "image/svg+xml",
}

/**
 * Returns the size of a file for its link tag: the largest image of an ICO file,
 * or undefined for an SVG file.
 */
function largestSize(file: ResolvedFaviconFile): number | undefined {
  return file.sizes.length > 0 ? Math.max(...file.sizes) : undefined
}

/**
 * The favicons that the `favicon` option of the integration generates.
 * Without the option, the lists are empty and `config` is undefined.
 */
export const Favicon = {
  /**
   * Returns the favicon config: the source, the background color and the files.
   */
  get config(): FaviconConfig | undefined {
    const favicon = getConfig().favicon
    if (!favicon) return undefined

    return {
      source: favicon.source,
      background: favicon.background,
      svg: favicon.svg,
      hash: favicon.hash,
      files: favicon.files,
    }
  },

  /**
   * Returns the generated files, with their formats, sizes and uses.
   */
  get files(): ResolvedFaviconFile[] {
    return getConfig().favicon?.files ?? []
  },

  /**
   * Returns the URL of a generated file, with the base and a hash of the source.
   * The hash changes when the source changes, so browsers load the new icon.
   *
   * @example Favicon.url("/favicon.ico") // "/favicon.ico?v=3f2a1c9e"
   */
  url(path: string): string {
    const hash = getConfig().favicon?.hash
    return hash ? `${withBase(path)}?v=${hash}` : withBase(path)
  },

  /**
   * Returns the link tags of the generated files, in the recommended order:
   * the ICO file, the PNG files, the SVG file and the Apple icon.
   */
  links(): FaviconLink[] {
    const order = (file: ResolvedFaviconFile) => {
      return file.use === "apple" ? 3 : LINK_ORDER[file.type]
    }
    const files = Favicon.files
      .filter((file) => {
        return file.use !== "manifest"
      })
      .sort((a, b) => {
        return order(a) - order(b) || (a.sizes[0] ?? 0) - (b.sizes[0] ?? 0)
      })

    return files.map((file) => {
      const size = largestSize(file)
      if (file.use === "apple") {
        return {
          rel: "apple-touch-icon",
          href: Favicon.url(file.path),
          sizes: `${size}x${size}`,
        }
      }
      return {
        rel: "icon",
        href: Favicon.url(file.path),
        type: MIME_TYPES[file.type],
        sizes: size ? `${size}x${size}` : undefined,
      }
    })
  },

  /**
   * Returns the icons for the `icons` field of a web app manifest: the PNG files
   * of 192 px or larger.
   *
   * @example
   * // src/pages/manifest.webmanifest.ts
   * export const GET = () => Response.json({ name: "My Site", icons: Favicon.icons() })
   */
  icons(): ManifestIcon[] {
    return Favicon.files
      .filter((file) => {
        return file.use === "manifest"
      })
      .map((file) => {
        const size = file.sizes[0]
        return { src: Favicon.url(file.path), sizes: `${size}x${size}`, type: "image/png" }
      })
  },

  /**
   * Generates a favicon file of the config. Returns a 404 response for a path that
   * is not in the config.
   *
   * @param path - The path of the file, e.g. "/favicon-32.png".
   */
  async generate(path: string): Promise<Response> {
    // Loaded only here: the image code needs Node and sharp
    const { renderFavicon } = await import("./favicon-image.ts")
    return renderFavicon(path)
  },
}
