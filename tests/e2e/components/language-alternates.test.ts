import { test, expect } from "@playwright/test"

test.describe("LanguageAlternates", () => {
  test.describe("two-languages", () => {
    test("renders correct number of alternates", async ({ page }) => {
      await page.goto("/language-alternates/two-languages")
      const links = page.locator("link[rel='alternate']")
      await expect(links).toHaveCount(2)
    })

    test("renders en hreflang", async ({ page }) => {
      await page.goto("/language-alternates/two-languages")
      const en = page.locator("link[hreflang='en']")
      await expect(en).toHaveAttribute("href", "https://example.com/en")
    })

    test("renders fi hreflang", async ({ page }) => {
      await page.goto("/language-alternates/two-languages")
      const fi = page.locator("link[hreflang='fi']")
      await expect(fi).toHaveAttribute("href", "https://example.com/fi")
    })
  })

  test.describe("with-x-default", () => {
    test("renders correct number of alternates", async ({ page }) => {
      await page.goto("/language-alternates/with-x-default")
      const links = page.locator("link[rel='alternate']")
      await expect(links).toHaveCount(3)
    })

    test("renders x-default hreflang", async ({ page }) => {
      await page.goto("/language-alternates/with-x-default")
      const xDefault = page.locator("link[hreflang='x-default']")
      await expect(xDefault).toHaveAttribute("href", "https://example.com")
    })
  })
})
