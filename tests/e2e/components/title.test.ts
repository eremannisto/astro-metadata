import { expect, test } from "@playwright/test"

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

  test.describe("with-dollar", () => {
    test("keeps dollar patterns in the title as text", async ({ page }) => {
      await page.goto("/title/with-dollar")
      expect(await page.title()).toBe("Price $& $1 $$ more | My Site")
    })
  })

  test.describe("without-placeholder", () => {
    test("renders the title unchanged when the template has no %s", async ({ page }) => {
      await page.goto("/title/without-placeholder")
      expect(await page.title()).toBe("My Page")
    })
  })
})
