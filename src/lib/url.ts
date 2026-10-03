import { getConfig } from "./config.ts"

/**
 * Returns true for a URL with a scheme ("https:", "data:") or a protocol-relative URL ("//").
 */
function isAbsolute(value: string): boolean {
  return /^[a-z][a-z\d+.-]*:/i.test(value) || value.startsWith("//")
}

/**
 * Adds the Astro `base` to a path: "/og.jpg" becomes "/docs/og.jpg".
 * A path that already starts with the base stays unchanged.
 *
 * @param path - A path in the site, e.g. "/og.jpg".
 * @returns The path with the base.
 */
export function withBase(path: string): string {
  if (isAbsolute(path)) return path

  const base = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "")
  const clean = path.startsWith("/") ? path : `/${path}`
  if (!base || clean === base || clean.startsWith(`${base}/`)) return clean
  return `${base}${clean}`
}

/**
 * Returns the absolute URL of a path in the site, with the Astro `site` and `base`:
 * "/og.jpg" becomes "https://example.com/docs/og.jpg". Absolute URLs stay unchanged.
 * Without `site` in the Astro config, the result is the path with the base.
 *
 * @param path - A path in the site, e.g. "/og.jpg".
 * @returns The absolute URL.
 */
export function url(path: string): string {
  if (isAbsolute(path)) return path

  const site = import.meta.env.SITE
  const pathname = withBase(path)
  return site ? new URL(pathname, site).href : pathname
}

/**
 * Adds or removes the slash at the end of a page path, the same as Astro:
 * - `trailingSlash: "always"` adds the slash, and `"never"` removes it.
 * - With `"ignore"`, `build.format` decides: "directory" adds the slash, and "file" removes it.
 *   With "preserve", the path stays unchanged.
 * Paths with a file extension, a query or a hash stay unchanged.
 * Without the integration, the path stays unchanged.
 *
 * @param path - A page path, e.g. "/blog".
 * @returns The path with or without the slash at the end.
 */
export function pagePath(path: string): string {
  const { trailingSlash, buildFormat } = getConfig()
  if (!trailingSlash || path === "/" || /[?#]/.test(path)) return path

  const last = path.split("/").pop() ?? ""
  if (last.includes(".")) return path

  let slash = trailingSlash === "always"
  if (trailingSlash === "ignore") {
    if (buildFormat === "preserve") return path
    slash = buildFormat !== "file"
  }
  const clean = path.replace(/\/+$/, "")
  return slash ? `${clean}/` : clean || "/"
}

/**
 * Returns the absolute URL of a page, with the slash at the end that Astro uses.
 * Absolute URLs stay unchanged.
 *
 * @param path - A page path, e.g. "/blog".
 * @returns The absolute URL, e.g. "https://example.com/blog/".
 */
export function pageUrl(path: string): string {
  if (isAbsolute(path)) return path
  return url(pagePath(path))
}
