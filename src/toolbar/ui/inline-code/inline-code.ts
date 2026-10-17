import { html, LitElement, unsafeCSS } from "lit"

import { define } from "../../define.ts"
import styles from "./inline-code.css?inline"

/**
 * A code word in a text, e.g. a tag name or a value.
 *
 * @example <astro-metadata-inline-code>og:image</astro-metadata-inline-code>
 */
export class InlineCode extends LitElement {
  static styles = unsafeCSS(styles)

  render() {
    return html`<slot></slot>`
  }
}

define("astro-metadata-inline-code", InlineCode)

/**
 * Returns a text with each part between backticks as inline code.
 *
 * @example withCode("The `og:image` has no width.")
 */
export function withCode(text: string) {
  const parts = text.split(/`([^`]+)`/)
  return html`${parts.map((part, index) => {
    // The odd parts are the parts between the backticks
    return index % 2 === 1
      ? html`<astro-metadata-inline-code>${part}</astro-metadata-inline-code>`
      : part
  })}`
}

/**
 * Returns a value as inline code, or undefined for an empty value.
 */
export function code(value: string | undefined) {
  return value ? html`<astro-metadata-inline-code>${value}</astro-metadata-inline-code>` : undefined
}
