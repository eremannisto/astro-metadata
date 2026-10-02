import { html, LitElement, nothing, unsafeCSS } from "lit"
import type { TemplateResult } from "lit"

import { define } from "../../define.ts"
import type { Level } from "../badge/badge.ts"
import type { IconName } from "../icon/icon.ts"
import styles from "./alert.css?inline"

import "../icon/icon.ts"

const ICONS: Record<Level, IconName> = {
  success: "seal-check",
  info: "seal-question",
  warning: "warning",
  error: "warning-circle",
}

/** An item in the list of an alert, e.g. one problem of the page. */
export type AlertItem = {
  /** The level of the item gives the color of its dot. */
  level?: Level
  content: string | TemplateResult
  /** Makes the item a button: a click fires a `select` event with this value. */
  target?: string
}

/**
 * A message with a level: a heading, an optional list of items, and optional content under it.
 * A click on an item with a `target` fires a `select` event with the target as its detail.
 *
 * @example
 * <astro-metadata-alert level="warning" heading="2 warnings" .items=${items}>
 * </astro-metadata-alert>
 */
export class Alert extends LitElement {
  static properties = {
    level: { reflect: true },
    heading: {},
    items: { attribute: false },
  }

  static styles = unsafeCSS(styles)

  declare level: Level
  declare heading: string
  declare items: AlertItem[]

  constructor() {
    super()
    this.level = "info"
    this.heading = ""
    this.items = []
  }

  select(target: string): void {
    this.dispatchEvent(new CustomEvent("select", { detail: target }))
  }

  renderContent(item: AlertItem) {
    if (!item.target) return html`<span>${item.content}</span>`

    const target = item.target
    return html`
      <button
        type="button"
        class="target"
        @click=${() => {
          this.select(target)
        }}
      >
        ${item.content}
      </button>
    `
  }

  renderItems() {
    if (this.items.length === 0) return nothing

    return html`
      <ul class="items">
        ${this.items.map((item) => {
          return html`<li class="item ${item.level ?? ""}">${this.renderContent(item)}</li>`
        })}
      </ul>
    `
  }

  render() {
    return html`
      <div class="icon">
        <astro-metadata-icon name=${ICONS[this.level]}></astro-metadata-icon>
      </div>
      <div class="content">
        <p class="heading">${this.heading}</p>
        ${this.renderItems()}
        <slot></slot>
      </div>
    `
  }
}

define("astro-metadata-alert", Alert)
