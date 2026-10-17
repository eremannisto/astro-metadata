/** The values of the Astro page that the i18n adapter reads. */
export type I18nPage = {
  url: URL
  currentLocale?: string
}

/**
 * Reads the locale values of a page from the i18n setup of the project:
 * `@mannisto/astro-i18n`, or the `i18n` option of Astro.
 */
export type I18nAdapter = {
  /** The locale of the page, e.g. "fi". */
  locale(page: I18nPage): string | undefined
  /** The public path of the page, e.g. "/about" for the default locale without a prefix. */
  path(page: I18nPage): string
  /** The path of the page in each locale, and `x-default`. */
  alternates(page: I18nPage): { hreflang: string; href: string }[]
}

// Without an i18n setup, there is no adapter. The integration replaces this module with
// an adapter for `@mannisto/astro-i18n` or for the `i18n` option of Astro.
export const i18n: I18nAdapter | undefined = undefined
