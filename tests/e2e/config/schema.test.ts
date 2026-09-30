import { expect, test } from "@playwright/test"

test.describe("schema builders", () => {
  test("fill in the site name of the locale and absolute URLs", async ({ page }) => {
    await page.goto("/fi/schema")
    const script = page.locator("script[type='application/ld+json']")
    const [website, breadcrumbs] = JSON.parse((await script.textContent())!)
    expect(website).toEqual({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Config-sivusto",
      description: "Oletuskuvaus",
      url: "https://example.com/",
      inLanguage: "fi",
    })

    expect(breadcrumbs.itemListElement[1]).toEqual({
      "@type": "ListItem",
      position: 2,
      name: "Rakenne",
      item: "https://example.com/fi/schema",
    })
  })
})
