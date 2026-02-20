import { test, expect } from "@playwright/test"

test.describe("Keywords", () => {

  test.describe("basic", () => {
    test("renders keywords meta tag", async ({ page }) => {
      await page.goto("/keywords/basic")
      const meta = page.locator("meta[name='keywords']")
      await expect(meta).toBeAttached()
    })

    test("renders correct content", async ({ page }) => {
      await page.goto("/keywords/basic")
      const meta = page.locator("meta[name='keywords']")
      await expect(meta).toHaveAttribute("content", "astro, seo, metadata")
    })
  })

})