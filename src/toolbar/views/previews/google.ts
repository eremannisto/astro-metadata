import { html, nothing, unsafeCSS } from "lit"

import styles from "./google.css?inline"
import { truncate, truncateWidth } from "./page.ts"
import type { Platform } from "./platform.ts"

/**
 * A desktop search result in dark mode.
 *
 * - The title is the `<title>`. Google cuts it at about 600 px of text.
 * - The description is the meta `description`. Google cuts it at about 160 characters.
 * - The site name is `og:site_name`, or else the domain.
 * - Google can change the title and the description for a search.
 */
export const google: Platform = {
  name: "Google",
  styles: unsafeCSS(styles),
  render(page) {
    const path = page.url.pathname.split("/").filter(Boolean)
    return html`
      <div class="google">
        <div class="site">
          <span class="favicon">
            ${page.favicon ? html`<img src=${page.favicon} alt="" />` : nothing}
          </span>
          <div class="source">
            <div class="name">${page.og.siteName ?? page.url.host}</div>
            <div class="url">${[page.url.origin, ...path].join(" › ")}</div>
          </div>
        </div>
        <div class="title">${truncateWidth(page.title, 600, "20px Arial")}</div>
        <div class="text">${truncate(page.description, 160, " ...")}</div>
      </div>
    `
  },
}
