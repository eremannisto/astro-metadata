import { afterEach, describe, expect, it, vi } from "vitest"

import { pageUrl, url, withBase } from "../../src/lib/url.ts"
import { clearConfig, setConfig } from "./lib/config.ts"

afterEach(() => {
  clearConfig()
  vi.unstubAllEnvs()
})

describe("url", () => {
  it("returns an absolute URL with the site", () => {
    vi.stubEnv("SITE", "https://example.com")
    expect(url("/og.jpg")).toBe("https://example.com/og.jpg")
  })

  it("adds the base", () => {
    vi.stubEnv("SITE", "https://example.com")
    vi.stubEnv("BASE_URL", "/docs/")
    expect(url("/og.jpg")).toBe("https://example.com/docs/og.jpg")
  })

  it("does not add the base twice", () => {
    vi.stubEnv("SITE", "https://example.com")
    vi.stubEnv("BASE_URL", "/docs")
    expect(url("/docs/og.jpg")).toBe("https://example.com/docs/og.jpg")
    expect(url("/docs")).toBe("https://example.com/docs")
  })

  it("keeps absolute URLs unchanged", () => {
    vi.stubEnv("SITE", "https://example.com")
    expect(url("https://cdn.example.org/og.jpg")).toBe("https://cdn.example.org/og.jpg")
    expect(url("//cdn.example.org/og.jpg")).toBe("//cdn.example.org/og.jpg")
    expect(url("data:image/png;base64,AAA")).toBe("data:image/png;base64,AAA")
  })

  it("returns the path with the base without a site", () => {
    vi.stubEnv("SITE", "")
    vi.stubEnv("BASE_URL", "/docs/")
    expect(url("/og.jpg")).toBe("/docs/og.jpg")
  })

  it("accepts a path without a leading slash", () => {
    vi.stubEnv("SITE", "https://example.com")
    expect(url("og.jpg")).toBe("https://example.com/og.jpg")
  })
})

describe("withBase", () => {
  it("returns the path unchanged with the root base", () => {
    vi.stubEnv("BASE_URL", "/")
    expect(withBase("/favicon.ico")).toBe("/favicon.ico")
  })

  it("adds a base with or without a trailing slash", () => {
    vi.stubEnv("BASE_URL", "/docs/")
    expect(withBase("/favicon.ico")).toBe("/docs/favicon.ico")
    vi.stubEnv("BASE_URL", "/docs")
    expect(withBase("/favicon.ico")).toBe("/docs/favicon.ico")
  })
})

describe("pageUrl", () => {
  it("follows trailingSlash", () => {
    vi.stubEnv("SITE", "https://example.com")
    setConfig({ trailingSlash: "always", buildFormat: "file" })
    expect(pageUrl("/blog")).toBe("https://example.com/blog/")
    setConfig({ trailingSlash: "never", buildFormat: "directory" })
    expect(pageUrl("/blog/")).toBe("https://example.com/blog")
  })

  it("follows build.format with trailingSlash ignore", () => {
    vi.stubEnv("SITE", "https://example.com")
    setConfig({ trailingSlash: "ignore", buildFormat: "directory" })
    expect(pageUrl("/blog")).toBe("https://example.com/blog/")
    setConfig({ trailingSlash: "ignore", buildFormat: "file" })
    expect(pageUrl("/blog/")).toBe("https://example.com/blog")
    setConfig({ trailingSlash: "ignore", buildFormat: "preserve" })
    expect(pageUrl("/blog")).toBe("https://example.com/blog")
  })

  it("keeps the root, files, queries and absolute URLs unchanged", () => {
    vi.stubEnv("SITE", "https://example.com")
    setConfig({ trailingSlash: "always", buildFormat: "directory" })
    expect(pageUrl("/")).toBe("https://example.com/")
    expect(pageUrl("/feed.xml")).toBe("https://example.com/feed.xml")
    expect(pageUrl("/blog?page=2")).toBe("https://example.com/blog?page=2")
    expect(pageUrl("https://other.com/a")).toBe("https://other.com/a")
  })

  it("keeps the path unchanged without the integration", () => {
    vi.stubEnv("SITE", "https://example.com")
    expect(pageUrl("/blog")).toBe("https://example.com/blog")
  })
})

describe("pageUrl with many slashes", () => {
  it("removes all slashes at the end before it adds one", () => {
    vi.stubEnv("SITE", "https://example.com")
    setConfig({ trailingSlash: "always", buildFormat: "directory" })
    expect(pageUrl("/blog///")).toBe("https://example.com/blog/")
    setConfig({ trailingSlash: "never", buildFormat: "directory" })
    expect(pageUrl("/blog///")).toBe("https://example.com/blog")
  })
})
