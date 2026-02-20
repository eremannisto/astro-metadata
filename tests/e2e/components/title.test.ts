import { test, expect } from "@playwright/test"

test.describe("Title", () => {

  test.describe("basic", () => {
    test("renders title tag", async ({ page }) => {
      await page.goto("/title/basic")
      expect(await page.title()).toBe("My Page")
    })
  })

  test.describe("with-template", () => {
    test("renders title with template", async ({ page }) => {
      await page.goto("/title/with-template")
      expect(await page.title()).toBe("My Page | My Site")
    })
  })

})