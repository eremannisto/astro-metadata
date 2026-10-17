import type { Asset, HeadData, PageAssets } from "../lib/checks.js"
import { getConfig } from "../lib/config.ts"

/**
 * Returns the URL to load a file from, or undefined for a file on another site.
 * A file of the site loads from the dev server, because the `site` URL is the
 * production site, where a new file does not exist yet.
 */
function devUrl(url: string): URL | undefined {
  let parsed: URL
  try {
    parsed = new URL(url, location.href)
  } catch {
    return undefined
  }
  if (parsed.origin === location.origin) return parsed

  const site = getConfig().site
  if (!site || parsed.origin !== new URL(site).origin) return undefined
  return new URL(`${parsed.pathname}${parsed.search}`, location.origin)
}

/**
 * Returns the real size of an image, or undefined for a format that the browser
 * can not measure, e.g. SVG.
 */
async function imageSize(blob: Blob): Promise<{ width: number; height: number } | undefined> {
  try {
    const bitmap = await createImageBitmap(blob)
    const size = { width: bitmap.width, height: bitmap.height }
    bitmap.close()
    return size
  } catch {
    return undefined
  }
}

/**
 * Loads a file of the page: whether it loads, its type, its size in bytes,
 * and the size of an image.
 */
async function loadAsset(url: string, measure: boolean): Promise<Asset | undefined> {
  const source = devUrl(url)
  if (!source) return undefined

  try {
    const response = await fetch(source)
    if (!response.ok) return { url, ok: false, status: response.status }

    const blob = await response.blob()
    const type = blob.type || response.headers.get("content-type")?.split(";")[0]
    const size = measure ? await imageSize(blob) : undefined
    return { url, ok: true, type, bytes: blob.size, ...size }
  } catch {
    return { url, ok: false }
  }
}

/**
 * Loads the `og:image` and the favicons of the page from the dev server.
 * The build reads the same files from the output folder.
 */
export async function loadAssets(head: HeadData): Promise<PageAssets> {
  const imageUrl = head.meta["og:image"]
  const links = head.links.filter((link) => {
    return /(^|\s)(icon|apple-touch-icon)(\s|$)/i.test(link.rel ?? "") && Boolean(link.href)
  })

  const [image, ...icons] = await Promise.all([
    imageUrl ? loadAsset(imageUrl, true) : Promise.resolve(undefined),
    ...links.map((link) => {
      return loadAsset(link.href, false)
    }),
  ])
  return {
    image,
    icons: icons.filter((icon): icon is Asset => {
      return icon !== undefined
    }),
  }
}
