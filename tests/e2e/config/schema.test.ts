import { expect, test } from "@playwright/test"

test.describe("structured data", () => {
  test("gives the page the site of the locale, and the breadcrumbs", async ({ page }) => {
    await page.goto("/fi/schema")
    const script = page.locator("script[type='application/ld+json']")
    const [website, publisher, breadcrumbs] = JSON.parse((await script.textContent())!)["@graph"]
    expect(website).toEqual({
      "@type": "WebSite",
      "@id": "https://example.com/#website",
      name: "Config-sivusto",
      description: "Oletuskuvaus",
      url: "https://example.com/",
      inLanguage: "fi",
      publisher: { "@id": "https://example.com/#publisher" },
    })
    expect(publisher).toMatchObject({ "@type": "Organization", name: "Config-sivusto" })

    expect(breadcrumbs.itemListElement[1]).toEqual({
      "@type": "ListItem",
      position: 2,
      name: "Rakenne",
      item: "https://example.com/fi/schema",
    })
  })
})
