import { html, LitElement, unsafeCSS } from "lit"

import { define } from "../../define.ts"
import type { Level } from "../badge/badge.ts"
import styles from "./tab.css?inline"

/**
 * One tab of a `<astro-metadata-tab-group>`: its label in the tab bar, and its content.
 *
 * @example <astro-metadata-tab name="overview" label="Overview" count="2" level="warning">
 */
export class Tab extends LitElement {
  static properties = {
    name: {},
    label: {},
    count: { type: Number },
    level: {},
  }

  static styles = unsafeCSS(styles)

  declare name: string
  declare label: string
  /** A number in a badge after the label. A count of 0 shows no badge. */
  declare count: number | undefined
  /** The level of the badge. */
  declare level: Level | undefined

  constructor() {
    super()
    this.name = ""
    this.label = ""
    this.count = undefined
    this.level = undefined
  }

  // Tells the tab group that the label or the count changed
  updated(): void {
    this.dispatchEvent(new Event("tab-update", { bubbles: true }))
  }

  render() {
    return html`<slot></slot>`
  }
}

define("astro-metadata-tab", Tab)
