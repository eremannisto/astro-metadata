import { expect, test } from "@playwright/test"
import type { Page } from "@playwright/test"

/**
 * Opens a page and the Metadata app from the dev toolbar.
 */
async function openApp(page: Page, path: string): Promise<void> {
  await page.goto(path)
  await page.locator("astro-dev-toolbar [data-app-id='mannisto-astro-metadata']").first().click()
}

// The Playwright config runs this file only with the dev server
test.describe("dev toolbar app", () => {
  test("opens the panel from the toolbar and shows the tabs", async ({ page }) => {
    await openApp(page, "/")

    const panel = page.locator("astro-metadata-panel")
    await expect(panel.locator("h1")).toHaveText("Metadata")
    await expect(
      panel.locator("astro-metadata-overview astro-metadata-alert").first()
    ).toHaveAttribute("heading", "No issues found")

    await panel.locator("astro-metadata-tab-group button", { hasText: "Previews" }).click()
    await expect(panel.locator(".google .title")).toHaveText(await page.title())
  })

  test("shows the link preview of each platform, with only the first one open", async ({
    page,
  }) => {
    await openApp(page, "/")
    const panel = page.locator("astro-metadata-panel")
    await panel.locator("astro-metadata-tab-group button", { hasText: "Previews" }).click()

    const sections = panel.locator("astro-metadata-previews astro-metadata-section")
    const headings = await sections.evaluateAll((elements) => {
      return elements.map((element) => {
        return element.getAttribute("heading")
      })
    })
    expect(headings).toEqual([
      "Google",
      "Twitter (X)",
      "Facebook",
      "LinkedIn",
      "WhatsApp",
      "Discord",
      "Slack",
    ])
    await expect(
      panel.locator("astro-metadata-previews astro-metadata-section[closed]")
    ).toHaveCount(6)
  })

  test("shows the problems of the custom rules", async ({ page }) => {
    await openApp(page, "/overrides")
    const alert = page.locator("astro-metadata-overview astro-metadata-alert[level='warning']")
    await expect(alert).toContainText("The page has its own title.")
  })

  test("shows no problems on an ignored page", async ({ page }) => {
    await openApp(page, "/unknown-locale")
    const alerts = page.locator("astro-metadata-overview astro-metadata-alert")
    await expect(alerts).toHaveCount(1)
    await expect(alerts).toHaveAttribute("heading", "Checks are off for this page")
  })

  test("closes the panel with Escape", async ({ page }) => {
    await openApp(page, "/")
    const panel = page.locator("astro-metadata-panel .panel")
    await expect(panel).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(panel).toBeHidden()
  })

  test("shows the head, the structured data and the manifest as raw code", async ({ page }) => {
    await openApp(page, "/fi/schema")
    const panel = page.locator("astro-metadata-panel")
    await panel.locator("astro-metadata-tab-group button", { hasText: "Raw" }).click()

    const blocks = panel.locator("astro-metadata-raw astro-metadata-code")
    await expect(blocks).toHaveCount(3)
    await expect(blocks.nth(1).locator(".toolbar")).toContainText(
      "WebSite, Organization, BreadcrumbList"
    )
    await expect(blocks.nth(2).locator(".toolbar")).toContainText("/fi/manifest.webmanifest")
  })
})
