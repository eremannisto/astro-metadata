import { html, nothing, unsafeCSS } from "lit"

import "../../ui/image/image.ts"

import type { Platform } from "./platform.ts"
import styles from "./whatsapp.css?inline"

// The image sizes of WhatsApp: from 300 px a large image, from 100 px a small square
const LARGE_WIDTH = 300
const SMALL_WIDTH = 100
// A large image can be at most 4 times as wide as it is high
const MAX_RATIO = 4

/**
 * A sent message with a link preview, in dark mode.
 *
 * - Uses `og:title`, `og:description` and `og:image`, or else the `<title>` and the description.
 * - An image of 300 px or wider, with a ratio up to 4:1, shows large. An image of 100–299 px shows as a small square. A smaller image does not show.
 * - The image must be smaller than about 600 KB, and the URL must be absolute.
 * - The title and the description show on two lines at most.
 */
export const whatsapp: Platform = {
  name: "WhatsApp",
  styles: unsafeCSS(styles),
  render(page) {
    const { image, imageWidth: width, imageHeight: height } = page.og
    const ratio = width && height ? width / height : 1.91

    let size: "large" | "small" | "none" = image ? "large" : "none"
    if (image && width !== undefined) {
      if (width < SMALL_WIDTH) size = "none"
      else if (width < LARGE_WIDTH || ratio > MAX_RATIO) size = "small"
    }

    return html`
      <div class="whatsapp">
        <div class="bubble">
          <div class="preview ${size}">
            ${
              size === "large"
                ? html`<astro-metadata-image class="image" .src=${image}></astro-metadata-image>`
                : nothing
            }
            <div class="row">
              ${
                size === "small"
                  ? html`<astro-metadata-image class="image" .src=${image}></astro-metadata-image>`
                  : nothing
              }
              <div class="body">
                <div class="title">${page.og.title ?? page.title}</div>
                <div class="text">${page.og.description ?? page.description}</div>
                <div class="host">${page.url.host}</div>
              </div>
            </div>
          </div>
          <div class="message">
            <span class="link">${page.url.href}</span>
            <span class="time">12:00 ✓✓</span>
          </div>
        </div>
      </div>
    `
  },
}
