import { test, expect } from "@playwright/test"

test.describe("Canonical", () => {

  test.describe("default", () => {
    test("renders canonical tag", async ({ page }) => {
      await page.goto("/canonical/default")
      const canonical = page.locator("link[rel='canonical']")
      await expect(canonical).toBeAttached()
    })

    test("falls back to current URL", async ({ page }) => {
      await page.goto("/canonical/default")
      const canonical = page.locator("link[rel='canonical']")
      await expect(canonical).toHaveAttribute("href", "http://localhost:4321/canonical/default")
    })
  })

  test.describe("custom", () => {
    test("renders canonical tag", async ({ page }) => {
      await page.goto("/canonical/custom")
      const canonical = page.locator("link[rel='canonical']")
      await expect(canonical).toBeAttached()
    })

    test("uses provided value", async ({ page }) => {
      await page.goto("/canonical/custom")
      const canonical = page.locator("link[rel='canonical']")
      await expect(canonical).toHaveAttribute("href", "https://example.com/canonical")
    })
  })

})