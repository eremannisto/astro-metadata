import { test, expect } from "@playwright/test"

test.describe("Twitter", () => {
  test.describe("basic", () => {
    test("renders twitter:title", async ({ page }) => {
      await page.goto("/twitter/basic")
      const meta = page.locator("meta[name='twitter:title']")
      await expect(meta).toHaveAttribute("content", "My Page")
    })

    test("renders twitter:description", async ({ page }) => {
      await page.goto("/twitter/basic")
      const meta = page.locator("meta[name='twitter:description']")
      await expect(meta).toHaveAttribute("content", "Welcome to my site")
    })

    test("defaults to summary_large_image card", async ({ page }) => {
      await page.goto("/twitter/basic")
      const meta = page.locator("meta[name='twitter:card']")
      await expect(meta).toHaveAttribute("content", "summary_large_image")
    })
  })

  test.describe("summary", () => {
    test("renders summary card type", async ({ page }) => {
      await page.goto("/twitter/summary")
      const meta = page.locator("meta[name='twitter:card']")
      await expect(meta).toHaveAttribute("content", "summary")
    })
  })

  test.describe("player", () => {
    test("renders player card type", async ({ page }) => {
      await page.goto("/twitter/player")
      const meta = page.locator("meta[name='twitter:card']")
      await expect(meta).toHaveAttribute("content", "player")
    })
  })

  test.describe("with-url", () => {
    test("renders twitter:url", async ({ page }) => {
      await page.goto("/twitter/with-url")
      const meta = page.locator("meta[name='twitter:url']")
      await expect(meta).toHaveAttribute("content", "https://example.com")
    })
  })

  test.describe("with-image", () => {
    test("renders twitter:image", async ({ page }) => {
      await page.goto("/twitter/with-image")
      const meta = page.locator("meta[name='twitter:image']")
      await expect(meta).toHaveAttribute("content", "/og.jpg")
    })

    test("renders twitter:image:alt", async ({ page }) => {
      await page.goto("/twitter/with-image")
      const meta = page.locator("meta[name='twitter:image:alt']")
      await expect(meta).toHaveAttribute("content", "My Site")
    })
  })

  test.describe("with-all", () => {
    test("renders twitter:site", async ({ page }) => {
      await page.goto("/twitter/with-all")
      const meta = page.locator("meta[name='twitter:site']")
      await expect(meta).toHaveAttribute("content", "@mysite")
    })

    test("renders twitter:creator", async ({ page }) => {
      await page.goto("/twitter/with-all")
      const meta = page.locator("meta[name='twitter:creator']")
      await expect(meta).toHaveAttribute("content", "@mycreator")
    })

    test("renders all tags", async ({ page }) => {
      await page.goto("/twitter/with-all")
      await expect(page.locator("meta[name='twitter:card']")).toBeAttached()
      await expect(page.locator("meta[name='twitter:title']")).toBeAttached()
      await expect(page.locator("meta[name='twitter:description']")).toBeAttached()
      await expect(page.locator("meta[name='twitter:url']")).toBeAttached()
      await expect(page.locator("meta[name='twitter:image']")).toBeAttached()
      await expect(page.locator("meta[name='twitter:image:alt']")).toBeAttached()
      await expect(page.locator("meta[name='twitter:site']")).toBeAttached()
      await expect(page.locator("meta[name='twitter:creator']")).toBeAttached()
    })
  })
})
