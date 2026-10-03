import { findMeta } from "../../data.ts"
import type { PageMetadata } from "../../data.ts"

/**
 * The values of the page that the platforms read for a link preview. Each platform
 * picks its own values from these, with its own fallbacks.
 */
export type SharedPage = {
  /** The URL of the page: the canonical URL, or the current URL. */
  url: URL
  /** The text of the `<title>` tag. */
  title?: string
  /** The meta description. */
  description?: string
  og: {
    title?: string
    description?: string
    siteName?: string
    image?: string
    imageWidth?: number
    imageHeight?: number
  }
  twitter: {
    card?: string
    title?: string
    description?: string
    image?: string
  }
  /** The first `theme-color` of the page. */
  themeColor?: string
  /** The favicon: the SVG, or else the largest icon. */
  favicon?: string
}

/**
 * Returns a number from a meta value, or undefined.
 */
function toNumber(value: string | undefined): number | undefined {
  const number = Number.parseInt(value ?? "", 10)
  return Number.isNaN(number) ? undefined : number
}

/**
 * Returns the favicon: the SVG, or else the largest icon.
 */
function favicon(data: PageMetadata): string | undefined {
  const icons = data.icons.filter((icon) => {
    return icon.rel === "icon"
  })
  const svg = icons.find((icon) => {
    return icon.type === "image/svg+xml"
  })
  const largest = [...icons].sort((a, b) => {
    return (toNumber(b.sizes) ?? 0) - (toNumber(a.sizes) ?? 0)
  })[0]
  return (svg ?? largest)?.href
}

/**
 * Reads the values of the page that the platforms use.
 */
export function sharedPage(data: PageMetadata): SharedPage {
  const og = data.openGraph
  const twitter = data.twitter
  return {
    url: new URL(data.canonical ?? location.href, location.href),
    title: data.title,
    description: data.description,
    og: {
      title: findMeta(og, "og:title"),
      description: findMeta(og, "og:description"),
      siteName: findMeta(og, "og:site_name"),
      image: findMeta(og, "og:image"),
      imageWidth: toNumber(findMeta(og, "og:image:width")),
      imageHeight: toNumber(findMeta(og, "og:image:height")),
    },
    twitter: {
      card: findMeta(twitter, "twitter:card"),
      title: findMeta(twitter, "twitter:title"),
      description: findMeta(twitter, "twitter:description"),
      image: findMeta(twitter, "twitter:image"),
    },
    themeColor: data.themeColors[0]?.color,
    favicon: favicon(data),
  }
}

/**
 * Cuts a text after a number of characters, at the end of a word, and adds an ellipsis.
 */
export function truncate(text: string | undefined, max: number, ellipsis = "…"): string {
  if (!text || text.length <= max) return text ?? ""

  const cut = text.slice(0, max - ellipsis.length)
  const space = cut.lastIndexOf(" ")
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd()}${ellipsis}`
}

let canvas: HTMLCanvasElement | undefined

/**
 * Cuts a text at a width in pixels, the same as a platform that measures the text,
 * e.g. Google cuts a title at about 600 px of 20 px Arial.
 */
export function truncateWidth(
  text: string | undefined,
  width: number,
  font: string,
  ellipsis = "..."
): string {
  if (!text) return ""

  canvas ??= document.createElement("canvas")
  const context = canvas.getContext("2d")
  if (!context) return text
  context.font = font
  if (context.measureText(text).width <= width) return text

  // The longest start of the text that fits with the ellipsis
  let low = 0
  let high = text.length
  while (low < high) {
    const middle = Math.ceil((low + high) / 2)
    const fits = context.measureText(text.slice(0, middle) + ellipsis).width <= width
    if (fits) low = middle
    else high = middle - 1
  }
  return `${text.slice(0, low).trimEnd()}${ellipsis}`
}
