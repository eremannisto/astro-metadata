import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { schema } from "../../src/lib/schema.ts"

const KEY = Symbol.for("@mannisto/astro-metadata/config")

beforeEach(() => {
  vi.stubEnv("SITE", "https://example.com")
  ;(globalThis as Record<symbol, unknown>)[KEY] = {
    siteName: { en: "My Site", fi: "Sivustoni" },
    description: "The description",
  }
})

afterEach(() => {
  vi.unstubAllEnvs()
  delete (globalThis as Record<symbol, unknown>)[KEY]
})

describe("schema.website", () => {
  it("uses the name, the description and the URL of the site", () => {
    expect(schema.website()).toEqual({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "My Site",
      description: "The description",
      url: "https://example.com/",
    })
  })

  it("uses the name of the locale", () => {
    expect(schema.website({ locale: "fi" })).toMatchObject({ name: "Sivustoni", inLanguage: "fi" })
  })

  it("uses the options before the config", () => {
    expect(schema.website({ name: "Other", url: "/fi" })).toMatchObject({
      name: "Other",
      url: "https://example.com/fi",
    })
  })

  it("works without the integration", () => {
    delete (globalThis as Record<symbol, unknown>)[KEY]
    expect(JSON.parse(JSON.stringify(schema.website()))).toEqual({
      "@context": "https://schema.org",
      "@type": "WebSite",
      url: "https://example.com/",
    })
  })
})

describe("schema.organization", () => {
  it("makes the logo URL absolute", () => {
    expect(schema.organization({ logo: "/logo.png", sameAs: ["https://x.com/me"] })).toEqual({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "My Site",
      url: "https://example.com/",
      logo: "https://example.com/logo.png",
      sameAs: ["https://x.com/me"],
    })
  })
})

describe("schema.article", () => {
  it("builds the article with the site as the publisher", () => {
    const article = schema.article({
      title: "Hello",
      image: "/hello.jpg",
      published: new Date("2026-01-02T03:04:05Z"),
      modified: "2026-02-01",
      author: ["Ere", { name: "Anna", url: "/anna" }],
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
        { "@type": "Person", name: "Ere" },
        { "@type": "Person", name: "Anna", url: "https://example.com/anna" },
      ],
      publisher: { "@type": "Organization", name: "My Site", url: "https://example.com/" },
      mainEntityOfPage: "https://example.com/blog/hello",
    })
  })

  it("uses the type and the locale", () => {
    const article = schema.article({
      type: "BlogPosting",
      title: "Hei",
      author: "Ere",
      locale: "fi",
    })
    expect(article).toMatchObject({
      "@type": "BlogPosting",
      author: [{ "@type": "Person", name: "Ere" }],
      publisher: { name: "Sivustoni" },
      inLanguage: "fi",
    })
  })
})

describe("schema.breadcrumbs", () => {
  it("numbers the items and makes the URLs absolute", () => {
    expect(
      schema.breadcrumbs([
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
