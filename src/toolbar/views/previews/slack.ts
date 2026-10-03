import { html, nothing, unsafeCSS } from "lit"

import "../../ui/image/image.ts"

import type { Platform } from "./platform.ts"
import styles from "./slack.css?inline"

/**
 * A link unfurl in a message, in dark mode.
 *
 * - Uses `og:site_name` with the favicon, `og:title`, `og:description` and `og:image`.
 * - `twitter:card` with `summary_large_image` shows a large image under the text. Else the image is small, on the right.
 * - An image smaller than 60 × 60 px does not show.
 */
export const slack: Platform = {
  name: "Slack",
  styles: unsafeCSS(styles),
  render(page) {
    const large = page.twitter.card === "summary_large_image"
    const image = page.og.image

    return html`
      <div class="slack">
        <div class="unfurl">
          <div class="body">
            <div class="site">
              ${page.favicon ? html`<img class="favicon" src=${page.favicon} alt="" />` : nothing}
              ${page.og.siteName ?? page.url.host}
            </div>
            <div class="title">${page.og.title ?? page.title}</div>
            <div class="text">${page.og.description ?? page.description}</div>
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
