import { test, expect } from "@playwright/test"

test.describe("OpenGraph", () => {

  test.describe("basic", () => {
    test("renders og:title", async ({ page }) => {
      await page.goto("/open-graph/basic")
      const meta = page.locator("meta[property='og:title']")
      await expect(meta).toHaveAttribute("content", "My Page")
    })

    test("renders og:description", async ({ page }) => {
      await page.goto("/open-graph/basic")
      const meta = page.locator("meta[property='og:description']")
      await expect(meta).toHaveAttribute("content", "Welcome to my site")
    })

    test("renders og:type default", async ({ page }) => {
      await page.goto("/open-graph/basic")
      const meta = page.locator("meta[property='og:type']")
      await expect(meta).toHaveAttribute("content", "website")
    })
  })

  test.describe("with-image", () => {
    test("renders og:image", async ({ page }) => {
      await page.goto("/open-graph/with-image")
      const meta = page.locator("meta[property='og:image']")
      await expect(meta).toHaveAttribute("content", "/og.jpg")
    })

    test("renders og:image:secure_url", async ({ page }) => {
      await page.goto("/open-graph/with-image")
      const meta = page.locator("meta[property='og:image:secure_url']")
      await expect(meta).toHaveAttribute("content", "https://example.com/og.jpg")
    })

    test("renders og:image:type", async ({ page }) => {
      await page.goto("/open-graph/with-image")
      const meta = page.locator("meta[property='og:image:type']")
      await expect(meta).toHaveAttribute("content", "image/jpeg")
    })

    test("renders og:image:alt", async ({ page }) => {
      await page.goto("/open-graph/with-image")
      const meta = page.locator("meta[property='og:image:alt']")
      await expect(meta).toHaveAttribute("content", "My Site")
    })

    test("renders og:image:width", async ({ page }) => {
      await page.goto("/open-graph/with-image")
      const meta = page.locator("meta[property='og:image:width']")
      await expect(meta).toHaveAttribute("content", "1200")
    })

    test("renders og:image:height", async ({ page }) => {
      await page.goto("/open-graph/with-image")
      const meta = page.locator("meta[property='og:image:height']")
      await expect(meta).toHaveAttribute("content", "630")
    })
  })

  test.describe("with-video", () => {
    test("renders og:video", async ({ page }) => {
      await page.goto("/open-graph/with-video")
      const meta = page.locator("meta[property='og:video']")
      await expect(meta).toHaveAttribute("content", "https://example.com/video.mp4")
    })

    test("renders og:video:secure_url", async ({ page }) => {
      await page.goto("/open-graph/with-video")
      const meta = page.locator("meta[property='og:video:secure_url']")
      await expect(meta).toHaveAttribute("content", "https://example.com/video.mp4")
    })

    test("renders og:video:type", async ({ page }) => {
      await page.goto("/open-graph/with-video")
      const meta = page.locator("meta[property='og:video:type']")
      await expect(meta).toHaveAttribute("content", "video/mp4")
    })

    test("renders og:video:width", async ({ page }) => {
      await page.goto("/open-graph/with-video")
      const meta = page.locator("meta[property='og:video:width']")
      await expect(meta).toHaveAttribute("content", "1280")
    })

    test("renders og:video:height", async ({ page }) => {
      await page.goto("/open-graph/with-video")
      const meta = page.locator("meta[property='og:video:height']")
      await expect(meta).toHaveAttribute("content", "720")
    })
  })

  test.describe("with-audio", () => {
    test("renders og:audio", async ({ page }) => {
      await page.goto("/open-graph/with-audio")
      const meta = page.locator("meta[property='og:audio']")
      await expect(meta).toHaveAttribute("content", "https://example.com/audio.mp3")
    })

    test("renders og:audio:secure_url", async ({ page }) => {
      await page.goto("/open-graph/with-audio")
      const meta = page.locator("meta[property='og:audio:secure_url']")
      await expect(meta).toHaveAttribute("content", "https://example.com/audio.mp3")
    })

    test("renders og:audio:type", async ({ page }) => {
      await page.goto("/open-graph/with-audio")
      const meta = page.locator("meta[property='og:audio:type']")
      await expect(meta).toHaveAttribute("content", "audio/mpeg")
    })
  })

  test.describe("with-locale", () => {
    test("renders og:locale", async ({ page }) => {
      await page.goto("/open-graph/with-locale")
      const meta = page.locator("meta[property='og:locale']")
      await expect(meta).toHaveAttribute("content", "en_US")
    })

    test("renders og:locale:alternate", async ({ page }) => {
      await page.goto("/open-graph/with-locale")
      const metas = page.locator("meta[property='og:locale:alternate']")
      await expect(metas).toHaveCount(2)
      await expect(metas.nth(0)).toHaveAttribute("content", "fi_FI")
      await expect(metas.nth(1)).toHaveAttribute("content", "fr_FR")
    })
  })

  test.describe("with-all", () => {
    test("renders og:url", async ({ page }) => {
      await page.goto("/open-graph/with-all")
      const meta = page.locator("meta[property='og:url']")
      await expect(meta).toHaveAttribute("content", "https://example.com")
    })

    test("renders og:site_name", async ({ page }) => {
      await page.goto("/open-graph/with-all")
      const meta = page.locator("meta[property='og:site_name']")
      await expect(meta).toHaveAttribute("content", "My Site")
    })

    test("renders all tags", async ({ page }) => {
      await page.goto("/open-graph/with-all")
      await expect(page.locator("meta[property='og:title']")).toBeAttached()
      await expect(page.locator("meta[property='og:description']")).toBeAttached()
      await expect(page.locator("meta[property='og:url']")).toBeAttached()
      await expect(page.locator("meta[property='og:type']")).toBeAttached()
      await expect(page.locator("meta[property='og:site_name']")).toBeAttached()
      await expect(page.locator("meta[property='og:locale']")).toBeAttached()
      await expect(page.locator("meta[property='og:locale:alternate']")).toHaveCount(2)
      await expect(page.locator("meta[property='og:image']")).toBeAttached()
      await expect(page.locator("meta[property='og:image:secure_url']")).toBeAttached()
      await expect(page.locator("meta[property='og:image:type']")).toBeAttached()
      await expect(page.locator("meta[property='og:image:alt']")).toBeAttached()
      await expect(page.locator("meta[property='og:image:width']")).toBeAttached()
      await expect(page.locator("meta[property='og:image:height']")).toBeAttached()
      await expect(page.locator("meta[property='og:video']")).toBeAttached()
      await expect(page.locator("meta[property='og:video:secure_url']")).toBeAttached()
      await expect(page.locator("meta[property='og:video:type']")).toBeAttached()
      await expect(page.locator("meta[property='og:video:width']")).toBeAttached()
      await expect(page.locator("meta[property='og:video:height']")).toBeAttached()
      await expect(page.locator("meta[property='og:audio']")).toBeAttached()
      await expect(page.locator("meta[property='og:audio:secure_url']")).toBeAttached()
      await expect(page.locator("meta[property='og:audio:type']")).toBeAttached()
    })
  })

})