import { expect, test } from "@playwright/test"

test.describe("Alternates", () => {
  test.describe("two-languages", () => {
    test("renders correct number of alternates", async ({ page }) => {
      await page.goto("/alternates/two-languages")
      const links = page.locator("link[rel='alternate']")
      await expect(links).toHaveCount(2)
    })

    test("renders en hreflang", async ({ page }) => {
      await page.goto("/alternates/two-languages")
      const en = page.locator("link[hreflang='en']")
      await expect(en).toHaveAttribute("href", "https://example.com/en")
    })

    test("renders fi hreflang", async ({ page }) => {
      await page.goto("/alternates/two-languages")
      const fi = page.locator("link[hreflang='fi']")
      await expect(fi).toHaveAttribute("href", "https://example.com/fi")
    })
  })

  test.describe("with-x-default", () => {
    test("renders correct number of alternates", async ({ page }) => {
      await page.goto("/alternates/with-x-default")
      const links = page.locator("link[rel='alternate']")
      await expect(links).toHaveCount(3)
    })

    test("renders x-default hreflang", async ({ page }) => {
      await page.goto("/alternates/with-x-default")
      const xDefault = page.locator("link[hreflang='x-default']")
      await expect(xDefault).toHaveAttribute("href", "https://example.com")
    })
  })

  test.describe("feeds", () => {
    test("renders an RSS feed link by default", async ({ page }) => {
      await page.goto("/alternates/feeds")
      const rss = page.locator("link[rel='alternate'][type='application/rss+xml']")
      await expect(rss).toHaveAttribute("href", "/rss.xml")
      await expect(rss).toHaveAttribute("title", "Blog")
    })

    test("renders Atom and JSON feed links", async ({ page }) => {
      await page.goto("/alternates/feeds")
      await expect(
        page.locator("link[rel='alternate'][type='application/atom+xml']")
      ).toHaveAttribute("href", "/atom.xml")
      await expect(
        page.locator("link[rel='alternate'][type='application/feed+json']")
      ).toHaveAttribute("href", "/feed.json")
    })
  })

  test.describe("relative", () => {
    test("renders absolute language URLs", async ({ page }) => {
      await page.goto("/alternates/relative")
      await expect(page.locator("link[hreflang='fi']")).toHaveAttribute(
        "href",
        "https://example.com/fi"
      )
    })
  })
})
