import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Schema } from "../../src/lib/schema.ts"
import { clearConfig, setConfig } from "./lib/config.ts"

beforeEach(() => {
  vi.stubEnv("SITE", "https://example.com")
  setConfig({
    siteName: { en: "My Site", fi: "Sivustoni" },
    description: "The description",
  })
})

afterEach(() => {
  vi.unstubAllEnvs()
  clearConfig()
})

describe("Schema.website", () => {
  it("uses the name, the description and the URL of the site", () => {
    expect(Schema.website()).toEqual({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "My Site",
      description: "The description",
      url: "https://example.com/",
    })
  })

  it("uses the name of the locale", () => {
    expect(Schema.website({ locale: "fi" })).toMatchObject({ name: "Sivustoni", inLanguage: "fi" })
  })

  it("uses the options before the config", () => {
    expect(Schema.website({ name: "Other", url: "/fi" })).toMatchObject({
      name: "Other",
      url: "https://example.com/fi",
    })
  })

  it("works without the integration", () => {
    clearConfig()
    expect(JSON.parse(JSON.stringify(Schema.website()))).toEqual({
      "@context": "https://schema.org",
      "@type": "WebSite",
      url: "https://example.com/",
    })
  })
})

describe("Schema.organization", () => {
  it("makes the logo URL absolute", () => {
    expect(Schema.organization({ logo: "/logo.png", sameAs: ["https://x.com/me"] })).toEqual({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "My Site",
      url: "https://example.com/",
      logo: "https://example.com/logo.png",
      sameAs: ["https://x.com/me"],
    })
  })
})

describe("Schema.article", () => {
  it("builds the article with the site as the publisher", () => {
    const article = Schema.article({
      title: "Hello",
      image: "/hello.jpg",
      published: new Date("2026-01-02T03:04:05Z"),
      modified: "2026-02-01",
      author: ["Acme Writer", { name: "Acme Editor", url: "/editor" }],
      url: "/blog/hello",
    })
    expect(JSON.parse(JSON.stringify(article))).toEqual({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Hello",
      image: ["https://example.com/hello.jpg"],
      datePublished: "2026-01-02T03:04:05.000Z",
      dateModified: "2026-02-01",
      author: [
        { "@type": "Person", name: "Acme Writer" },
        { "@type": "Person", name: "Acme Editor", url: "https://example.com/editor" },
      ],
      publisher: { "@type": "Organization", name: "My Site", url: "https://example.com/" },
      mainEntityOfPage: "https://example.com/blog/hello",
    })
  })

  it("uses the type and the locale", () => {
    const article = Schema.article({
      type: "BlogPosting",
      title: "Hei",
      author: "Acme Writer",
      locale: "fi",
    })
    expect(article).toMatchObject({
      "@type": "BlogPosting",
      author: [{ "@type": "Person", name: "Acme Writer" }],
      publisher: { name: "Sivustoni" },
      inLanguage: "fi",
    })
  })
})

describe("Schema.breadcrumbs", () => {
  it("numbers the items and makes the URLs absolute", () => {
    expect(
      Schema.breadcrumbs([
        { name: "Home", url: "/" },
        { name: "Blog", url: "/blog" },
      ])
    ).toEqual({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://example.com/" },
        { "@type": "ListItem", position: 2, name: "Blog", item: "https://example.com/blog" },
      ],
    })
  })
})

describe("Schema.stringify", () => {
  it("escapes the characters that can end the script tag", () => {
    const json = Schema.stringify({ name: "</script><b>&" })
    expect(json).not.toContain("</script>")
    expect(JSON.parse(json)).toEqual({ name: "</script><b>&" })
  })
})
