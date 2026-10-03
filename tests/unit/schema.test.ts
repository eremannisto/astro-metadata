import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Schema } from "../../src/lib/schema.ts"
import type { SchemaPage } from "../../src/lib/schema.ts"
import { clearConfig, setConfig } from "./lib/config.ts"

const PAGE: SchemaPage = { url: "https://example.com/blog/hello/" }

/**
 * Returns the items of the graph of a page.
 */
function items(page: Partial<SchemaPage> = {}): Record<string, unknown>[] {
  const graph = Schema.graph({ ...PAGE, ...page }) as { "@graph": Record<string, unknown>[] }
  return JSON.parse(JSON.stringify(graph["@graph"]))
}

beforeEach(() => {
  vi.stubEnv("SITE", "https://example.com")
  setConfig({
    siteName: { en: "Acme Studio", fi: "Acme Studio Suomi" },
    description: "Tools for small teams.",
  })
})

afterEach(() => {
  vi.unstubAllEnvs()
  clearConfig()
})

describe("Schema.graph", () => {
  it("gives each page the website and an organization with the site name", () => {
    const graph = Schema.graph(PAGE)
    expect(JSON.parse(JSON.stringify(graph))).toEqual({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": "https://example.com/#website",
          name: "Acme Studio",
          description: "Tools for small teams.",
          url: "https://example.com/",
          publisher: { "@id": "https://example.com/#publisher" },
        },
        {
          "@type": "Organization",
          "@id": "https://example.com/#publisher",
          name: "Acme Studio",
          url: "https://example.com/",
        },
      ],
    })
  })

  it("uses the values of the locale", () => {
    const [website, publisher] = items({ locale: "fi" })
    expect(website).toMatchObject({ name: "Acme Studio Suomi", inLanguage: "fi" })
    expect(publisher).toMatchObject({ name: "Acme Studio Suomi" })
  })

  it("uses the publisher of the config", () => {
    setConfig({
      siteName: "Acme Studio",
      schema: { publisher: { logo: "/logo.png", sameAs: ["https://github.com/acme"] } },
    })
    expect(items()[1]).toMatchObject({
      "@type": "Organization",
      logo: "https://example.com/logo.png",
      sameAs: ["https://github.com/acme"],
    })

    setConfig({
      siteName: "Acme Studio",
      schema: { publisher: { type: "Person", logo: "/a.png" } },
    })
    expect(items()[1]).toEqual({
      "@type": "Person",
      "@id": "https://example.com/#publisher",
      name: "Acme Studio",
      url: "https://example.com/",
    })
  })

  it("builds the article of a page with the type article", () => {
    const article = items({
      type: "article",
      title: "Hello",
      description: "The first post.",
      image: "https://example.com/hello.jpg",
      published: new Date("2026-01-02T03:04:05Z"),
      modified: "2026-02-01",
      author: ["Acme Writer", { name: "Acme Editor", url: "/editor" }],
    })[2]
    expect(article).toEqual({
      "@type": "Article",
      "@id": "https://example.com/blog/hello/#article",
      headline: "Hello",
      description: "The first post.",
      image: ["https://example.com/hello.jpg"],
      datePublished: "2026-01-02T03:04:05.000Z",
      dateModified: "2026-02-01",
      author: [
        { "@type": "Person", name: "Acme Writer" },
        { "@type": "Person", name: "Acme Editor", url: "https://example.com/editor" },
      ],
      publisher: { "@id": "https://example.com/#publisher" },
      mainEntityOfPage: "https://example.com/blog/hello/",
    })
  })

  it("numbers the breadcrumbs and makes the URLs absolute", () => {
    const breadcrumbs = items({
      breadcrumbs: [
        { name: "Home", url: "/" },
        { name: "Blog", url: "/blog" },
      ],
    })[2]
    expect(breadcrumbs).toEqual({
      "@type": "BreadcrumbList",
      "@id": "https://example.com/blog/hello/#breadcrumbs",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://example.com/" },
        { "@type": "ListItem", position: 2, name: "Blog", item: "https://example.com/blog" },
      ],
    })
  })

  it("adds your own items without their context", () => {
    const product = items({
      items: [{ "@context": "https://schema.org", "@type": "Product", name: "Desk" }],
    })[2]
    expect(product).toEqual({ "@type": "Product", name: "Desk" })
  })

  it("turns off the site data with schema: false", () => {
    setConfig({ siteName: "Acme Studio", schema: false })
    expect(Schema.graph(PAGE)).toBeUndefined()
    expect(items({ breadcrumbs: [{ name: "Home", url: "/" }] })).toHaveLength(1)
  })

  it("has no site data without a site name", () => {
    clearConfig()
    expect(Schema.graph(PAGE)).toBeUndefined()
  })
})

describe("Schema.stringify", () => {
  it("escapes the characters that can end the script tag", () => {
    const json = Schema.stringify({ name: "</script><b>&" })
    expect(json).not.toContain("</script>")
    expect(JSON.parse(json)).toEqual({ name: "</script><b>&" })
  })
})
