import { html, unsafeCSS } from "lit"

import "../../ui/image/image.ts"

import styles from "./facebook.css?inline"
import type { Platform } from "./platform.ts"

// An image of this width or larger shows large. A smaller image shows as a small square.
const LARGE_WIDTH = 600

/**
 * A link preview in a post in dark mode.
 *
 * - Uses `og:title`, `og:description` and `og:image`, or else the `<title>` and the description.
 * - An image of 600 × 315 px or larger shows large at 1.91:1. A smaller image shows as a small square.
 * - An image smaller than 200 × 200 px does not show.
 * - The title shows on two lines at most, and the description on one line.
 */
export const facebook: Platform = {
  name: "Facebook",
  styles: unsafeCSS(styles),
  render(page) {
    const width = page.og.imageWidth
    const small = width !== undefined && width < LARGE_WIDTH
    return html`
      <div class="facebook ${small ? "small" : "large"}">
        <astro-metadata-image class="image" .src=${page.og.image}></astro-metadata-image>
        <div class="body">
          <div class="host">${page.url.host}</div>
          <div class="title">${page.og.title ?? page.title}</div>
          <div class="text">${page.og.description ?? page.description}</div>
        </div>
      </div>
    `
  },
}
