/**
 * Returns the most likely ISO 639-1 language and ISO 3166-1 alpha-2 country of a locale,
 * or undefined. A numeric region, e.g. "419" in "es-419", is not a country.
 */
function languageAndCountry(locale: string): { language: string; country?: string } | undefined {
  try {
    const parsed = new Intl.Locale(locale)
    // "und" is the undefined language: maximize() changes it to "en"
    if (!parsed.language || parsed.language === "und") return undefined

    const { language, region } = parsed.maximize()
    if (!/^[a-z]{2}$/.test(language)) return undefined
    return { language, country: region && /^[A-Z]{2}$/.test(region) ? region : undefined }
  } catch {
    return undefined
  }
}

/**
 * Returns a locale in the format of Open Graph: an ISO 639-1 language and an ISO 3166-1
 * alpha-2 country, e.g. "fi_FI". A locale without a country gets the most likely country
 * of its language: "fi" becomes "fi_FI", "en" becomes "en_US" and "es-419" becomes "es_ES".
 * Returns undefined for a locale without this format, e.g. "x-default" or "fil".
 *
 * @param locale - A locale, e.g. "fi", "en-GB" or "en_GB".
 */
export function openGraphLocale(locale: string | undefined): string | undefined {
  if (!locale) return undefined

  const value = languageAndCountry(locale.replace("_", "-"))
  if (!value) return undefined

  const country = value.country ?? languageAndCountry(value.language)?.country
  return country ? `${value.language}_${country}` : undefined
}

/**
 * Returns the other locales of the page in the format of Open Graph, for the
 * `og:locale:alternate` tags. The list has no duplicates and not the locale of the page.
 *
 * @param locale - The locale of the page, e.g. "fi".
 * @param hreflang - The locales of the hreflang links, e.g. ["en", "fi", "x-default"].
 */
export function openGraphAlternates(locale: string | undefined, hreflang: string[]): string[] {
  const current = openGraphLocale(locale)
  const alternates = hreflang
    .map((value) => {
      return openGraphLocale(value)
    })
    .filter((value): value is string => {
      return value !== undefined && value !== current
    })
  return [...new Set(alternates)]
}
