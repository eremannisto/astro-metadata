import { getConfig, localize } from "./config.ts"
import type { MetadataImage, ThemeColor } from "./config.ts"
import { Favicon } from "./favicon.ts"
import type { ManifestIcon } from "./favicon.ts"
import { url } from "./url.ts"

/** The options of the `Site` values that can have a text for each locale. */
export type SiteOptions = {
  /** The locale of the text, e.g. "fi". Defaults to the first text. */
  locale?: string
}

/**
 * The values that you set in the integration. Each method returns `undefined` for an
 * option that is not set.
 *
 * @example Site.description({ locale: "fi" })
 */
export const Site = {
  /**
   * Returns the `siteName` of the locale.
   *
   * @example Site.name() // "Acme Studio"
   */
  name(options: SiteOptions = {}): string | undefined {
    return localize(getConfig().siteName, options.locale)
  },

  /**
   * Returns the `titleTemplate` of the locale.
   *
   * @example Site.template() // "%s | Acme Studio"
   */
  template(options: SiteOptions = {}): string | undefined {
    return localize(getConfig().titleTemplate, options.locale)
  },

  /**
   * Returns the `description` of the locale.
   *
   * @example Site.description({ locale: "fi" })
   */
  description(options: SiteOptions = {}): string | undefined {
    return localize(getConfig().description, options.locale)
  },

  /**
   * Returns the `image` with an absolute URL, and the alt text of the locale.
   *
   * @example Site.image() // { url: "https://example.com/og.jpg", alt: "Acme Studio", … }
   */
  image(options: SiteOptions = {}): MetadataImage | undefined {
    const image = getConfig().image
    if (!image) return undefined

    return {
      url: url(image.url),
      alt: localize(image.alt, options.locale),
      width: image.width,
      height: image.height,
    }
  },

  /**
   * Returns the `twitter` values. The card defaults to "summary_large_image".
   *
   * @example Site.twitter() // { site: "@acmestudio", card: "summary_large_image" }
   */
  twitter(): { site?: string; card: "summary" | "summary_large_image" } | undefined {
    const twitter = getConfig().twitter
    if (!twitter) return undefined

    return {
      site: twitter.site,
      card: twitter.card ?? "summary_large_image",
    }
  },

  /**
   * Returns the `themeColor`: one color, or `{ light, dark }`.
   */
  themeColor(): ThemeColor | undefined {
    return getConfig().themeColor
  },

  /**
   * Returns the icons of the generated favicons, for the `icons` field of your own web app
   * manifest. Without the `favicon` option, the list is empty.
   *
   * @example export const GET = () => Response.json({ name: "Acme Studio", icons: Site.icons() })
   */
  icons(): ManifestIcon[] {
    return Favicon.icons()
  },
}
