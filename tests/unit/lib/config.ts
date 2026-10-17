import type { RuntimeConfig } from "../../../src/lib/config.ts"

const store = globalThis as { __ASTRO_METADATA__?: RuntimeConfig }

/**
 * Sets the config, the same as the integration does with Vite's `define`.
 */
export function setConfig(config: RuntimeConfig): void {
  store.__ASTRO_METADATA__ = config
}

/**
 * Removes the config, the same as a project without the integration.
 */
export function clearConfig(): void {
  delete store.__ASTRO_METADATA__
}
