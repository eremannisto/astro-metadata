import { expect, test } from "@playwright/test"

test.describe("config defaults", () => {
  test("applies the title template from the config", async ({ page }) => {
    await page.goto("/")
    expect(await page.title()).toBe("Home | Config Site")
  })

  test("uses the site name as the title of a page without a title", async ({ page }) => {
    await page.goto("/without-title")
    expect(await page.title()).toBe("Config Site")
  })

  test("renders the default description", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("meta[name='description']")).toHaveAttribute(
      "content",
      "The default description"
    )
  })

  test("renders the default image as an absolute URL", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("meta[property='og:image']")).toHaveAttribute(
      "content",
      "https://example.com/og.jpg"
    )
    await expect(page.locator("meta[property='og:image:width']")).toHaveAttribute("content", "1200")
  })

  test("renders the site name in og:site_name", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("meta[property='og:site_name']")).toHaveAttribute(
      "content",
      "Config Site"
    )
  })

  test("renders the default robots and twitter values", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("meta[name='robots']")).toHaveAttribute(
      "content",
      "index, follow, noarchive"
    )
    await expect(page.locator("meta[name='twitter:site']")).toHaveAttribute(
      "content",
      "@configsite"
    )
  })
})

test.describe("locales", () => {
  test("uses the values of the locale prop", async ({ page }) => {
    await page.goto("/finnish")
    expect(await page.title()).toBe("Koti | Config-sivusto")
    await expect(page.locator("meta[name='description']")).toHaveAttribute(
      "content",
      "Oletuskuvaus"
    )
    await expect(page.locator("meta[property='og:site_name']")).toHaveAttribute(
      "content",
      "Config-sivusto"
    )
  })

  test("uses the first value for an unknown locale", async ({ page }) => {
    await page.goto("/unknown-locale")
    expect(await page.title()).toBe("Home | Config Site")
  })
})

test.describe("props override the config", () => {
  test("uses the props of the page", async ({ page }) => {
    await page.goto("/overrides")
    expect(await page.title()).toBe("Own — Override")
    await expect(page.locator("meta[name='description']")).toHaveAttribute(
      "content",
      "Own description"
    )
    await expect(page.locator("meta[name='robots']")).toHaveAttribute("content", "index, nofollow")
    await expect(page.locator("meta[name='twitter:site']")).toHaveAttribute("content", "@own")
  })

  test("removes config values with false", async ({ page }) => {
    await page.goto("/disabled")
    await expect(page.locator("meta[name='description']")).not.toBeAttached()
    await expect(page.locator("meta[name='robots']")).not.toBeAttached()
    await expect(page.locator("meta[property='og:image']")).not.toBeAttached()
  })
})

test.describe("colors and feeds", () => {
  test("renders the theme color and color scheme from the config", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("meta[name='theme-color']")).toHaveAttribute("content", "#123456")
    await expect(page.locator("meta[name='color-scheme']")).toHaveAttribute("content", "light dark")
  })

  test("renders the feed with the title of the locale", async ({ page }) => {
    await page.goto("/")
    const feed = page.locator("link[type='application/rss+xml']")
    await expect(feed).toHaveAttribute("title", "Blog")
    await page.goto("/finnish")
    await expect(feed).toHaveAttribute("title", "Blogi")
  })
})
