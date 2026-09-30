import { expect, test } from "@playwright/test"

import { readIco, readPng } from "../lib/image.ts"

test.describe("PNG source with a base", () => {
  test("renders the tags with the base and without icon.svg", async ({ page }) => {
    await page.goto("/docs/")
    await expect(page.locator("link[rel='icon'][sizes='32x32']")).toHaveAttribute(
      "href",
      /^\/docs\/favicon\.ico\?v=[0-9a-f]{8}$/
    )
    await expect(page.locator("link[rel='apple-touch-icon']")).toHaveAttribute(
      "href",
      /^\/docs\/apple-touch-icon\.png\?v=[0-9a-f]{8}$/
    )
    await expect(page.locator("link[rel='icon'][type='image/svg+xml']")).not.toBeAttached()
  })

  test("renders the files under the base", async ({ request }) => {
    expect(readIco(await (await request.get("/docs/favicon.ico")).body())).toBe(2)
    const png = await readPng(await (await request.get("/docs/icon-512.png")).body())
    expect(png).toMatchObject({ width: 512, height: 512, format: "png" })
  })

  test("does not render icon.svg for a PNG source", async ({ request }) => {
    const response = await request.get("/docs/icon.svg")
    expect(response.status()).toBe(404)
  })

  test("gives the manifest icons to your own manifest endpoint", async ({ request }) => {
    const manifest = await (await request.get("/docs/manifest.webmanifest")).json()
    expect(manifest.icons).toHaveLength(3)
    expect(manifest.icons[0]).toMatchObject({ sizes: "192x192", type: "image/png" })
    expect(manifest.icons[0].src).toMatch(/^\/docs\/icon-192\.png\?v=[0-9a-f]{8}$/)
    expect(manifest.icons[2]).toMatchObject({ sizes: "512x512", purpose: "maskable" })
  })
})
