import { html, LitElement, unsafeCSS } from "lit"
import { styleMap } from "lit/directives/style-map.js"

import { define } from "../../define.ts"
import styles from "./color-swatch.css?inline"

/**
 * A small square of a color, and the color value.
 *
 * @example <astro-metadata-color-swatch color="#6366f1"></astro-metadata-color-swatch>
 */
export class ColorSwatch extends LitElement {
  static properties = { color: {} }
  static styles = unsafeCSS(styles)

  declare color: string

  constructor() {
    super()
    this.color = ""
  }

  render() {
    return html`
      <span class="color" style=${styleMap({ background: this.color })}></span>
      ${this.color}
    `
  }
}

define("astro-metadata-color-swatch", ColorSwatch)
