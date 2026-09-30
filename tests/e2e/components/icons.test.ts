import { expect, test } from "@playwright/test"

test.describe("Icons", () => {
  test.describe("basic", () => {
    test("renders ico favicon", async ({ page }) => {
      await page.goto("/icons/basic")
      const ico = page.locator("link[rel='icon'][type='image/x-icon']")
      await expect(ico).toHaveAttribute("href", "/favicon.ico")
    })

    test("renders svg favicon", async ({ page }) => {
      await page.goto("/icons/basic")
      const svg = page.locator("link[rel='icon'][type='image/svg+xml']")
      await expect(svg).toHaveAttribute("href", "/favicon.svg")
    })
  })

  test.describe("with-png", () => {
    test("renders png favicon", async ({ page }) => {
      await page.goto("/icons/with-png")
      const png = page.locator("link[rel='icon'][type='image/png']")
      await expect(png).toHaveAttribute("href", "/favicon-96x96.png")
    })

    test("renders png favicon with size", async ({ page }) => {
      await page.goto("/icons/with-png")
      const png = page.locator("link[rel='icon'][type='image/png']")
      await expect(png).toHaveAttribute("sizes", "96x96")
    })
  })

  test.describe("with-apple", () => {
    test("renders apple touch icon", async ({ page }) => {
      await page.goto("/icons/with-apple")
      const apple = page.locator("link[rel='apple-touch-icon']")
      await expect(apple).toHaveAttribute("href", "/apple-touch-icon.png")
    })

    test("renders apple touch icon with size", async ({ page }) => {
      await page.goto("/icons/with-apple")
      const apple = page.locator("link[rel='apple-touch-icon']")
      await expect(apple).toHaveAttribute("sizes", "180x180")
    })
  })

  test.describe("with-themes", () => {
    test("renders dark mode favicon", async ({ page }) => {
      await page.goto("/icons/with-themes")
      const dark = page.locator("link[media='(prefers-color-scheme: dark)']")
      await expect(dark).toHaveAttribute("href", "/favicon-dark.svg")
    })

    test("renders light mode favicon", async ({ page }) => {
      await page.goto("/icons/with-themes")
      const light = page.locator("link[media='(prefers-color-scheme: light)']")
      await expect(light).toHaveAttribute("href", "/favicon-light.svg")
    })
  })

  test.describe("full", () => {
    test("renders all favicon types", async ({ page }) => {
      await page.goto("/icons/full")
      await expect(page.locator("link[rel='icon'][type='image/x-icon']")).toBeAttached()
      await expect(
        page.locator("link[rel='icon'][type='image/svg+xml']:not([media])")
      ).toBeAttached()
      await expect(page.locator("link[rel='icon'][type='image/png']")).toBeAttached()
      await expect(page.locator("link[rel='apple-touch-icon']")).toBeAttached()
      await expect(page.locator("link[media='(prefers-color-scheme: dark)']")).toBeAttached()
      await expect(page.locator("link[media='(prefers-color-scheme: light)']")).toBeAttached()
    })
  })
  test.describe("sorted", () => {
    test("renders icons in correct order", async ({ page }) => {
      await page.goto("/icons/sorted")
      const allLinks = await page.locator("link[rel='icon'], link[rel='apple-touch-icon']").all()
      const hrefs = await Promise.all(allLinks.map((l) => l.getAttribute("href")))
      expect(hrefs).toEqual([
        "/favicon.ico",
        "/favicon-96x96.png",
        "/favicon.svg",
        "/apple-touch-icon.png",
        "/favicon-dark.svg",
      ])
    })
  })

  test.describe("unsorted", () => {
    test("preserves original order", async ({ page }) => {
      await page.goto("/icons/unsorted")
      const allLinks = await page.locator("link[rel='icon'], link[rel='apple-touch-icon']").all()
      const hrefs = await Promise.all(allLinks.map((l) => l.getAttribute("href")))
      expect(hrefs).toEqual([
        "/favicon-dark.svg",
        "/apple-touch-icon.png",
        "/favicon.svg",
        "/favicon-96x96.png",
        "/favicon.ico",
      ])
    })
  })

  test.describe("with-query", () => {
    test("detects the type of paths with capital letters, queries and hashes", async ({ page }) => {
      await page.goto("/icons/with-query")
      const icon = (href: string) => page.locator(`link[rel='icon'][href='${href}']`)
      await expect(icon("/favicon.SVG?v=2")).toHaveAttribute("type", "image/svg+xml")
      await expect(icon("/favicon.PNG#hash")).toHaveAttribute("type", "image/png")
      await expect(icon("/favicon.ico?v=2")).toHaveAttribute("type", "image/x-icon")
    })

    test("sorts paths with queries by type", async ({ page }) => {
      await page.goto("/icons/with-query")
      const hrefs = await page.locator("link[rel='icon']").evaluateAll((links) => {
        return links.map((link) => link.getAttribute("href"))
      })
      expect(hrefs).toEqual(["/favicon.ico?v=2", "/favicon.PNG#hash", "/favicon.SVG?v=2"])
    })
  })
})
