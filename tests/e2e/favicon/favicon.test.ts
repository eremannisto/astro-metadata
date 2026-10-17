import { expect, test } from "@playwright/test"

import { readIco, readPng } from "../lib/image.ts"

test.describe("custom files with a PNG source and a base", () => {
  test("renders the link tags with the base", async ({ page }) => {
    await page.goto("/docs")
    await expect(page.locator("link[rel='icon'][sizes='48x48']")).toHaveAttribute(
      "href",
      /^\/docs\/favicon\.ico\?v=[0-9a-f]{8}$/
    )
    await expect(page.locator("link[rel='apple-touch-icon']")).toHaveAttribute(
      "href",
      /^\/docs\/apple-touch-icon\.png\?v=[0-9a-f]{8}$/
    )
    await expect(page.locator("link[rel='icon'][sizes='96x96']")).toHaveAttribute(
      "href",
      /^\/docs\/favicon-96\.png\?v=[0-9a-f]{8}$/
    )
    await expect(page.locator("link[rel='icon'][type='image/svg+xml']")).not.toBeAttached()
  })

  test("renders the files of the list under the base", async ({ request }) => {
    expect(readIco(await (await request.get("/docs/favicon.ico")).body())).toBe(3)
    const png = await readPng(await (await request.get("/docs/favicon-96.png")).body())
    expect(png).toMatchObject({ width: 96, height: 96, format: "png" })
    const large = await readPng(await (await request.get("/docs/favicon-256.png")).body())
    expect(large).toMatchObject({ width: 256, height: 256, format: "png" })
  })

  test("does not render the default files that the list replaces", async ({ request }) => {
    for (const path of ["/docs/favicon.svg", "/docs/favicon-192.png", "/docs/favicon-512.png"]) {
      expect((await request.get(path)).status()).toBe(404)
    }
  })

  test("gives only the large PNG files to your own manifest endpoint", async ({ request }) => {
    const manifest = await (await request.get("/docs/manifest.webmanifest")).json()
    expect(manifest.icons).toHaveLength(1)
    expect(manifest.icons[0]).toMatchObject({ sizes: "256x256", type: "image/png" })
    expect(manifest.icons[0].src).toMatch(/^\/docs\/favicon-256\.png\?v=[0-9a-f]{8}$/)
  })

  test("links your own manifest with the base", async ({ page }) => {
    await page.goto("/docs")
    await expect(page.locator("link[rel='manifest']")).toHaveAttribute(
      "href",
      "/docs/manifest.webmanifest"
    )
  })
})

test.describe("trailingSlash never with a base", () => {
  test("renders the canonical URL without the slash", async ({ page }) => {
    await page.goto("/docs/about")
    await expect(page.locator("link[rel='canonical']")).toHaveAttribute(
      "href",
      "https://example.com/docs/about"
    )
  })
})
