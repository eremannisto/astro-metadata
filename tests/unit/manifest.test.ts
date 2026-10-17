import { afterEach, describe, expect, it, vi } from "vitest"

import { Manifest } from "../../src/lib/manifest.ts"
import { clearConfig, setConfig } from "./lib/config.ts"

afterEach(() => {
  clearConfig()
  vi.unstubAllEnvs()
})

describe("Manifest.paths", () => {
  it("returns no paths without a manifest or with your own manifest", () => {
    expect(Manifest.paths()).toEqual([])
    setConfig({ manifest: "/site.webmanifest" })
    expect(Manifest.paths()).toEqual([])
  })

  it("returns one root path for a manifest with one language", () => {
    setConfig({ manifest: { name: "My Site" } })
    expect(Manifest.paths()).toEqual([{}])
  })

  it("returns the root for the first locale and a folder for the others", () => {
    setConfig({ manifest: { name: { en: "My Site", fi: "Sivustoni" } } })
    expect(Manifest.paths()).toEqual([
      { lang: undefined, locale: "en" },
      { lang: "fi", locale: "fi" },
    ])
  })
})

describe("Manifest.url", () => {
  it("returns undefined without a manifest", () => {
    expect(Manifest.url("fi")).toBeUndefined()
  })

  it("returns the URL of the locale, and the root for other locales", () => {
    setConfig({ manifest: { name: { en: "My Site", fi: "Sivustoni" } } })
    expect(Manifest.url("en")).toBe("/manifest.webmanifest")
    expect(Manifest.url("fi")).toBe("/fi/manifest.webmanifest")
    expect(Manifest.url("de")).toBe("/manifest.webmanifest")
  })

  it("returns the path of your own manifest with the base", () => {
    vi.stubEnv("BASE_URL", "/docs/")
    setConfig({ manifest: "/site.webmanifest" })
    expect(Manifest.url()).toBe("/docs/site.webmanifest")
  })
})

describe("Manifest.build", () => {
  it("returns undefined for your own manifest", () => {
    setConfig({ manifest: "/site.webmanifest" })
    expect(Manifest.build()).toBeUndefined()
  })

  it("uses the light theme color and removes empty fields", () => {
    setConfig({
      themeColor: { light: "#ffffff", dark: "#000000" },
      manifest: { name: "My Site" },
    })
    expect(Manifest.build()).toEqual({
      name: "My Site",
      start_url: "/",
      scope: "/",
      display: "standalone",
      theme_color: "#ffffff",
    })
  })

  it("uses the texts of the locale and copies the extra fields", () => {
    setConfig({
      manifest: {
        name: { en: "My Site", fi: "Sivustoni" },
        startUrl: { en: "/", fi: "/fi/" },
        extra: { shortcuts: [{ name: "Blog" }] },
      },
    })
    expect(Manifest.build("fi")).toMatchObject({
      name: "Sivustoni",
      lang: "fi",
      start_url: "/fi/",
      shortcuts: [{ name: "Blog" }],
    })
  })
})
