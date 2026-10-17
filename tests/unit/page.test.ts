import { afterEach, describe, expect, it } from "vitest"

import { fullTitle, pageRobots } from "../../src/lib/page.ts"
import { clearConfig, setConfig } from "./lib/config.ts"

afterEach(() => {
  clearConfig()
})

describe("fullTitle", () => {
  it("puts the title into the template of the locale", () => {
    setConfig({ titleTemplate: { en: "%s | My Site", fi: "%s | Sivustoni" } })
    expect(fullTitle("About")).toBe("About | My Site")
    expect(fullTitle("Tietoa", "fi")).toBe("Tietoa | Sivustoni")
  })

  it("returns the site name for a page without a title", () => {
    setConfig({ siteName: "My Site", titleTemplate: "%s | My Site" })
    expect(fullTitle()).toBe("My Site")
  })

  it("keeps the title for a template without %s, and without a template", () => {
    setConfig({ titleTemplate: "My Site" })
    expect(fullTitle("About")).toBe("About")
    clearConfig()
    expect(fullTitle("About")).toBe("About")
  })

  it("keeps $ patterns in the title as text", () => {
    setConfig({ titleTemplate: "%s | My Site" })
    expect(fullTitle("Save $& now")).toBe("Save $& now | My Site")
  })
})

describe("pageRobots", () => {
  it("is empty for the default values", () => {
    expect(pageRobots({})).toBe("")
  })

  it("combines the props, the config and the extra directives", () => {
    setConfig({ robots: { index: false, extra: "max-image-preview:large" } })
    expect(pageRobots({ follow: false })).toBe("noindex, nofollow, max-image-preview:large")
    expect(pageRobots({ index: true })).toBe("max-image-preview:large")
  })
})
