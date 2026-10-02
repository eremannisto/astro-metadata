import { describe, expect, it } from "vitest"

import {
  checkAssets,
  checkHead,
  checkSite,
  findLink,
  isIgnored,
  parseHead,
  validateCustomRules,
} from "../../src/lib/checks.js"
import type { CustomRule } from "../../src/lib/checks.js"
import { RULES } from "../../src/lib/rules.js"

const GOOD = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Hello &amp; welcome</title>
    <meta name="description" content="A page about &quot;things&quot; > stuff, with enough words to describe it.">
    <link rel="canonical" href="https://example.com/hello">
    <meta property="og:title" content="Hello">
    <meta property="og:description" content="A page about things.">
    <meta property="og:url" content="https://example.com/hello">
    <meta property="og:image" content="https://example.com/og.jpg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="A welcome sign">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="icon" href="/favicon.ico">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="alternate" hreflang="en" href="https://example.com/hello">
    <link rel="alternate" hreflang="fi" href="https://example.com/fi/hello">
    <link rel="alternate" hreflang="x-default" href="https://example.com/hello">
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite"}</script>
  </head>
  <body></body>
</html>`

/**
 * Returns the page with a part of the head replaced.
 */
function change(from: string, to: string): string {
  if (!GOOD.includes(from)) throw new Error(`Not in the page: ${from}`)
  return GOOD.replace(from, to)
}

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
    expect(head.charset).toBe("UTF-8")
    expect(head.meta.description).toMatch(/^A page about "things" > stuff/)
    expect(head.meta["og:image:width"]).toBe("1200")
    expect(findLink(head, "canonical")).toBe("https://example.com/hello")
    expect(head.links[4]).toMatchObject({ rel: "alternate", hreflang: "fi" })
    expect(head.schemas).toHaveLength(1)
  })

  it("keeps the first value of a meta tag", () => {
    const head = parseHead(
      `<head><meta name="robots" content="index"><meta name="robots" content="noindex"></head>`
    )
    expect(head.meta.robots).toBe("index")
    expect(head.metaCount.robots).toBe(2)
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

  it("gives each rule a unique id", () => {
    const ids = RULES.map((rule) => {
      return rule.id
    })
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("finds the missing values of an empty page", () => {
    expect(messages("<html><head></head></html>")).toEqual([
      "error: The page has no title.",
      "warning: The page has no `<meta charset>`. Browsers can show wrong characters.",
      "warning: The page has no `viewport` meta tag. Phones show the page zoomed out.",
      "warning: The `<html>` tag has no `lang` attribute.",
      "warning: The page has no favicon link.",
      "warning: The page has no description.",
      "warning: The page has no canonical URL.",
      "warning: The page has no `og:title`. Social sites use the `<title>`.",
      "warning: The page has no `og:description`. Some social cards show no description.",
      "warning: The page has no `og:image`. Social cards show no image.",
      "warning: The page has no `twitter:card`. Twitter (X) shows no card.",
    ])
  })

  it("finds values that are too long or not absolute", () => {
    const html = GOOD.replace("Hello &amp; welcome", "x".repeat(61))
      .replace("A page about &quot;", "y".repeat(161))
      .replaceAll("https://example.com/hello", "/hello")
      .replace('<meta property="og:image:height" content="630">', "")
    expect(messages(html)).toEqual([
      "warning: The title has 61 characters. Search results show about 60.",
      expect.stringMatching(/^warning: The description has \d+ characters/),
      "warning: The canonical URL is not absolute. Set `site` in the Astro config.",
      "warning: The `og:image` has no width and height. The first share can show no image.",
      "warning: An hreflang URL is not absolute. Search engines need absolute URLs.",
    ])
  })

  it("finds two titles, two canonical links and invalid JSON-LD", () => {
    const html = change("</title>", "</title><title>Two</title>")
      .replace('{"@context"', "{broken")
      .replace(
        '<link rel="icon"',
        '<link rel="canonical" href="https://example.com/x"><link rel="icon"'
      )
    expect(messages(html)).toEqual([
      "error: The page has 2 title tags. Keep only one.",
      "error: A JSON-LD script does not contain valid JSON.",
      "error: The page has 2 canonical links. Keep only one.",
    ])
  })

  it("checks the size of the og:image", () => {
    const small = change('content="1200"', 'content="400"').replace(
      'content="630"',
      'content="210"'
    )
    expect(messages(small)).toEqual([
      "warning: The `og:image` is 400 × 210 px. Social sites show it small. Use 1200 × 630 px.",
    ])

    const tiny = change('content="1200"', 'content="100"').replace('content="630"', 'content="100"')
    expect(messages(tiny)).toEqual([
      "error: The `og:image` is 100 × 100 px. Facebook does not show images smaller than 200 × 200 px.",
    ])
  })

  it("checks the Twitter (X) card and the og:url", () => {
    const html = change('content="summary_large_image"', 'content="large"').replace(
      '<meta property="og:url" content="https://example.com/hello">',
      '<meta property="og:url" content="https://example.com/other">'
    )
    expect(messages(html)).toEqual([
      "error: The `twitter:card` value `large` is not valid. Use `summary` or `summary_large_image`.",
      "warning: The `og:url` is not the same as the canonical URL. Social sites can count the shares two times.",
    ])
  })

  it("checks the hreflang links", () => {
    const html = change(
      '<link rel="alternate" hreflang="x-default" href="https://example.com/hello">',
      '<link rel="alternate" hreflang="fi" href="https://example.com/fi/other">'
    ).replace(
      'hreflang="en" href="https://example.com/hello"',
      'hreflang="en" href="https://example.com/en/hello"'
    )
    expect(messages(html)).toEqual([
      "warning: The hreflang links have no `x-default`. Add it for the users of other locales.",
      "warning: The hreflang links do not include this page. Each locale version must also link to itself.",
      "warning: The hreflang `fi` is on more than one link. Keep one link for each locale.",
    ])
  })

  it("gives information that is not a problem", () => {
    const html = change('<link rel="apple-touch-icon" href="/apple-touch-icon.png">', "")
      .replace('<meta property="og:image:alt" content="A welcome sign">', "")
      .replace(/content="A page about[^"]*"/, 'content="Too short."')
    expect(messages(html)).toEqual([
      "info: The page has no `apple-touch-icon`. iOS shows a screenshot of the page on the home screen.",
      "info: The description has 10 characters. Use 50 to 160 characters.",
      "info: The `og:image` has no `og:image:alt`. Screen readers can not describe the image.",
    ])
  })

  it("skips the search and sharing checks for a noindex page", () => {
    const html = `<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><link rel="icon" href="/favicon.svg"><link rel="apple-touch-icon" href="/a.png"><title>Draft</title><meta name="robots" content="noindex, nofollow"></head></html>`
    expect(messages(html)).toEqual([
      "info: The robots tag contains `noindex`: search engines do not show the page.",
    ])
  })
})

describe("more head rules", () => {
  it("finds placeholder text of a template", () => {
    const html = change("Hello &amp; welcome", "undefined | My Site").replace(
      '<meta property="og:description" content="A page about things.">',
      '<meta property="og:description" content="{{ post.description }}">'
    )
    expect(messages(html)).toEqual([
      'error: The title contains placeholder text: "undefined | My Site".',
      'error: The description contains placeholder text: "{{ post.description }}".',
    ])
  })

  it("does not take a normal word for placeholder text", () => {
    expect(messages(change("Hello &amp; welcome", "Undefined behavior in C"))).toEqual([])
  })

  it("finds missing structured data fields", () => {
    const html = change(
      '{"@context":"https://schema.org","@type":"WebSite"}',
      JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "Event", name: "Opening" },
          { "@type": "BlogPosting", headline: "Hello", image: "/a.jpg" },
          { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", name: "Home" }] },
        ],
      })
    )
    expect(messages(html)).toEqual([
      "error: The `Event` structured data has no `startDate` and `location`. Google shows no rich result.",
      "error: An item of the `BreadcrumbList` has no `position` or `name`.",
      "warning: The `BlogPosting` structured data has no `datePublished` and `author`. Google recommends them.",
    ])
  })

  it("checks the lang value and the og:locale", () => {
    const html = change('<html lang="en">', '<html lang="en_US">').replace(
      '<meta name="twitter:card"',
      '<meta property="og:locale" content="fi_FI"><meta name="twitter:card"'
    )
    expect(messages(html)).toEqual([
      "warning: The `lang` value `en_US` is not valid. Use a code like `en` or `en-US`.",
      "warning: The `og:locale` `fi_FI` is not the language of the `lang` attribute `en_US`.",
    ])
  })

  it("checks the ratio of the og:image", () => {
    const square = change('content="1200"', 'content="800"').replace(
      'content="630"',
      'content="800"'
    )
    expect(messages(square)).toEqual([
      "warning: The `og:image` ratio is 1.00:1. Social sites crop it to about 1.91:1.",
    ])
    // A small card can use a square image
    expect(messages(square.replace('content="summary_large_image"', 'content="summary"'))).toEqual(
      []
    )
  })

  it("turns off rules with the ignore list", () => {
    const head = parseHead("<html><head></head></html>")
    const ids = checkHead(head, { ignore: ["title-missing", "lang-missing"] }).map((check) => {
      return check.id
    })
    expect(ids).not.toContain("title-missing")
    expect(ids).not.toContain("lang-missing")
    expect(ids).toContain("charset-missing")
  })
})

describe("checkAssets", () => {
  const head = parseHead(GOOD)

  it("finds files that do not load", () => {
    const checks = checkAssets(head, {
      image: { url: "https://example.com/og.jpg", ok: false, status: 404 },
      icons: [{ url: "/favicon.ico", ok: false }],
    })
    expect(
      checks.map((check) => {
        return check.message
      })
    ).toEqual([
      "The `og:image` does not load: the server answered 404.",
      "The favicon `/favicon.ico` does not load.",
    ])
  })

  it("checks the format, the file size and the real size of the image", () => {
    const image = { url: "/og.jpg", ok: true, bytes: 900 * 1024, width: 1200, height: 600 }
    expect(
      checkAssets(head, { image: { ...image, type: "image/gif" }, icons: [] }).map((check) => {
        return check.message
      })
    ).toEqual([
      "The `og:image` is a `image/gif` file. Use JPEG, PNG or WebP: some sites show no other formats.",
      "The `og:image` file is 900 KB. WhatsApp shows no image over 600 KB.",
      "The `og:image` is 1200 × 600 px, but `og:image:width` and `og:image:height` give 1200 × 630.",
    ])
    expect(
      checkAssets(head, { image: { ...image, type: "image/svg+xml" }, icons: [] })[0].message
    ).toBe("The `og:image` is an SVG file. Social sites do not show SVG images.")
  })
})

describe("checkSite", () => {
  /**
   * Returns a built page with a title, a description, a canonical URL and hreflang links.
   */
  function page(path: string, title: string, hreflang: Record<string, string> = {}) {
    const links = Object.entries(hreflang).map(([locale, href]) => {
      return `<link rel="alternate" hreflang="${locale}" href="${href}">`
    })
    return {
      path,
      head: parseHead(
        `<head><title>${title}</title><meta name="description" content="Same"><link rel="canonical" href="https://example.com${path}">${links.join("")}</head>`
      ),
    }
  }

  it("finds the same title and description on more pages", () => {
    const problems = checkSite([page("/a", "Same"), page("/b", "Same"), page("/c", "Other")])
    expect(
      problems.get("/a")?.map((check) => {
        return check.message
      })
    ).toEqual([
      "The title is the same as on /b.",
      "The description is the same as on /b and 1 other page.",
    ])
    expect(
      problems.get("/c")?.map((check) => {
        return check.id
      })
    ).toEqual(["description-not-unique"])
  })

  it("finds hreflang links that do not link back", () => {
    const problems = checkSite(
      [
        page("/en", "English", { en: "https://example.com/en", fi: "https://example.com/fi" }),
        page("/fi", "Suomi", { fi: "https://example.com/fi" }),
      ],
      { ignore: ["description-not-unique"] }
    )
    expect(
      problems.get("/en")?.map((check) => {
        return check.message
      })
    ).toEqual([
      "The hreflang page /fi does not link back to this page. Search engines ignore one-way hreflang links.",
    ])
    expect(problems.has("/fi")).toBe(false)
  })
})

describe("isIgnored", () => {
  it("matches a path with or without the slash at the end", () => {
    expect(isIgnored("/404", ["/404"])).toBe(true)
    expect(isIgnored("/404/", ["/404"])).toBe(true)
    expect(isIgnored("/4040", ["/404"])).toBe(false)
  })

  it("matches one part of the path with * and any parts with **", () => {
    expect(isIgnored("/drafts/hello", ["/drafts/*"])).toBe(true)
    expect(isIgnored("/drafts/2026/hello", ["/drafts/*"])).toBe(false)
    expect(isIgnored("/drafts/2026/hello/", ["/drafts/**"])).toBe(true)
  })

  it("ignores no page without patterns", () => {
    expect(isIgnored("/", undefined)).toBe(false)
  })
})

describe("custom rules", () => {
  const brand: CustomRule = {
    id: "title-brand",
    level: "warning",
    message: "The title must contain `Acme Studio`.",
    check(head) {
      return !head.titles[0]?.includes("Acme Studio")
    },
  }

  it("runs a custom rule after the rules of the package", () => {
    const checks = checkHead(parseHead(GOOD), { custom: [brand] })
    expect(checks).toEqual([
      {
        id: "title-brand",
        field: "custom",
        level: "warning",
        message: "The title must contain `Acme Studio`.",
      },
    ])
    expect(
      checkHead(parseHead(change("Hello &amp; welcome", "Acme Studio")), { custom: [brand] })
    ).toEqual([])
  })

  it("makes the message from the head, and turns the rule off with the ignore list", () => {
    const length: CustomRule = {
      id: "title-length",
      field: "title",
      level: "info",
      message(head) {
        return `The title has ${head.titles[0]?.length} characters.`
      },
      check() {
        return true
      },
    }
    const head = parseHead(GOOD)
    expect(checkHead(head, { custom: [length] })[0]).toMatchObject({
      field: "title",
      message: "The title has 15 characters.",
    })
    expect(checkHead(head, { custom: [length], ignore: ["title-length"] })).toEqual([])
  })

  it("shows an error in a custom rule as its problem", () => {
    const broken: CustomRule = {
      ...brand,
      check() {
        throw new Error("Oops")
      },
    }
    expect(checkHead(parseHead(GOOD), { custom: [broken] })[0].message).toBe(
      "The custom rule `title-brand` failed: Oops"
    )
  })

  it("throws for a custom rule with a mistake", () => {
    expect(() => {
      validateCustomRules([brand])
    }).not.toThrow()
    expect(() => {
      validateCustomRules([{ ...brand, id: "title-missing" }])
    }).toThrow('The custom rule "title-missing" has the id of another rule.')
    expect(() => {
      validateCustomRules([{ ...brand, level: "fatal" } as unknown as CustomRule])
    }).toThrow('needs a `level`: "error", "warning" or "info".')
    expect(() => {
      validateCustomRules([brand, brand])
    }).toThrow("has the id of another rule")
  })
})
