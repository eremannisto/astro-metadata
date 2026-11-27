import { afterEach, describe, expect, it } from "vitest"

import { RobotsTxt } from "../../src/lib/robots-txt.ts"
import { clearConfig, setConfig } from "./lib/config.ts"

afterEach(() => {
  clearConfig()
})

describe("RobotsTxt.blocked", () => {
  it("blocks no crawlers by default", () => {
    setConfig({ robots: { ai: {} } })
    expect(RobotsTxt.blocked()).toEqual([])
  })

  it("blocks the search crawlers with search false", () => {
    setConfig({ robots: { ai: { search: false } } })
    expect(RobotsTxt.blocked()).toEqual([
      "OAI-SearchBot",
      "ChatGPT-User",
      "Claude-SearchBot",
      "Claude-User",
      "PerplexityBot",
      "Perplexity-User",
    ])
  })

  it("blocks the training crawlers and the unknown crawlers with training false", () => {
    setConfig({ robots: { ai: { training: false } } })
    const blocked = RobotsTxt.blocked()
    expect(blocked).toEqual(
      expect.arrayContaining(["GPTBot", "ClaudeBot", "Google-Extended", "Bytespider", "CCBot"])
    )
    expect(blocked).not.toContain("OAI-SearchBot")
    expect(blocked).not.toContain("Claude-User")
  })

  it("never blocks Apple search and the Facebook link previews", () => {
    setConfig({ robots: { ai: { search: false, training: false } } })
    const blocked = RobotsTxt.blocked().map((name) => {
      return name.toLowerCase()
    })
    expect(blocked).not.toContain("applebot")
    expect(blocked).not.toContain("facebookexternalhit")
    expect(blocked).toContain("applebot-extended")
  })

  it("has each crawler one time", () => {
    setConfig({ robots: { ai: { search: false, training: false } } })
    const blocked = RobotsTxt.blocked().map((name) => {
      return name.toLowerCase()
    })
    expect(new Set(blocked).size).toBe(blocked.length)
  })
})

describe("RobotsTxt.build", () => {
  it("allows all crawlers without blocked AI crawlers", () => {
    setConfig({ robots: { ai: {} } })
    expect(RobotsTxt.build()).toBe("User-agent: *\nAllow: /\n")
  })

  it("blocks the AI crawlers in their own group", () => {
    setConfig({ robots: { ai: { search: false } } })
    expect(RobotsTxt.build()).toBe(
      [
        "User-agent: OAI-SearchBot",
        "User-agent: ChatGPT-User",
        "User-agent: Claude-SearchBot",
        "User-agent: Claude-User",
        "User-agent: PerplexityBot",
        "User-agent: Perplexity-User",
        "Disallow: /",
        "",
        "User-agent: *",
        "Allow: /",
        "",
      ].join("\n")
    )
  })

  it("links the sitemap with the site and the base", () => {
    setConfig({ robots: { ai: {} }, sitemap: true, site: "https://example.com", base: "/docs/" })
    expect(RobotsTxt.build()).toBe(
      "User-agent: *\nAllow: /\n\nSitemap: https://example.com/docs/sitemap-index.xml\n"
    )
  })

  it("does not link the sitemap without the site", () => {
    setConfig({ robots: { ai: {} }, sitemap: true })
    expect(RobotsTxt.build()).toBe("User-agent: *\nAllow: /\n")
  })
})
