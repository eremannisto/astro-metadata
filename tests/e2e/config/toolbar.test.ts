import { expect, test } from "@playwright/test"

test.describe("dev toolbar app", () => {
  test("shows the checks, the previews and the head of the page", async ({ page }, info) => {
    test.skip(!info.project.name.endsWith("(dev)"), "The dev toolbar runs only in dev")

    await page.goto("/")
    const button = page.locator("astro-dev-toolbar [data-app-id='mannisto-astro-metadata']")
    await button.first().click()

    const canvas = page.locator(
      "astro-dev-toolbar astro-dev-toolbar-app-canvas[data-app-id='mannisto-astro-metadata']"
    )
    await expect(canvas.locator("h2")).toHaveText("Metadata")
    await expect(canvas.locator(".google .title")).toHaveText(await page.title())
    await expect(canvas.locator("th", { hasText: "Canonical" })).toBeVisible()
  })
})
