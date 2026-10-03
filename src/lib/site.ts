import { getConfig, localize } from "./config.ts"
import type { MetadataConfig } from "./config.ts"
import { pageUrl, url } from "./url.ts"

/**
 * The site values of the integration, and absolute URLs with the Astro `site` and `base`.
 */
export const Site = {
  /**
   * Returns the site values of the integration. Without the integration, all values are undefined.
   */
  get config(): MetadataConfig {
    const config = getConfig()
    return {
      siteName: config.siteName,
      titleTemplate: config.titleTemplate,
      description: config.description,
      image: config.image,
      twitter: config.twitter,
      themeColor: config.themeColor,
      feeds: config.feeds,
      robots: config.robots,
      manifest: config.manifest,
      schema: config.schema,
    }
  },

  /**
   * Returns the name of the site for a locale.
   *
   * @param locale - e.g. "fi". A missing locale uses the first value.
   */
  name(locale?: string): string | undefined {
    return localize(getConfig().siteName, locale)
  },

  /**
   * Returns the full title of a page: the title in the title template, or the site name
   * for a page without a title.
   *
   * @example Site.title("About") // "About | My Site"
   */
  title(title?: string, locale?: string): string | undefined {
    const template = localize(getConfig().titleTemplate, locale)
    if (!title) return Site.name(locale)
    if (!template?.includes("%s")) return title

    // A replacer function keeps "$&" and other "$" patterns in the title as text
    return template.replace("%s", () => {
      return title
    })
  },

  /**
   * Returns the absolute URL of a path, with the Astro `site` and `base`.
   * Absolute URLs stay unchanged.
   *
   * @example Site.url("/og.jpg") // "https://example.com/og.jpg"
   */
  url(path: string): string {
    return url(path)
  },

  /**
   * Returns the absolute URL of a page, with or without the slash at the end,
   * the same as the Astro `trailingSlash` and `build.format` settings.
   *
   * @example Site.pageUrl("/blog") // "https://example.com/blog/"
   */
  pageUrl(path: string): string {
    return pageUrl(path)
  },
}
