import { afterEach, describe, expect, it, vi } from "vitest"

import { Site } from "../../src/lib/site.ts"
import { clearConfig, setConfig } from "./lib/config.ts"

afterEach(() => {
  clearConfig()
  vi.unstubAllEnvs()
})

describe("Site", () => {
  it("returns the texts of the locale, or the first text", () => {
    setConfig({
      siteName: { en: "Acme Studio", fi: "Acme Studio Suomi" },
      titleTemplate: { en: "%s | Acme Studio", fi: "%s | Acme Studio Suomi" },
      description: { en: "Tools for small teams.", fi: "Työkaluja pienille tiimeille." },
    })
    expect(Site.name()).toBe("Acme Studio")
    expect(Site.name({ locale: "fi" })).toBe("Acme Studio Suomi")
    expect(Site.template({ locale: "fi" })).toBe("%s | Acme Studio Suomi")
    expect(Site.description({ locale: "fi" })).toBe("Työkaluja pienille tiimeille.")
    expect(Site.description({ locale: "de" })).toBe("Tools for small teams.")
  })

  it("returns a text without locales for each locale", () => {
    setConfig({ siteName: "Acme Studio" })
    expect(Site.name({ locale: "fi" })).toBe("Acme Studio")
  })

  it("returns the image with an absolute URL and the alt text of the locale", () => {
    vi.stubEnv("SITE", "https://example.com")
    setConfig({
      image: { url: "/og.jpg", alt: { en: "A logo", fi: "Logo" }, width: 1200, height: 630 },
    })
    expect(Site.image({ locale: "fi" })).toEqual({
      url: "https://example.com/og.jpg",
      alt: "Logo",
      width: 1200,
      height: 630,
    })
  })

  it("returns the twitter values with the default card, and the theme color", () => {
    setConfig({ twitter: { site: "@acmestudio" }, themeColor: { light: "#fff", dark: "#000" } })
    expect(Site.twitter()).toEqual({ site: "@acmestudio", card: "summary_large_image" })
    expect(Site.themeColor()).toEqual({ light: "#fff", dark: "#000" })
  })

  it("returns undefined for the options that are not set", () => {
    expect(Site.name()).toBeUndefined()
    expect(Site.template()).toBeUndefined()
    expect(Site.description()).toBeUndefined()
    expect(Site.image()).toBeUndefined()
    expect(Site.twitter()).toBeUndefined()
    expect(Site.themeColor()).toBeUndefined()
    expect(Site.icons()).toEqual([])
  })
})
