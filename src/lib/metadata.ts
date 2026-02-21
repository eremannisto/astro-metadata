import type { ComponentProps } from "astro/types"
import type Head from "../components/Head.astro"

let store: Partial<ComponentProps<typeof Head>> = {}

/**
 * Metadata manages page-level head properties.
 * Call set() in your page, then resolve() in your layout.
 */
export const Metadata = {
  /**
   * Replace the current metadata store with new values.
   *
   * @param values - The head properties to store.
   */
  set(values: Partial<ComponentProps<typeof Head>>) {
    store = values
  },

  /**
   * Return the current metadata store.
   *
   * @returns The current head properties.
   */
  get(): Partial<ComponentProps<typeof Head>> {
    return store
  },

  /**
   * Merge stored values over the provided defaults.
   * Use this in your layout to apply page-level overrides.
   *
   * @param defaults - The default head properties from your layout.
   * @returns The merged head properties.
   */
  resolve(defaults: Partial<ComponentProps<typeof Head>>): Partial<ComponentProps<typeof Head>> {
    return { ...defaults, ...store }
  },

  get title() {
    return store.title
  },
  get titleTemplate() {
    return store.titleTemplate
  },
  get description() {
    return store.description
  },
  get canonical() {
    return store.canonical
  },
  get keywords() {
    return store.keywords
  },
  get image() {
    return store.image
  },
  get robots() {
    return store.robots
  },
  get openGraph() {
    return store.openGraph
  },
  get twitter() {
    return store.twitter
  },
  get favicon() {
    return store.favicon
  },
  get schema() {
    return store.schema
  },
  get languageAlternates() {
    return store.languageAlternates
  },
}
