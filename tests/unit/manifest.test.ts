import { afterEach, describe, expect, it, vi } from "vitest"

import { buildManifest, manifestPaths, manifestUrl } from "../../src/lib/manifest.ts"

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("manifestPaths", () => {
  it("returns no paths without a manifest", () => {
    expect(manifestPaths({})).toEqual([])
  })

  it("returns one root path for a manifest with one language", () => {
    expect(manifestPaths({ manifest: { name: "My Site" } })).toEqual([{}])
  })

  it("returns the root for the first locale and a prefix for the others", () => {
    const config = { manifest: { name: { en: "My Site", fi: "Sivustoni" } } }
    expect(manifestPaths(config)).toEqual([
      { lang: undefined, locale: "en" },
      { lang: "fi", locale: "fi" },
    ])
  })
})

describe("manifestUrl", () => {
  it("returns undefined without a manifest", () => {
    expect(manifestUrl({}, "fi")).toBeUndefined()
  })

  it("returns the URL of the locale, and the root for other locales", () => {
    const config = { manifest: { name: { en: "My Site", fi: "Sivustoni" } } }
    expect(manifestUrl(config, "en")).toBe("/manifest.webmanifest")
    expect(manifestUrl(config, "fi")).toBe("/fi/manifest.webmanifest")
    expect(manifestUrl(config, "de")).toBe("/manifest.webmanifest")
  })

  it("adds the base", () => {
    vi.stubEnv("BASE_URL", "/docs/")
    expect(manifestUrl({ manifest: { name: "My Site" } })).toBe("/docs/manifest.webmanifest")
  })
})

describe("buildManifest", () => {
  it("uses the light theme color and removes empty fields", () => {
    const config = {
      themeColor: { light: "#ffffff", dark: "#000000" },
      manifest: { name: "My Site" },
    }
    expect(buildManifest(config)).toEqual({
      name: "My Site",
      start_url: "/",
      scope: "/",
      display: "standalone",
      theme_color: "#ffffff",
    })
  })

  it("copies the extra fields unchanged", () => {
    const config = { manifest: { name: "My Site", extra: { shortcuts: [{ name: "Blog" }] } } }
    expect(buildManifest(config).shortcuts).toEqual([{ name: "Blog" }])
  })
})
