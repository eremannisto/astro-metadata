import { html, LitElement, unsafeCSS } from "lit"

import { define } from "../../define.ts"
import styles from "./image.css?inline"

/**
 * An image that shows a message when it does not load. The social images use the `site`
 * of the Astro config, so in dev they often do not exist yet: then the image loads
 * from the dev server. The `missing` attribute shows when the image does not load.
 *
 * @example <astro-metadata-image src=${url}></astro-metadata-image>
 */
export class Image extends LitElement {
  static properties = {
    src: {},
    missing: { type: Boolean, reflect: true },
    current: { state: true },
  }

  static styles = unsafeCSS(styles)

  declare src: string | undefined
  declare missing: boolean
  /** The URL that the image loads now: `src`, or the same path on the dev server. */
  declare current: string | undefined

  constructor() {
    super()
    this.src = undefined
    this.missing = false
    this.current = undefined
  }

  willUpdate(changed: Map<string, unknown>): void {
    if (changed.has("src")) {
      this.current = this.src
      this.missing = !this.src
    }
  }

  onError(): void {
    const url = new URL(this.current ?? "", location.href)
    if (url.origin !== location.origin) {
      this.current = `${location.origin}${url.pathname}${url.search}`
      return
    }
    this.missing = true
  }

  render() {
    if (this.missing) {
      return html`<span class="message">${this.src ? "The image does not load" : "No image"}</span>`
    }
    return html`<img src=${this.current ?? ""} alt="" @error=${this.onError} />`
  }
}

define("astro-metadata-image", Image)
