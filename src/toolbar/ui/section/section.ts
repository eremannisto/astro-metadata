import { html, LitElement, nothing, unsafeCSS } from "lit"

import { define } from "../../define.ts"

import "../icon/icon.ts"

import styles from "./section.css?inline"

/**
 * A part of a view: a heading and its content. Click the heading to close or open the section.
 * At the start, the first section of a view is open and the other sections are closed.
 * A section without a heading is always open.
 * An `empty` section shows only its heading and "None", and the user can not open it.
 *
 * @example <astro-metadata-section heading="General">...</astro-metadata-section>
 */
export class Section extends LitElement {
  static properties = {
    heading: {},
    closed: { type: Boolean, reflect: true },
    empty: { type: Boolean, reflect: true },
  }

  static styles = unsafeCSS(styles)

  declare heading: string | undefined
  declare closed: boolean
  declare empty: boolean

  // True after the first connect. A section that moves keeps its state.
  private started = false

  constructor() {
    super()
    this.closed = false
    this.empty = false
  }

  connectedCallback(): void {
    super.connectedCallback()
    if (this.started) return

    this.started = true
    const first = this.parentNode?.querySelector("astro-metadata-section")
    this.closed = Boolean(this.heading) && first !== this
  }

  toggle(): void {
    if (!this.heading) return

    this.closed = !this.closed
  }

  render() {
    return html`
      ${
        this.heading
          ? html`
              <h2>
                <button
                  type="button"
                  aria-expanded=${!this.closed && !this.empty}
                  ?disabled=${this.empty}
                  @click=${this.toggle}
                >
                  <astro-metadata-icon name="caret-right"></astro-metadata-icon>
                  ${this.heading} ${this.empty ? html`<span class="none">None</span>` : nothing}
                </button>
              </h2>
            `
          : nothing
      }
      <div class="content" ?hidden=${this.closed || this.empty}><slot></slot></div>
    `
  }
}

define("astro-metadata-section", Section)
