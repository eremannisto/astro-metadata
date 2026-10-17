import { html, nothing, unsafeCSS } from "lit"
import { styleMap } from "lit/directives/style-map.js"

import "../../ui/image/image.ts"

import styles from "./discord.css?inline"
import { truncate } from "./page.ts"
import type { Platform } from "./platform.ts"

// The lengths that Discord shows
const TITLE_LENGTH = 256
const DESCRIPTION_LENGTH = 350

// The border color without a theme-color
const DEFAULT_BORDER = "#1e1f22"

/**
 * A link embed in a message, in dark mode.
 *
 * - The color of the left border is the `theme-color`.
 * - Uses `og:site_name`, `og:title`, `og:description` and `og:image`.
 * - `twitter:card` with `summary_large_image` shows a large image under the text. Else the image is small, on the right.
 * - Discord cuts the title at 256 characters and the description at 350.
 */
export const discord: Platform = {
  name: "Discord",
  styles: unsafeCSS(styles),
  render(page) {
    const large = page.twitter.card === "summary_large_image"
    const image = page.og.image
    const border = page.themeColor ?? DEFAULT_BORDER
    // The description keeps its line breaks, so it must have no spaces around it
    const text = truncate(page.og.description ?? page.description, DESCRIPTION_LENGTH)

    return html`
      <div class="discord">
        <div
          class="embed ${large ? "large" : "small"}"
          style=${styleMap({ borderLeftColor: border })}
        >
          <div class="body">
            ${page.og.siteName ? html`<div class="site">${page.og.siteName}</div>` : nothing}
            <div class="title">${truncate(page.og.title ?? page.title, TITLE_LENGTH)}</div>
            <div class="text">${text}</div>
            ${
              large && image
                ? html`<astro-metadata-image class="image" .src=${image}></astro-metadata-image>`
                : nothing
            }
          </div>
          ${
            !large && image
              ? html`<astro-metadata-image class="thumbnail" .src=${image}></astro-metadata-image>`
              : nothing
          }
        </div>
      </div>
    `
  },
}
