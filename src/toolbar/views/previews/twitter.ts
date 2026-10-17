import { html, unsafeCSS } from "lit"

import "../../ui/image/image.ts"

import { withCode } from "../../ui/inline-code/inline-code.ts"
import type { Platform } from "./platform.ts"
import styles from "./twitter.css?inline"

/**
 * A link card in a post in dark mode ("Lights out").
 *
 * - Twitter (X) shows a card only with `twitter:card`.
 * - `summary_large_image` shows a large image, `summary` a small square image.
 * - Uses `twitter:title`, `twitter:description` and `twitter:image`, or else the Open Graph values.
 * - The large card shows only the title, on one line on the image, and the domain under it.
 */
export const twitter: Platform = {
  name: "Twitter (X)",
  styles: unsafeCSS(styles),
  render(page) {
    const card = page.twitter.card
    if (!card) {
      return html`<p class="notice">
        ${withCode("Twitter (X) shows no card: the page has no `twitter:card`.")}
      </p>`
    }

    const title = page.twitter.title ?? page.og.title ?? page.title
    const text = page.twitter.description ?? page.og.description ?? page.description
    const image = page.twitter.image ?? page.og.image

    if (card === "summary_large_image") {
      return html`
        <div class="twitter">
          <div class="large">
            <astro-metadata-image class="image" .src=${image}></astro-metadata-image>
            <span class="overlay">${title}</span>
          </div>
          <div class="from">From ${page.url.host}</div>
        </div>
      `
    }

    return html`
      <div class="twitter">
        <div class="small">
          <astro-metadata-image class="image" .src=${image}></astro-metadata-image>
          <div class="body">
            <div class="host">${page.url.host}</div>
            <div class="title">${title}</div>
            <div class="text">${text}</div>
          </div>
        </div>
      </div>
    `
  },
}
