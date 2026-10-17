import { expect, test } from "@playwright/test"

test.describe("site values of the integration", () => {
  test("applies the title template", async ({ page }) => {
    await page.goto("/")
    expect(await page.title()).toBe("Home | Config Site")
  })

  test("uses the site name as the title of a page without a title", async ({ page }) => {
    await page.goto("/without-title")
    expect(await page.title()).toBe("Config Site")
    await expect(page.locator("meta[property='og:title']")).toHaveAttribute(
      "content",
      "Config Site"
    )
  })

  test("renders the default description, image and site name", async ({ page }) => {
    await page.goto("/")
    const content = async (selector: string) => {
      return page.locator(selector).getAttribute("content")
    }
    expect(await content("meta[name='description']")).toBe("The default description")
    expect(await content("meta[property='og:image']")).toBe("https://example.com/og.jpg")
    expect(await content("meta[property='og:image:alt']")).toBe("Config Site")
    expect(await content("meta[property='og:image:width']")).toBe("1200")
    expect(await content("meta[property='og:site_name']")).toBe("Config Site")
    expect(await content("meta[property='og:title']")).toBe("Home")
  })

  test("renders the Twitter (X) site handle and the large card for pages with an image", async ({
    page,
  }) => {
    await page.goto("/")
    await expect(page.locator("meta[name='twitter:site']")).toHaveAttribute(
      "content",
      "@configsite"
    )
    await expect(page.locator("meta[name='twitter:card']")).toHaveAttribute(
      "content",
      "summary_large_image"
    )
  })

  test("renders the extra robots directives of the site", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("meta[name='robots']")).toHaveAttribute(
      "content",
      "max-image-preview:large"
    )
  })

  test("renders the theme color and the feed", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("meta[name='theme-color']")).toHaveAttribute("content", "#123456")
    await expect(page.locator("meta[name='color-scheme']")).not.toBeAttached()
    await expect(page.locator("link[type='application/rss+xml']")).toHaveAttribute("title", "Blog")
  })

  test("follows the trailing slash of Astro in the canonical URL", async ({ page }) => {
    // The default trailingSlash "ignore" with build.format "directory" gives the slash,
    // in dev and in the build
    await page.goto("/finnish")
    await expect(page.locator("link[rel='canonical']")).toHaveAttribute(
      "href",
      "https://example.com/finnish/"
    )
  })
})

test.describe("locales", () => {
  test("uses the values of the locale prop", async ({ page }) => {
    await page.goto("/finnish")
    expect(await page.title()).toBe("Koti | Config-sivusto")
    const content = async (selector: string) => {
      return page.locator(selector).getAttribute("content")
    }
    expect(await content("meta[name='description']")).toBe("Oletuskuvaus")
    expect(await content("meta[property='og:site_name']")).toBe("Config-sivusto")
    expect(await content("meta[property='og:image:alt']")).toBe("Config-sivusto")
    await expect(page.locator("link[type='application/rss+xml']")).toHaveAttribute("title", "Blogi")
  })

  test("uses the first value for an unknown locale", async ({ page }) => {
    await page.goto("/unknown-locale")
    expect(await page.title()).toBe("Home | Config Site")
  })
})

test.describe("page props override the site values", () => {
  test("uses the props of the page", async ({ page }) => {
    await page.goto("/overrides")
    expect(await page.title()).toBe("Own | Config Site")
    await expect(page.locator("meta[name='description']")).toHaveAttribute(
      "content",
      "Own description"
    )
    await expect(page.locator("meta[property='og:image']")).toHaveAttribute(
      "content",
      "https://cdn.example.org/own.jpg"
    )
    await expect(page.locator("meta[property='og:image:width']")).not.toBeAttached()
    await expect(page.locator("meta[name='robots']")).toHaveAttribute(
      "content",
      "nofollow, max-image-preview:large"
    )
  })
})
