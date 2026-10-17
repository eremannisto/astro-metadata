import { html, LitElement, unsafeCSS } from "lit"

import { define } from "../../define.ts"
import styles from "./badge.css?inline"

export type Level = "success" | "info" | "warning" | "error"

/**
 * A small rounded label, e.g. the number of problems. `level` sets the colors.
 *
 * @example <astro-metadata-badge level="warning">2</astro-metadata-badge>
 */
export class Badge extends LitElement {
  static properties = { level: { reflect: true } }
  static styles = unsafeCSS(styles)

  declare level: Level | undefined

  render() {
    return html`<slot></slot>`
  }
}

define("astro-metadata-badge", Badge)
