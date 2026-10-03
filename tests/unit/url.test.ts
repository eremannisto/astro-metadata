import { afterEach, describe, expect, it, vi } from "vitest"

import { url, withBase } from "../../src/lib/url.ts"

afterEach(() => {
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
