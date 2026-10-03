import { afterEach, describe, expect, it, vi } from "vitest"

import { defaultFaviconFiles, resolveFaviconFiles } from "../../src/lib/favicon-files.js"
import { Favicon } from "../../src/lib/favicon.ts"
import { clearConfig, setConfig } from "./lib/config.ts"

afterEach(() => {
  clearConfig()
  vi.unstubAllEnvs()
})

function useFavicons(svg: boolean): void {
  setConfig({
    favicon: {
      source: "/project/logo.svg",
      background: "#ffffff",
      svg,
      hash: "1a2b3c4d",
      sharp: "/project/node_modules/sharp/lib/index.js",
      files: resolveFaviconFiles(defaultFaviconFiles(svg), svg),
    },
  })
}

describe("Favicon without the option", () => {
  it("has no config, files, links or icons", () => {
    expect(Favicon.config).toBeUndefined()
    expect(Favicon.files).toEqual([])
    expect(Favicon.links()).toEqual([])
    expect(Favicon.icons()).toEqual([])
  })
})

describe("Favicon.config", () => {
  it("does not show the path of sharp", () => {
    useFavicons(true)
    expect(Favicon.config).toMatchObject({ source: "/project/logo.svg", hash: "1a2b3c4d" })
    expect(Favicon.config).not.toHaveProperty("sharp")
  })
})

describe("Favicon.url", () => {
  it("adds the base and the hash", () => {
    vi.stubEnv("BASE_URL", "/docs/")
    useFavicons(true)
    expect(Favicon.url("/favicon.ico")).toBe("/docs/favicon.ico?v=1a2b3c4d")
  })
})

describe("Favicon.links", () => {
  it("returns the link tags in the recommended order", () => {
    useFavicons(true)
    expect(Favicon.links()).toEqual([
      { rel: "icon", href: "/favicon.ico?v=1a2b3c4d", type: "image/x-icon", sizes: "32x32" },
      { rel: "icon", href: "/favicon-16.png?v=1a2b3c4d", type: "image/png", sizes: "16x16" },
      { rel: "icon", href: "/favicon-32.png?v=1a2b3c4d", type: "image/png", sizes: "32x32" },
      { rel: "icon", href: "/favicon.svg?v=1a2b3c4d", type: "image/svg+xml", sizes: undefined },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png?v=1a2b3c4d", sizes: "180x180" },
    ])
  })
})

describe("Favicon.icons", () => {
  it("returns the PNG files of 192 px or larger", () => {
    useFavicons(false)
    expect(Favicon.icons()).toEqual([
      { src: "/favicon-192.png?v=1a2b3c4d", sizes: "192x192", type: "image/png" },
      { src: "/favicon-512.png?v=1a2b3c4d", sizes: "512x512", type: "image/png" },
    ])
  })
})

describe("Favicon.generate", () => {
  it("returns a 404 response for a path that is not in the config", async () => {
    useFavicons(true)
    expect((await Favicon.generate("/other.png")).status).toBe(404)
  })
})
