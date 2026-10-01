import { afterEach, describe, expect, it, vi } from "vitest"

import { Site } from "../../src/lib/site.ts"
import { clearConfig, setConfig } from "./lib/config.ts"

afterEach(() => {
  clearConfig()
  vi.unstubAllEnvs()
})

describe("Site.config", () => {
  it("returns only the site values", () => {
    setConfig({ siteName: "My Site", trailingSlash: "always", buildFormat: "directory" })
    expect(Site.config.siteName).toBe("My Site")
    expect(Site.config).not.toHaveProperty("trailingSlash")
  })
})

describe("Site.title", () => {
  it("puts the title into the template of the locale", () => {
    setConfig({ titleTemplate: { en: "%s | My Site", fi: "%s | Sivustoni" } })
    expect(Site.title("About")).toBe("About | My Site")
    expect(Site.title("Tietoa", "fi")).toBe("Tietoa | Sivustoni")
  })

  it("returns the site name for a page without a title", () => {
    setConfig({ siteName: "My Site", titleTemplate: "%s | My Site" })
    expect(Site.title()).toBe("My Site")
  })

  it("keeps the title for a template without %s, and without a template", () => {
    setConfig({ titleTemplate: "My Site" })
    expect(Site.title("About")).toBe("About")
    clearConfig()
    expect(Site.title("About")).toBe("About")
  })

  it("keeps $ patterns in the title as text", () => {
    setConfig({ titleTemplate: "%s | My Site" })
    expect(Site.title("Save $& now")).toBe("Save $& now | My Site")
  })
})

describe("Site.pageUrl", () => {
  it("follows trailingSlash", () => {
    vi.stubEnv("SITE", "https://example.com")
    setConfig({ trailingSlash: "always", buildFormat: "file" })
    expect(Site.pageUrl("/blog")).toBe("https://example.com/blog/")
    setConfig({ trailingSlash: "never", buildFormat: "directory" })
    expect(Site.pageUrl("/blog/")).toBe("https://example.com/blog")
  })

  it("follows build.format with trailingSlash ignore", () => {
    vi.stubEnv("SITE", "https://example.com")
    setConfig({ trailingSlash: "ignore", buildFormat: "directory" })
    expect(Site.pageUrl("/blog")).toBe("https://example.com/blog/")
    setConfig({ trailingSlash: "ignore", buildFormat: "file" })
    expect(Site.pageUrl("/blog/")).toBe("https://example.com/blog")
    setConfig({ trailingSlash: "ignore", buildFormat: "preserve" })
    expect(Site.pageUrl("/blog")).toBe("https://example.com/blog")
  })

  it("keeps the root, files, queries and absolute URLs unchanged", () => {
    vi.stubEnv("SITE", "https://example.com")
    setConfig({ trailingSlash: "always", buildFormat: "directory" })
    expect(Site.pageUrl("/")).toBe("https://example.com/")
    expect(Site.pageUrl("/feed.xml")).toBe("https://example.com/feed.xml")
    expect(Site.pageUrl("/blog?page=2")).toBe("https://example.com/blog?page=2")
    expect(Site.pageUrl("https://other.com/a")).toBe("https://other.com/a")
  })

  it("keeps the path unchanged without the integration", () => {
    vi.stubEnv("SITE", "https://example.com")
    expect(Site.pageUrl("/blog")).toBe("https://example.com/blog")
  })
})
