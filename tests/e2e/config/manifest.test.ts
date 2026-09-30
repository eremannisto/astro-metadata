import { expect, test } from "@playwright/test"

test.describe("manifest from the config", () => {
  test("serves the manifest of the first locale at the root", async ({ request }) => {
    const response = await request.get("/manifest.webmanifest")
    expect(response.status()).toBe(200)
    const manifest = await response.json()
    expect(manifest).toMatchObject({
      name: "Config Site",
      short_name: "Config",
      lang: "en",
      start_url: "/",
      scope: "/",
      display: "standalone",
      theme_color: "#123456",
      categories: ["art"],
    })
  })

  test("adds the generated icons", async ({ request }) => {
    const manifest = await (await request.get("/manifest.webmanifest")).json()
    expect(manifest.icons).toHaveLength(3)
    expect(manifest.icons[1].src).toMatch(/^\/icon-512\.png\?v=[0-9a-f]{8}$/)
  })

  test("serves one manifest for each other locale", async ({ request }) => {
    const manifest = await (await request.get("/fi/manifest.webmanifest")).json()
    expect(manifest).toMatchObject({ name: "Config-sivusto", short_name: "Config", lang: "fi" })
  })

  test("links the manifest of the page locale", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("link[rel='manifest']")).toHaveAttribute(
      "href",
      "/manifest.webmanifest"
    )
    await page.goto("/finnish")
    await expect(page.locator("link[rel='manifest']")).toHaveAttribute(
      "href",
      "/fi/manifest.webmanifest"
    )
  })
})
