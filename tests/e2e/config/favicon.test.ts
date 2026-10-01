import { expect, test } from "@playwright/test"

import { readIco, readPng } from "../lib/image.ts"

// The background color of the Apple icon in the fixture: #1e40af
const BACKGROUND = { r: 0x1e, g: 0x40, b: 0xaf, alpha: 255 }

test.describe("generated favicon tags", () => {
  test("renders the tags with a hash in the URLs", async ({ page }) => {
    await page.goto("/")
    const ico = page.locator("link[rel='icon'][type='image/x-icon']")
    await expect(ico).toHaveAttribute("href", /^\/favicon\.ico\?v=[0-9a-f]{8}$/)
    await expect(page.locator("link[rel='icon'][type='image/svg+xml']")).toHaveAttribute(
      "href",
      /^\/favicon\.svg\?v=[0-9a-f]{8}$/
    )
    for (const size of [16, 32]) {
      await expect(
        page.locator(`link[rel='icon'][type='image/png'][sizes='${size}x${size}']`)
      ).toHaveAttribute("href", new RegExp(`^/favicon-${size}\\.png\\?v=[0-9a-f]{8}$`))
    }
    await expect(page.locator("link[rel='apple-touch-icon']")).toHaveAttribute(
      "href",
      /^\/apple-touch-icon\.png\?v=[0-9a-f]{8}$/
    )
  })
})

test.describe("generated favicon files", () => {
  test("renders an ICO file with two images", async ({ request }) => {
    const response = await request.get("/favicon.ico")
    expect(response.status()).toBe(200)
    expect(readIco(await response.body())).toBe(2)
  })

  test("renders the SVG source", async ({ request }) => {
    const response = await request.get("/favicon.svg")
    expect(response.status()).toBe(200)
    expect(await response.text()).toContain("<svg")
  })

  test("renders the Apple icon with the background color", async ({ request }) => {
    const png = await readPng(await (await request.get("/apple-touch-icon.png")).body())
    expect(png).toMatchObject({ width: 180, height: 180, format: "png" })
    expect(png.corner).toEqual(BACKGROUND)
  })

  test("renders the PNG icons in their sizes", async ({ request }) => {
    for (const size of [16, 32, 192, 512]) {
      const png = await readPng(await (await request.get(`/favicon-${size}.png`)).body())
      expect(png).toMatchObject({ width: size, height: size, format: "png" })
    }
  })

  test("does not render the old maskable icon", async ({ request }) => {
    expect((await request.get("/favicon-mask.png")).status()).toBe(404)
  })
})
