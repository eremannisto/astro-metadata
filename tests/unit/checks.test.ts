import { describe, expect, it } from "vitest"

import { checkHead, findLink, parseHead } from "../../src/lib/checks.js"

const GOOD = `<!doctype html>
<html lang="en">
  <head>
    <title>Hello &amp; welcome</title>
    <meta name="description" content="A page about &quot;things&quot; > stuff">
    <link rel="canonical" href="https://example.com/hello">
    <meta property="og:image" content="https://example.com/og.jpg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <link rel="alternate" hreflang="fi" href="https://example.com/fi/hello">
    <script type="application/ld+json">{"@type":"WebSite"}</script>
  </head>
  <body></body>
</html>`

function messages(html: string): string[] {
  return checkHead(parseHead(html)).map((check) => {
    return `${check.level}: ${check.message}`
  })
}

describe("parseHead", () => {
  it("reads the title, the meta tags, the links and the schemas", () => {
    const head = parseHead(GOOD)
    expect(head.lang).toBe("en")
    expect(head.titles).toEqual(["Hello & welcome"])
    expect(head.meta.description).toBe('A page about "things" > stuff')
    expect(head.meta["og:image:width"]).toBe("1200")
    expect(findLink(head, "canonical")).toBe("https://example.com/hello")
    expect(head.links[1]).toMatchObject({ rel: "alternate", hreflang: "fi" })
    expect(head.schemas).toEqual(['{"@type":"WebSite"}'])
  })

  it("keeps the first value of a meta tag", () => {
    const head = parseHead(
      `<head><meta name="robots" content="index"><meta name="robots" content="noindex"></head>`
    )
    expect(head.meta.robots).toBe("index")
  })

  it("does not read tags after the head", () => {
    const head = parseHead(`<head></head><body><title>Icon</title></body>`)
    expect(head.titles).toEqual([])
  })
})

describe("checkHead", () => {
  it("finds no problems in a complete page", () => {
    expect(messages(GOOD)).toEqual([])
  })

  it("finds the missing values", () => {
    expect(messages("<html><head></head></html>")).toEqual([
      "error: The page has no title.",
      "warning: The html tag has no lang attribute.",
      "warning: The page has no description.",
      "warning: The page has no canonical URL.",
      "warning: The page has no og:image. Social cards show no image.",
    ])
  })

  it("finds values that are too long or not absolute", () => {
    const html = GOOD.replace("Hello &amp; welcome", "x".repeat(61))
      .replace("A page about", "y".repeat(161))
      .replace("https://example.com/hello", "/hello")
      .replace('<meta property="og:image:height" content="630">', "")
    expect(messages(html)).toEqual([
      "warning: The title has 61 characters. Search results show about 60.",
      expect.stringMatching(/^warning: The description has \d+ characters/),
      "warning: The canonical URL is not absolute. Set `site` in the Astro config.",
      "warning: The og:image has no width and height. The first share can show no image.",
    ])
  })

  it("finds two titles and invalid JSON-LD", () => {
    const html = GOOD.replace("</title>", "</title><title>Two</title>").replace(
      '{"@type":"WebSite"}',
      "{broken"
    )
    expect(messages(html)).toEqual([
      "error: The page has 2 title tags. Keep only one.",
      "error: A JSON-LD script does not contain valid JSON.",
    ])
  })

  it("skips the search and sharing checks for a noindex page", () => {
    const html = `<html lang="en"><head><title>Draft</title><meta name="robots" content="noindex, nofollow"></head></html>`
    expect(messages(html)).toEqual([
      "info: The robots tag contains noindex: search engines do not show the page.",
    ])
  })
})
