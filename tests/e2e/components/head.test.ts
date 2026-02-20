import { test, expect } from "@playwright/test"

test.describe("Head", () => {
  test.describe("basic", () => {
    test("renders title", async ({ page }) => {
      await page.goto("/head/basic")
      expect(await page.title()).toBe("My Page")
    })

    test("renders default charset", async ({ page }) => {
      await page.goto("/head/basic")
      const meta = page.locator("meta[charset]")
      await expect(meta).toHaveAttribute("charset", "UTF-8")
    })

    test("renders default viewport", async ({ page }) => {
      await page.goto("/head/basic")
      const meta = page.locator("meta[name='viewport']")
      await expect(meta).toHaveAttribute("content", "width=device-width, initial-scale=1.0")
    })
  })

  test.describe("with-charset", () => {
    test("renders custom charset", async ({ page }) => {
      await page.goto("/head/with-charset")
      const meta = page.locator("meta[charset]")
      await expect(meta).toHaveAttribute("charset", "ISO-8859-1")
    })

    test("renders custom viewport", async ({ page }) => {
      await page.goto("/head/with-charset")
      const meta = page.locator("meta[name='viewport']")
      await expect(meta).toHaveAttribute("content", "width=device-width, initial-scale=0.5")
    })
  })

  test.describe("with-slots", () => {
    test("renders first top slot item", async ({ page }) => {
      await page.goto("/head/with-slots")
      const meta = page.locator("meta[http-equiv='X-UA-Compatible']")
      await expect(meta).toHaveAttribute("content", "IE=edge")
    })

    test("renders second top slot item", async ({ page }) => {
      await page.goto("/head/with-slots")
      const meta = page.locator("meta[name='theme-color']")
      await expect(meta).toHaveAttribute("content", "#ffffff")
    })

    test("renders first default slot item", async ({ page }) => {
      await page.goto("/head/with-slots")
      const meta = page.locator("meta[name='custom']")
      await expect(meta).toHaveAttribute("content", "test")
    })

    test("renders second default slot item", async ({ page }) => {
      await page.goto("/head/with-slots")
      const meta = page.locator("meta[name='author']")
      await expect(meta).toHaveAttribute("content", "Ere Männistö")
    })
  })

  test.describe("full", () => {
    test("renders title with template", async ({ page }) => {
      await page.goto("/head/full")
      expect(await page.title()).toBe("My Page | My Site")
    })

    test("renders description", async ({ page }) => {
      await page.goto("/head/full")
      const meta = page.locator("meta[name='description']")
      await expect(meta).toHaveAttribute("content", "Welcome to my site")
    })

    test("renders canonical", async ({ page }) => {
      await page.goto("/head/full")
      const link = page.locator("link[rel='canonical']")
      await expect(link).toHaveAttribute("href", "https://example.com")
    })

    test("renders keywords", async ({ page }) => {
      await page.goto("/head/full")
      const meta = page.locator("meta[name='keywords']")
      await expect(meta).toHaveAttribute("content", "astro, seo, metadata")
    })

    test("renders robots", async ({ page }) => {
      await page.goto("/head/full")
      const meta = page.locator("meta[name='robots']")
      const content = await meta.getAttribute("content")
      expect(content).toContain("noarchive")
    })

    test("renders og:title", async ({ page }) => {
      await page.goto("/head/full")
      const meta = page.locator("meta[property='og:title']")
      await expect(meta).toHaveAttribute("content", "My Page")
    })

    test("renders twitter:card", async ({ page }) => {
      await page.goto("/head/full")
      const meta = page.locator("meta[name='twitter:card']")
      await expect(meta).toHaveAttribute("content", "summary_large_image")
    })

    test("renders favicon", async ({ page }) => {
      await page.goto("/head/full")
      const ico = page.locator("link[rel='icon'][type='image/x-icon']")
      await expect(ico).toHaveAttribute("href", "/favicon.ico")
    })

    test("renders hreflang alternates", async ({ page }) => {
      await page.goto("/head/full")
      const en = page.locator("link[hreflang='en']")
      await expect(en).toHaveAttribute("href", "https://example.com/en")
    })

    test("renders schema", async ({ page }) => {
      await page.goto("/head/full")
      const schema = page.locator("script[type='application/ld+json']")
      const content = await schema.textContent()
      const parsed = JSON.parse(content!)
      expect(parsed["@type"]).toBe("WebSite")
    })
  })
})
