import { expect, test } from "@playwright/test"
import type { Page } from "@playwright/test"

/**
 * Returns the hreflang links of the page: { locale: URL }.
 */
async function hreflang(page: Page): Promise<Record<string, string>> {
  return page.locator("link[rel='alternate'][hreflang]").evaluateAll((links) => {
    return Object.fromEntries(
      links.map((link) => {
        return [link.getAttribute("hreflang"), link.getAttribute("href")]
      })
    )
  })
}

test.describe("locale values with @mannisto/astro-i18n", () => {
  test("gives the default locale its URL without a prefix", async ({ page }) => {
    await page.goto("/about")
    await expect(page.locator("link[rel='canonical']")).toHaveAttribute(
      "href",
      "https://example.com/about/"
    )
    expect(await hreflang(page)).toEqual({
      en: "https://example.com/about/",
      fi: "https://example.com/fi/about/",
      "x-default": "https://example.com/about/",
    })
  })

  test("uses the locale of the page for the site values", async ({ page }) => {
    await page.goto("/fi/about")
    await expect(page.locator("link[rel='canonical']")).toHaveAttribute(
      "href",
      "https://example.com/fi/about/"
    )
    await expect(page.locator("meta[property='og:site_name']")).toHaveAttribute(
      "content",
      "I18n-sivusto"
    )
    const json = await page.locator("script[type='application/ld+json']").textContent()
    expect(JSON.parse(json!)["@graph"][0]).toMatchObject({ inLanguage: "fi" })
  })

  test("links the home page in each locale", async ({ page }) => {
    await page.goto("/")
    expect(await hreflang(page)).toEqual({
      en: "https://example.com/",
      fi: "https://example.com/fi/",
      "x-default": "https://example.com/",
    })
  })

  test("does not change a page outside the [locale] folder", async ({ page }) => {
    await page.goto("/privacy")
    await expect(page.locator("link[rel='canonical']")).toHaveAttribute(
      "href",
      "https://example.com/privacy/"
    )
    expect(await hreflang(page)).toEqual({})
  })
})
