import { html, LitElement, nothing, unsafeCSS } from "lit"
import { styleMap } from "lit/directives/style-map.js"

import { summarize } from "../data.ts"
import type { PageMetadata } from "../data.ts"
import { define } from "../define.ts"
import tokens from "../styles/tokens.css?inline"

import "../ui/badge/badge.ts"
import "../ui/icon/icon.ts"
import "../ui/tab-group/tab-group.ts"

import styles from "./metadata-panel.css?inline"

import "./overview-view.ts"
import "./previews/previews-view.ts"
import "./raw-view.ts"

const TAB_KEY = "astro-metadata:tab"
const WIDTH_KEY = "astro-metadata:width"
const MIN_WIDTH = 360

/**
 * The slide-out panel: a header, and the tabs with the views.
 * It fires a `close` event when the user clicks the close button.
 */
export class MetadataPanel extends LitElement {
  static properties = {
    data: { attribute: false },
    width: { state: true },
    resizing: { state: true },
  }

  static styles = [unsafeCSS(tokens), unsafeCSS(styles)]

  declare data: PageMetadata | undefined
  declare width: number
  declare resizing: boolean

  constructor() {
    super()
    this.data = undefined
    this.width = Number(localStorage.getItem(WIDTH_KEY)) || 480
    this.resizing = false
  }

  close(): void {
    this.dispatchEvent(new CustomEvent("close"))
  }

  /**
   * Changes the width while the user drags the left edge.
   */
  startResize(event: PointerEvent): void {
    const handle = event.currentTarget as HTMLElement
    handle.setPointerCapture(event.pointerId)
    this.resizing = true

    const move = (moveEvent: PointerEvent) => {
      const max = window.innerWidth - 40
      this.width = Math.min(max, Math.max(MIN_WIDTH, window.innerWidth - moveEvent.clientX))
    }
    const stop = () => {
      handle.removeEventListener("pointermove", move)
      this.resizing = false
      localStorage.setItem(WIDTH_KEY, String(this.width))
    }
    handle.addEventListener("pointermove", move)
    handle.addEventListener("pointerup", stop, { once: true })
  }

  renderTabs() {
    if (!this.data) return html`<p class="loading">Reading the metadata…</p>`

    const { errors, warnings, level } = summarize(this.data.checks)
    return html`
      <astro-metadata-tab-group
        selected=${localStorage.getItem(TAB_KEY) ?? "overview"}
        @change=${(event: CustomEvent<string>) => {
          localStorage.setItem(TAB_KEY, event.detail)
        }}
      >
        <astro-metadata-tab
          name="overview"
          label="Overview"
          count=${errors + warnings}
          level=${level ?? nothing}
        >
          <astro-metadata-overview .data=${this.data}></astro-metadata-overview>
        </astro-metadata-tab>
        <astro-metadata-tab name="previews" label="Previews">
          <astro-metadata-previews .data=${this.data}></astro-metadata-previews>
        </astro-metadata-tab>
        <astro-metadata-tab name="raw" label="Raw">
          <astro-metadata-raw .data=${this.data}></astro-metadata-raw>
        </astro-metadata-tab>
      </astro-metadata-tab-group>
    `
  }

  render() {
    return html`
      <aside class="panel" style=${styleMap({ "--panel-width": `${this.width}px` })}>
        <div class="resize ${this.resizing ? "active" : ""}" @pointerdown=${this.startResize}></div>

        <header class="header">
          <div class="heading">
            <div class="title">
              <h1>Metadata</h1>
              <astro-metadata-badge level="info">Beta</astro-metadata-badge>
            </div>
            <p class="path">${location.pathname}</p>
          </div>
          <button class="close" @click=${this.close} aria-label="Close the panel">
            <astro-metadata-icon name="close"></astro-metadata-icon>
          </button>
        </header>

        ${this.renderTabs()}
      </aside>
    `
  }
}

define("astro-metadata-panel", MetadataPanel)
