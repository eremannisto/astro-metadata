import { describe, expect, it } from "vitest"

import { defaultFaviconFiles, resolveFaviconFiles } from "../../src/lib/favicon-files.js"

describe("defaultFaviconFiles", () => {
  it("adds favicon.svg only for an SVG source", () => {
    const paths = (svg: boolean) => {
      return defaultFaviconFiles(svg).map((file) => {
        return file.path
      })
    }
    expect(paths(true)).toEqual([
      "/favicon.ico",
      "/favicon.svg",
      "/favicon-16.png",
      "/favicon-32.png",
      "/apple-touch-icon.png",
      "/favicon-192.png",
      "/favicon-512.png",
    ])
    expect(paths(false)).not.toContain("/favicon.svg")
  })
})

describe("resolveFaviconFiles", () => {
  it("finds the use of each file from its name and format", () => {
    expect(resolveFaviconFiles(defaultFaviconFiles(true), true)).toEqual([
      { path: "/favicon.ico", type: "ico", use: "icon", sizes: [16, 32] },
      { path: "/favicon.svg", type: "svg", use: "icon", sizes: [] },
      { path: "/favicon-16.png", type: "png", use: "icon", sizes: [16] },
      { path: "/favicon-32.png", type: "png", use: "icon", sizes: [32] },
      { path: "/apple-touch-icon.png", type: "png", use: "apple", sizes: [180] },
      { path: "/favicon-192.png", type: "png", use: "manifest", sizes: [192] },
      { path: "/favicon-512.png", type: "png", use: "manifest", sizes: [512] },
    ])
  })

  it("puts PNG files of 192 px or larger into the manifest", () => {
    const files = resolveFaviconFiles(
      [
        { path: "/favicon-96.png", size: 96 },
        { path: "/favicon-191.png", size: 191 },
        { path: "/favicon-192.png", size: 192 },
        { path: "/apple-touch-icon.png", size: 256 },
      ],
      false
    )
    const uses = files.map((file) => {
      return file.use
    })
    expect(uses).toEqual(["icon", "icon", "manifest", "apple"])
  })

  it("sorts the ICO sizes and accepts one size", () => {
    const files = resolveFaviconFiles(
      [
        { path: "/favicon.ico", sizes: [48, 16, 32] },
        { path: "/small.ico", size: 16 },
      ],
      false
    )
    expect(files[0].sizes).toEqual([16, 32, 48])
    expect(files[1].sizes).toEqual([16])
  })

  it("rejects files that the package can not generate", () => {
    const cases: [Parameters<typeof resolveFaviconFiles>[0], boolean, string][] = [
      [[{ path: "favicon.ico" }], false, 'must start with "/"'],
      [[{ path: "/favicon.ico" }, { path: "/favicon.ico" }], false, "two times"],
      [[{ path: "/favicon.webp", size: 32 }], false, "must be an .ico, .png or .svg file"],
      [[{ path: "/favicon.svg" }], false, "needs an SVG source"],
      [[{ path: "/favicon.svg", size: 32 }], true, "has no size"],
      [[{ path: "/favicon.ico", sizes: [512] }], false, "from 1 to 256"],
      [[{ path: "/favicon.ico", size: 16, sizes: [32] }], false, '"size" and "sizes"'],
      [[{ path: "/favicon-96.png" }], false, 'needs a "size"'],
      [[{ path: "/favicon-96.png", sizes: [96] }], false, 'use "size", not "sizes"'],
    ]
    for (const [files, svg, message] of cases) {
      expect(() => {
        return resolveFaviconFiles(files, svg)
      }).toThrow(message)
    }
  })
})
