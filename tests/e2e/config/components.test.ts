import { expect, test } from "@playwright/test"

test.describe("single components", () => {
  test("render only their own tags, with the site values", async ({ page }) => {
    await page.goto("/parts")
    expect(await page.title()).toBe("Parts | Config Site")
    await expect(page.locator("link[rel='canonical']")).toHaveAttribute(
      "href",
      "https://example.com/parts/"
    )
    await expect(page.locator("meta[property='og:title']")).toHaveAttribute("content", "Parts")
    await expect(page.locator("meta[property='og:image']")).toHaveAttribute(
      "content",
      "https://example.com/og.jpg"
    )

    // The page has no other components, so it has none of their tags
    await expect(page.locator("meta[name='description']")).not.toBeAttached()
    await expect(page.locator("meta[name='twitter:card']")).not.toBeAttached()
    await expect(page.locator("link[rel='icon']")).not.toBeAttached()
    await expect(page.locator("script[type='application/ld+json']")).not.toBeAttached()
  })
})
