import { html, LitElement, unsafeCSS } from "lit"
import { unsafeHTML } from "lit/directives/unsafe-html.js"

import { define } from "../../define.ts"
import { highlight } from "../../highlight.ts"
import type { Language } from "../../highlight.ts"
import styles from "./code-block.css?inline"

import "../icon/icon.ts"

/**
 * A code block with line numbers, highlighting and a copy button.
 *
 * @example <astro-metadata-code .code=${json} language="json" label="WebSite"></astro-metadata-code>
 */
export class CodeBlock extends LitElement {
  static properties = {
    code: {},
    language: {},
    label: {},
    copied: { state: true },
  }

  static styles = unsafeCSS(styles)

  declare code: string
  declare language: Language
  declare label: string | undefined
  declare copied: boolean

  constructor() {
    super()
    this.code = ""
    this.language = "html"
    this.label = undefined
    this.copied = false
  }

  async copy(): Promise<void> {
    await navigator.clipboard.writeText(this.code)
    this.copied = true
    setTimeout(() => {
      this.copied = false
    }, 1500)
  }

  render() {
    const lines = highlight(this.code, this.language).split("\n")
    const code = lines.map((line) => {
      return html`<span class="line">${unsafeHTML(line)}</span>`
    })

    // No spaces inside <pre>: the template text would show in the code
    return html`
      <div class="block">
        <div class="toolbar">
          <span>${this.label ?? this.language.toUpperCase()}</span>
          <button @click=${this.copy} aria-label="Copy the code">
            <astro-metadata-icon name=${this.copied ? "check" : "copy"}></astro-metadata-icon>
          </button>
        </div>
        <pre><code>${code}</code></pre>
      </div>
    `
  }
}

define("astro-metadata-code", CodeBlock)
