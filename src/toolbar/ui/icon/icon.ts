import { html, LitElement, nothing, unsafeCSS } from "lit"
import { unsafeSVG } from "lit/directives/unsafe-svg.js"

import caretRight from "../../../assets/icons/caret-right.svg?raw"
import check from "../../../assets/icons/check.svg?raw"
import copy from "../../../assets/icons/copy.svg?raw"
import sealCheck from "../../../assets/icons/seal-check-duotone.svg?raw"
import sealQuestion from "../../../assets/icons/seal-question-duotone.svg?raw"
import warningCircle from "../../../assets/icons/warning-circle-duotone.svg?raw"
import warning from "../../../assets/icons/warning-duotone.svg?raw"
import close from "../../../assets/icons/x.svg?raw"
import { define } from "../../define.ts"
import styles from "./icon.css?inline"

// All icons of the panel. Add a new icon to src/assets/icons/ and to this list.
const ICONS = {
  "caret-right": caretRight,
  check,
  close,
  copy,
  "seal-check": sealCheck,
  "seal-question": sealQuestion,
  warning,
  "warning-circle": warningCircle,
}

export type IconName = keyof typeof ICONS

/**
 * An icon from `src/assets/icons/`. The color is `currentColor`, and `--icon-size` sets the size.
 *
 * @example <astro-metadata-icon name="close"></astro-metadata-icon>
 */
export class Icon extends LitElement {
  static properties = { name: {} }
  static styles = unsafeCSS(styles)

  declare name: IconName | undefined

  render() {
    const svg = this.name ? ICONS[this.name] : undefined
    return svg ? html`${unsafeSVG(svg)}` : nothing
  }
}

define("astro-metadata-icon", Icon)
