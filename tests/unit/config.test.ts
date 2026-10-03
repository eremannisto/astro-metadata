import { afterEach, describe, expect, it } from "vitest"

import { getConfig, localize } from "../../src/lib/config.ts"
import { clearConfig, setConfig } from "./lib/config.ts"

afterEach(() => {
  clearConfig()
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

  it("returns the config of the integration", () => {
    setConfig({ siteName: "My Site" })
    expect(getConfig()).toEqual({ siteName: "My Site" })
  })
})
