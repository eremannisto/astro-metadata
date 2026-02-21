import { test, expect } from "@playwright/test"

test.describe("Head", () => {
  test.describe("basic", () => {
    test("renders title", async ({ page }) => {
      await page.goto("/head/basic")
      expect(await page.title()).toBe("My Page")
    })

    test("renders default charset", async ({ page }) => {
      await page.goto("/head/basic")
      await expect(page.locator("meta[charset]")).toHaveAttribute("charset", "UTF-8")
    })

    test("renders default viewport", async ({ page }) => {
      await page.goto("/head/basic")
      await expect(page.locator("meta[name='viewport']")).toHaveAttribute(
        "content",
        "width=device-width, initial-scale=1.0"
      )
    })

    test("og and twitter render by default", async ({ page }) => {
      await page.goto("/head/basic")
      await expect(page.locator("meta[property='og:title']")).toBeAttached()
      await expect(page.locator("meta[name='twitter:title']")).toBeAttached()
    })
  })

  test.describe("with-charset", () => {
    test("renders custom charset", async ({ page }) => {
      await page.goto("/head/with-charset")
      await expect(page.locator("meta[charset]")).toHaveAttribute("charset", "ISO-8859-1")
    })

    test("renders custom viewport", async ({ page }) => {
      await page.goto("/head/with-charset")
      await expect(page.locator("meta[name='viewport']")).toHaveAttribute(
        "content",
        "width=device-width, initial-scale=0.5"
      )
    })
  })

  test.describe("with-slots", () => {
    test("renders first top slot item", async ({ page }) => {
      await page.goto("/head/with-slots")
      await expect(page.locator("meta[http-equiv='X-UA-Compatible']")).toHaveAttribute(
        "content",
        "IE=edge"
      )
    })

    test("renders second top slot item", async ({ page }) => {
      await page.goto("/head/with-slots")
      await expect(page.locator("meta[name='theme-color']")).toHaveAttribute("content", "#ffffff")
    })

    test("renders first default slot item", async ({ page }) => {
      await page.goto("/head/with-slots")
      await expect(page.locator("meta[name='custom']")).toHaveAttribute("content", "test")
    })

    test("renders second default slot item", async ({ page }) => {
      await page.goto("/head/with-slots")
      await expect(page.locator("meta[name='author']")).toHaveAttribute("content", "Ere Männistö")
    })
  })

  test.describe("with-image", () => {
    test("flows into og:image", async ({ page }) => {
      await page.goto("/head/with-image")
      await expect(page.locator("meta[property='og:image']")).toHaveAttribute("content", "/og.jpg")
    })

    test("flows into og:image:alt", async ({ page }) => {
      await page.goto("/head/with-image")
      await expect(page.locator("meta[property='og:image:alt']")).toHaveAttribute(
        "content",
        "My Site"
      )
    })

    test("flows into og:image:width", async ({ page }) => {
      await page.goto("/head/with-image")
      await expect(page.locator("meta[property='og:image:width']")).toHaveAttribute(
        "content",
        "1200"
      )
    })

    test("flows into og:image:height", async ({ page }) => {
      await page.goto("/head/with-image")
      await expect(page.locator("meta[property='og:image:height']")).toHaveAttribute(
        "content",
        "630"
      )
    })

    test("flows into twitter:image", async ({ page }) => {
      await page.goto("/head/with-image")
      await expect(page.locator("meta[name='twitter:image']")).toHaveAttribute("content", "/og.jpg")
    })

    test("flows into twitter:image:alt", async ({ page }) => {
      await page.goto("/head/with-image")
      await expect(page.locator("meta[name='twitter:image:alt']")).toHaveAttribute(
        "content",
        "My Site"
      )
    })

    test("og:title falls back to page title", async ({ page }) => {
      await page.goto("/head/with-image")
      await expect(page.locator("meta[property='og:title']")).toHaveAttribute("content", "My Page")
    })

    test("twitter:title falls back to page title", async ({ page }) => {
      await page.goto("/head/with-image")
      await expect(page.locator("meta[name='twitter:title']")).toHaveAttribute("content", "My Page")
    })
  })

  test.describe("disabled", () => {
    test("no description", async ({ page }) => {
      await page.goto("/head/disabled")
      await expect(page.locator("meta[name='description']")).not.toBeAttached()
    })

    test("no canonical", async ({ page }) => {
      await page.goto("/head/disabled")
      await expect(page.locator("link[rel='canonical']")).not.toBeAttached()
    })

    test("no keywords", async ({ page }) => {
      await page.goto("/head/disabled")
      await expect(page.locator("meta[name='keywords']")).not.toBeAttached()
    })

    test("no robots", async ({ page }) => {
      await page.goto("/head/disabled")
      await expect(page.locator("meta[name='robots']")).not.toBeAttached()
    })

    test("no og tags", async ({ page }) => {
      await page.goto("/head/disabled")
      await expect(page.locator("meta[property='og:title']")).not.toBeAttached()
    })

    test("no twitter tags", async ({ page }) => {
      await page.goto("/head/disabled")
      await expect(page.locator("meta[name='twitter:card']")).not.toBeAttached()
    })

    test("no favicon", async ({ page }) => {
      await page.goto("/head/disabled")
      await expect(page.locator("link[rel='icon']")).not.toBeAttached()
    })

    test("no schema", async ({ page }) => {
      await page.goto("/head/disabled")
      await expect(page.locator("script[type='application/ld+json']")).not.toBeAttached()
    })

    test("no hreflang", async ({ page }) => {
      await page.goto("/head/disabled")
      await expect(page.locator("link[rel='alternate']")).not.toBeAttached()
    })

    test("no og:image when image=false", async ({ page }) => {
      await page.goto("/head/disabled")
      await expect(page.locator("meta[property='og:image']")).not.toBeAttached()
    })

    test("no twitter:image when image=false", async ({ page }) => {
      await page.goto("/head/disabled")
      await expect(page.locator("meta[name='twitter:image']")).not.toBeAttached()
    })
  })

  test.describe("overrides", () => {
    test("og:title uses override over page title", async ({ page }) => {
      await page.goto("/head/overrides")
      await expect(page.locator("meta[property='og:title']")).toHaveAttribute(
        "content",
        "Custom OG Title"
      )
    })

    test("og:image uses override over top-level image", async ({ page }) => {
      await page.goto("/head/overrides")
      await expect(page.locator("meta[property='og:image']")).toHaveAttribute(
        "content",
        "/og-specific.jpg"
      )
    })

    test("twitter:image falls back to top-level image when not overridden", async ({ page }) => {
      await page.goto("/head/overrides")
      await expect(page.locator("meta[name='twitter:image']")).toHaveAttribute("content", "/og.jpg")
    })

    test("twitter:card uses override", async ({ page }) => {
      await page.goto("/head/overrides")
      await expect(page.locator("meta[name='twitter:card']")).toHaveAttribute("content", "summary")
    })
  })

  test.describe("full", () => {
    test("renders title with template", async ({ page }) => {
      await page.goto("/head/full")
      expect(await page.title()).toBe("My Page | My Site")
    })

    test("renders og:image from top-level image", async ({ page }) => {
      await page.goto("/head/full")
      await expect(page.locator("meta[property='og:image']")).toHaveAttribute("content", "/og.jpg")
    })

    test("renders twitter:image from top-level image", async ({ page }) => {
      await page.goto("/head/full")
      await expect(page.locator("meta[name='twitter:image']")).toHaveAttribute("content", "/og.jpg")
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
