import { expect, test } from "@playwright/test"

test.describe("Metadata without the integration", () => {
  test("renders the basic tags first", async ({ page }) => {
    await page.goto("/minimal")
    const html = await page.content()
    expect(html.indexOf('<meta charset="UTF-8">')).toBeLessThan(html.indexOf("<title>"))
    await expect(page.locator("meta[name='viewport']")).toHaveAttribute(
      "content",
      "width=device-width, initial-scale=1"
    )
    expect(await page.title()).toBe("Minimal")
  })

  test("renders only the necessary tags for a page with only a title", async ({ page }) => {
    await page.goto("/minimal")
    await expect(page.locator("meta[name='description']")).not.toBeAttached()
    await expect(page.locator("meta[name='robots']")).not.toBeAttached()
    await expect(page.locator("meta[name='theme-color']")).not.toBeAttached()
    await expect(page.locator("meta[property='og:image']")).not.toBeAttached()
    await expect(page.locator("link[rel='icon']")).not.toBeAttached()
    await expect(page.locator("link[rel='manifest']")).not.toBeAttached()
    await expect(page.locator("meta[name='twitter:card']")).toHaveAttribute("content", "summary")
  })

  test("renders the description, the page values and the social tags", async ({ page }) => {
    await page.goto("/")
    const content = async (selector: string) => {
      return page.locator(selector).getAttribute("content")
    }
    expect(await page.title()).toBe("Spring Exhibition")
    expect(await content("meta[name='description']")).toBe("Tools by Acme Studio.")
    expect(await content("meta[property='og:title']")).toBe("Spring Exhibition")
    expect(await content("meta[property='og:description']")).toBe("Tools by Acme Studio.")
    expect(await content("meta[property='og:type']")).toBe("article")
    expect(await content("meta[property='og:url']")).toBe("https://example.com/")
    expect(await content("meta[property='og:image']")).toBe("https://example.com/spring.jpg")
    expect(await content("meta[property='og:image:alt']")).toBe("A painting")
    expect(await content("meta[property='og:image:width']")).toBe("1600")
    expect(await content("meta[property='og:image:height']")).toBe("900")
    expect(await content("meta[name='twitter:card']")).toBe("summary_large_image")
    expect(await content("meta[name='twitter:creator']")).toBe("@acmewriter")
    expect(await content("meta[property='article:published_time']")).toBe("2026-03-01")
  })

  test("renders only the Twitter (X) tags that Open Graph does not give", async ({ page }) => {
    await page.goto("/")
    for (const name of ["twitter:title", "twitter:description", "twitter:image", "twitter:url"]) {
      await expect(page.locator(`meta[name='${name}']`)).not.toBeAttached()
    }
  })

  test("renders the canonical URL of the page, or the canonical prop", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("link[rel='canonical']")).toHaveAttribute(
      "href",
      "https://example.com/"
    )
    await page.goto("/canonical")
    await expect(page.locator("link[rel='canonical']")).toHaveAttribute(
      "href",
      "https://example.com/other-page"
    )
  })

  test("renders absolute hreflang links", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("link[hreflang='fi']")).toHaveAttribute(
      "href",
      "https://example.com/fi"
    )
    await expect(page.locator("link[hreflang='x-default']")).toHaveAttribute(
      "href",
      "https://example.com/"
    )
  })

  test("renders the robots tag only with index or follow set to false", async ({ page }) => {
    await page.goto("/robots/noindex")
    await expect(page.locator("meta[name='robots']")).toHaveAttribute("content", "noindex")
    await page.goto("/robots/nofollow")
    await expect(page.locator("meta[name='robots']")).toHaveAttribute(
      "content",
      "noindex, nofollow"
    )
  })

  test("renders the article and the own schema as one graph", async ({ page }) => {
    await page.goto("/")
    const json = await page.locator("script[type='application/ld+json']").textContent()
    // Without the integration, there is no site data: the article and the own item
    expect(JSON.parse(json!)).toEqual({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Article",
          "@id": "https://example.com/#article",
          headline: "Spring Exhibition",
          description: "Tools by Acme Studio.",
          image: ["https://example.com/spring.jpg"],
          datePublished: "2026-03-01",
          author: [{ "@type": "Person", name: "Acme Writer" }],
          mainEntityOfPage: "https://example.com/",
        },
        { "@type": "WebSite", name: "My Site" },
      ],
    })
  })

  test("escapes the schema and keeps $ patterns in the title", async ({ page }) => {
    await page.goto("/escaped")
    expect(await page.title()).toBe("Save $& now")
    const script = page.locator("script[type='application/ld+json']")
    expect(JSON.parse((await script.textContent())!)["@graph"][0].name).toBe("</script><b>&")
    await expect(page.locator("b")).not.toBeAttached()
  })
})
