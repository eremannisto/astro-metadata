import { test, expect } from "@playwright/test"

test.describe("Description", () => {
  test.describe("basic", () => {
    test("renders description meta tag", async ({ page }) => {
      await page.goto("/description/basic")
      const meta = page.locator("meta[name='description']")
      await expect(meta).toBeAttached()
    })

    test("renders correct content", async ({ page }) => {
      await page.goto("/description/basic")
      const meta = page.locator("meta[name='description']")
      await expect(meta).toHaveAttribute("content", "This is a test description")
    })
  })
})
