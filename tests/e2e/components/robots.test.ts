import { test, expect } from "@playwright/test"

test.describe("Robots", () => {

  test.describe("basic", () => {
    test("renders robots meta tag", async ({ page }) => {
      await page.goto("/robots/basic")
      const meta = page.locator("meta[name='robots']")
      await expect(meta).toBeAttached()
    })

    test("defaults to index and follow", async ({ page }) => {
      await page.goto("/robots/basic")
      const meta = page.locator("meta[name='robots']")
      await expect(meta).toHaveAttribute("content", "index, follow")
    })
  })

  test.describe("no-index", () => {
    test("renders noindex directive", async ({ page }) => {
      await page.goto("/robots/no-index")
      const meta = page.locator("meta[name='robots']")
      const content = await meta.getAttribute("content")
      expect(content).toContain("noindex")
    })
  })

  test.describe("no-follow", () => {
    test("renders nofollow directive", async ({ page }) => {
      await page.goto("/robots/no-follow")
      const meta = page.locator("meta[name='robots']")
      const content = await meta.getAttribute("content")
      expect(content).toContain("nofollow")
    })
  })

  test.describe("no-archive", () => {
    test("renders noarchive directive", async ({ page }) => {
      await page.goto("/robots/no-archive")
      const meta = page.locator("meta[name='robots']")
      const content = await meta.getAttribute("content")
      expect(content).toContain("noarchive")
    })
  })

  test.describe("no-snippet", () => {
    test("renders nosnippet directive", async ({ page }) => {
      await page.goto("/robots/no-snippet")
      const meta = page.locator("meta[name='robots']")
      const content = await meta.getAttribute("content")
      expect(content).toContain("nosnippet")
    })
  })

  test.describe("extras", () => {
    test("renders extra directives", async ({ page }) => {
      await page.goto("/robots/extras")
      const meta = page.locator("meta[name='robots']")
      const content = await meta.getAttribute("content")
      expect(content).toContain("max-snippet:-1")
      expect(content).toContain("max-image-preview:large")
    })
  })

})