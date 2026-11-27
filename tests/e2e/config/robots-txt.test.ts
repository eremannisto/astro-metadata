import { expect, test } from "@playwright/test"

test.describe("robots.txt", () => {
  test("blocks the AI training crawlers and allows the other crawlers", async ({ request }) => {
    const response = await request.get("/robots.txt")
    expect(response.status()).toBe(200)
    expect(response.headers()["content-type"]).toContain("text/plain")

    const text = await response.text()
    expect(text).toContain("User-agent: GPTBot\n")
    expect(text).toContain("User-agent: ClaudeBot\n")
    expect(text).not.toContain("User-agent: OAI-SearchBot\n")
    expect(text).toContain("Disallow: /\n\nUser-agent: *\nAllow: /\n")
  })

  test("keeps the extra directives in the robots meta tag only", async ({ page, request }) => {
    await page.goto("/")
    await expect(page.locator("meta[name='robots']")).toHaveAttribute(
      "content",
      "max-image-preview:large"
    )
    const text = await (await request.get("/robots.txt")).text()
    expect(text).not.toContain("max-image-preview")
  })
})
