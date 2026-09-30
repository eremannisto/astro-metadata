import { afterEach, describe, expect, it } from "vitest"

import { defineMetadata, getConfig, localize } from "../../src/lib/config.ts"

const KEY = Symbol.for("@mannisto/astro-metadata/config")

afterEach(() => {
  delete (globalThis as Record<symbol, unknown>)[KEY]
})

describe("localize", () => {
  it("returns a string unchanged", () => {
    expect(localize("My Site", "fi")).toBe("My Site")
  })

  it("returns the value of the locale", () => {
    expect(localize({ en: "My Site", fi: "Sivustoni" }, "fi")).toBe("Sivustoni")
  })

  it("returns the first value for an unknown or missing locale", () => {
    expect(localize({ en: "My Site", fi: "Sivustoni" }, "de")).toBe("My Site")
    expect(localize({ en: "My Site", fi: "Sivustoni" })).toBe("My Site")
  })

  it("returns undefined without a value", () => {
    expect(localize(undefined, "fi")).toBeUndefined()
  })
})

describe("getConfig", () => {
  it("returns an empty config without the integration", () => {
    expect(getConfig()).toEqual({})
  })

  it("returns the config that the integration stores", () => {
    ;(globalThis as Record<symbol, unknown>)[KEY] = { siteName: "My Site" }
    expect(getConfig()).toEqual({ siteName: "My Site" })
  })
})

describe("defineMetadata", () => {
  it("returns the config unchanged", () => {
    const config = { siteName: "My Site" }
    expect(defineMetadata(config)).toBe(config)
  })
})
