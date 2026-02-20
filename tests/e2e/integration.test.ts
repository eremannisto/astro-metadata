import { test, expect } from "@playwright/test"

test.describe("Integration", () => {

  test("renders title via Metadata utility", async ({ page }) => {
    await page.goto("/")
    expect(await page.title()).toBe("Home | My Site")
  })

  test("page description wins over default", async ({ page }) => {
    await page.goto("/")
    const meta = page.locator("meta[name='description']")
    await expect(meta).toHaveAttribute("content", "Integration test page")
  })

  test("renders og:image from Metadata", async ({ page }) => {
    await page.goto("/")
    const og = page.locator("meta[property='og:image']")
    await expect(og).toHaveAttribute("content", "/og.jpg")
  })

  test("renders og:image:width from Metadata", async ({ page }) => {
    await page.goto("/")
    const og = page.locator("meta[property='og:image:width']")
    await expect(og).toHaveAttribute("content", "1200")
  })

  test("renders favicon ico", async ({ page }) => {
    await page.goto("/")
    const ico = page.locator("link[rel='icon'][type='image/x-icon']")
    await expect(ico).toHaveAttribute("href", "/favicon.ico")
  })

  test("renders apple touch icon", async ({ page }) => {
    await page.goto("/")
    const apple = page.locator("link[rel='apple-touch-icon']")
    await expect(apple).toHaveAttribute("href", "/apple-touch-icon.png")
  })

  test("renders hreflang alternates", async ({ page }) => {
    await page.goto("/")
    const en = page.locator("link[hreflang='en']")
    await expect(en).toHaveAttribute("href", "https://example.com/en")
  })

  test("renders json-ld schema", async ({ page }) => {
    await page.goto("/")
    const schema = page.locator("script[type='application/ld+json']")
    const content = await schema.textContent()
    const parsed = JSON.parse(content!)
    expect(parsed["@type"]).toBe("WebSite")
    expect(parsed.name).toBe("My Site")
  })

  test("renders charset", async ({ page }) => {
    await page.goto("/")
    const meta = page.locator("meta[charset]")
    await expect(meta).toHaveAttribute("charset", "UTF-8")
  })

  test("renders viewport", async ({ page }) => {
    await page.goto("/")
    const meta = page.locator("meta[name='viewport']")
    await expect(meta).toHaveAttribute("content", "width=device-width, initial-scale=1.0")
  })

})