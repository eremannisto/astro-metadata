import { expect, test } from "@playwright/test"

test.describe("Schema", () => {
  test.describe("website", () => {
    test("renders script tag", async ({ page }) => {
      await page.goto("/schema/website")
      const schema = page.locator("script[type='application/ld+json']")
      await expect(schema).toBeAttached()
    })

    test("renders correct @context", async ({ page }) => {
      await page.goto("/schema/website")
      const schema = page.locator("script[type='application/ld+json']")
      const content = await schema.textContent()
      const parsed = JSON.parse(content!)
      expect(parsed["@context"]).toBe("https://schema.org")
    })

    test("renders correct @type", async ({ page }) => {
      await page.goto("/schema/website")
      const schema = page.locator("script[type='application/ld+json']")
      const content = await schema.textContent()
      const parsed = JSON.parse(content!)
      expect(parsed["@type"]).toBe("WebSite")
    })

    test("renders correct name", async ({ page }) => {
      await page.goto("/schema/website")
      const schema = page.locator("script[type='application/ld+json']")
      const content = await schema.textContent()
      const parsed = JSON.parse(content!)
      expect(parsed.name).toBe("My Site")
    })

    test("renders correct url", async ({ page }) => {
      await page.goto("/schema/website")
      const schema = page.locator("script[type='application/ld+json']")
      const content = await schema.textContent()
      const parsed = JSON.parse(content!)
      expect(parsed.url).toBe("https://example.com")
    })
  })

  test.describe("person", () => {
    test("renders correct @type", async ({ page }) => {
      await page.goto("/schema/person")
      const schema = page.locator("script[type='application/ld+json']")
      const content = await schema.textContent()
      const parsed = JSON.parse(content!)
      expect(parsed["@type"]).toBe("Person")
    })

    test("renders correct name", async ({ page }) => {
      await page.goto("/schema/person")
      const schema = page.locator("script[type='application/ld+json']")
      const content = await schema.textContent()
      const parsed = JSON.parse(content!)
      expect(parsed.name).toBe("Ere Männistö")
    })

    test("renders correct email", async ({ page }) => {
      await page.goto("/schema/person")
      const schema = page.locator("script[type='application/ld+json']")
      const content = await schema.textContent()
      const parsed = JSON.parse(content!)
      expect(parsed.email).toBe("ere@example.com")
    })
  })

  test.describe("escaped", () => {
    test("keeps a closing script tag inside the JSON", async ({ page }) => {
      await page.goto("/schema/escaped")
      const schemas = page.locator("script[type='application/ld+json']")
      await expect(schemas).toHaveCount(1)
      const parsed = JSON.parse((await schemas.textContent())!)
      expect(parsed.name).toBe("</script><script>window.injected = true</script>")
      expect(await page.evaluate(() => "injected" in window)).toBe(false)
    })
  })
})
