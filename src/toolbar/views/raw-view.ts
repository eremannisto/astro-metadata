import { html, LitElement, unsafeCSS } from "lit"

import type { PageMetadata } from "../data.ts"
import shared from "../styles/shared.css?inline"

import "../ui/code-block/code-block.ts"

import { define } from "../define.ts"

import "../ui/section/section.ts"

import { manifestBlock, schemaBlocks } from "./code-blocks.ts"

/**
 * All metadata as raw code: the head tags, the JSON-LD scripts and the web app manifest.
 */
export class RawView extends LitElement {
  static properties = { data: { attribute: false } }
  static styles = unsafeCSS(shared)

  declare data: PageMetadata

  render() {
    return html`
      <astro-metadata-section heading="Head">
        <astro-metadata-code .code=${this.data.source} language="html" label="HTML">
        </astro-metadata-code>
      </astro-metadata-section>

      <astro-metadata-section heading="Structured data" ?empty=${this.data.schemas.length === 0}
        >${schemaBlocks(this.data.schemas)}</astro-metadata-section
      >

      <astro-metadata-section heading="Web app manifest" ?empty=${!this.data.manifest}>
        ${manifestBlock(this.data.manifest)}
      </astro-metadata-section>
    `
  }
}

define("astro-metadata-raw", RawView)
