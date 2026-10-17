import { html, unsafeCSS } from "lit"

import "../../ui/image/image.ts"

import styles from "./linkedin.css?inline"
import type { Platform } from "./platform.ts"

// An image narrower than this shows as a small image on the left
const LARGE_WIDTH = 401

/**
 * A link preview in a post in dark mode.
 *
 * - Uses `og:title` and `og:image`, or else the `<title>`. LinkedIn does not show the description.
 * - An image narrower than 401 px shows as a small image on the left.
 * - The title shows on two lines at most.
 */
export const linkedin: Platform = {
  name: "LinkedIn",
  styles: unsafeCSS(styles),
  render(page) {
    const width = page.og.imageWidth
    const small = width !== undefined && width < LARGE_WIDTH
    return html`
      <div class="linkedin ${small ? "small" : "large"}">
        <astro-metadata-image class="image" .src=${page.og.image}></astro-metadata-image>
        <div class="body">
          <div class="title">${page.og.title ?? page.title}</div>
          <div class="host">${page.url.host}</div>
        </div>
      </div>
    `
  },
}
