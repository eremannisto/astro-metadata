/**
 * Registers a custom element one time. Hot reload runs the module again, and a second
 * `customElements.define()` with the same name throws an error.
 */
export function define(name: string, element: CustomElementConstructor): void {
  if (!customElements.get(name)) customElements.define(name, element)
}
