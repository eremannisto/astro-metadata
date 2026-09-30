import type { AstroIntegration } from "astro"

export type MetadataOptions = {
  /**
   * The path of the config file, relative to the project root.
   * Defaults to `src/metadata.config.ts`, `.js` or `.mjs`.
   */
  config?: string
}

/**
 * The Astro integration of `@mannisto/astro-metadata`. It loads the site-wide defaults
 * from `src/metadata.config.ts` and gives them to the components.
 */
export default function metadata(options?: MetadataOptions): AstroIntegration
