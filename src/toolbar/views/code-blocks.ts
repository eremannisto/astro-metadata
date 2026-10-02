import { html, nothing } from "lit"

import type { JsonLd, ManifestData } from "../data.ts"

import "../ui/code-block/code-block.ts"

/**
 * The JSON-LD scripts as code blocks, with their types as the label.
 * A script with invalid JSON shows its source and the error.
 */
export function schemaBlocks(schemas: JsonLd[]) {
  return schemas.map((schema) => {
    const source = schema.error ? schema.source : JSON.stringify(schema.data, null, 2)
    const label = schema.error ? `Invalid JSON: ${schema.error}` : schema.types.join(", ")
    return html`
      <astro-metadata-code .code=${source} language="json" label=${label}></astro-metadata-code>
    `
  })
}

/**
 * The web app manifest as a code block, with its URL as the label, or the load error.
 */
export function manifestBlock(manifest: ManifestData | undefined) {
  if (!manifest) return nothing
  if (manifest.error) return html`<p class="empty">${manifest.url}: ${manifest.error}</p>`

  return html`
    <astro-metadata-code
      .code=${JSON.stringify(manifest.data, null, 2)}
      language="json"
      label=${manifest.url}
    ></astro-metadata-code>
  `
}
