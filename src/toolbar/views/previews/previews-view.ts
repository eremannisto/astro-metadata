import { html, LitElement, unsafeCSS } from "lit"

import type { PageMetadata } from "../../data.ts"
import { define } from "../../define.ts"
import shared from "../../styles/shared.css?inline"

import "../../ui/section/section.ts"

import { discord } from "./discord.ts"
import { facebook } from "./facebook.ts"
import { google } from "./google.ts"
import { linkedin } from "./linkedin.ts"
import { sharedPage } from "./page.ts"
import type { Platform } from "./platform.ts"
import styles from "./previews-view.css?inline"
import { slack } from "./slack.ts"
import { twitter } from "./twitter.ts"
import { whatsapp } from "./whatsapp.ts"

// The platforms in the order of the sections
const PLATFORMS: Platform[] = [google, twitter, facebook, linkedin, whatsapp, discord, slack]

/**
 * The page as each platform shows its link: a search result, social cards and chat previews.
 * The previews copy the dark mode, the sizes and the rules of each platform. The platforms
 * render the real previews on their own servers, so a preview can differ a little.
 */
export class PreviewsView extends LitElement {
  static properties = { data: { attribute: false } }
  static styles = [
    unsafeCSS(shared),
    unsafeCSS(styles),
    ...PLATFORMS.map((platform) => {
      return platform.styles
    }),
  ]

  declare data: PageMetadata

  render() {
    const page = sharedPage(this.data)
    return PLATFORMS.map((platform) => {
      return html`
        <astro-metadata-section heading=${platform.name}>
          <div class="stage">${platform.render(page)}</div>
        </astro-metadata-section>
      `
    })
  }
}

define("astro-metadata-previews", PreviewsView)
