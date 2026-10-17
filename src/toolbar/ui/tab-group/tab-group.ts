import { html, LitElement, nothing, unsafeCSS } from "lit"

import "../badge/badge.ts"

import { define } from "../../define.ts"
import type { Tab } from "../tab/tab.ts"

import "../tab/tab.ts"

import styles from "./tab-group.css?inline"

/**
 * A tab bar and the content of the selected tab. The tabs are its
 * `<astro-metadata-tab>` children. It fires a `change` event with the name of the tab.
 *
 * @example
 * <astro-metadata-tab-group selected="overview">
 *   <astro-metadata-tab name="overview" label="Overview">...</astro-metadata-tab>
 *   <astro-metadata-tab name="code" label="Code">...</astro-metadata-tab>
 * </astro-metadata-tab-group>
 */
export class TabGroup extends LitElement {
  static properties = {
    selected: { reflect: true },
    tabs: { state: true },
  }

  static styles = unsafeCSS(styles)

  declare selected: string | undefined
  declare tabs: Tab[]

  constructor() {
    super()
    this.selected = undefined
    this.tabs = []
    this.addEventListener("tab-update", () => {
      this.requestUpdate()
    })
  }

  onSlotChange(event: Event): void {
    const slot = event.target as HTMLSlotElement
    this.tabs = slot.assignedElements().filter((element): element is Tab => {
      return element.tagName.toLowerCase() === "astro-metadata-tab"
    })
  }

  select(name: string): void {
    this.selected = name
    this.dispatchEvent(new CustomEvent("change", { detail: name }))
  }

  // Shows only the selected tab. Without a selection, the first tab shows.
  updated(): void {
    const selected = this.current()
    for (const tab of this.tabs) {
      tab.hidden = tab.name !== selected
    }
  }

  current(): string | undefined {
    const known = this.tabs.some((tab) => {
      return tab.name === this.selected
    })
    return known ? this.selected : this.tabs[0]?.name
  }

  render() {
    const selected = this.current()
    return html`
      <nav role="tablist">
        ${this.tabs.map((tab) => {
          return html`
            <button
              role="tab"
              aria-selected=${tab.name === selected}
              @click=${() => {
                this.select(tab.name)
              }}
            >
              ${tab.label}
              ${
                tab.count
                  ? html`<astro-metadata-badge level=${tab.level ?? "info"}>
                      ${tab.count}
                    </astro-metadata-badge>`
                  : nothing
              }
            </button>
          `
        })}
      </nav>
      <div class="panels" role="tabpanel">
        <slot @slotchange=${this.onSlotChange}></slot>
      </div>
    `
  }
}

define("astro-metadata-tab-group", TabGroup)
