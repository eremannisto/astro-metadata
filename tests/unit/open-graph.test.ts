import { describe, expect, it } from "vitest"

import { openGraphAlternates, openGraphLocale } from "../../src/lib/open-graph.ts"

describe("openGraphLocale", () => {
  it("adds the most likely region to a language", () => {
    expect(openGraphLocale("fi")).toBe("fi_FI")
    expect(openGraphLocale("en")).toBe("en_US")
  })

  it("keeps the region of the locale", () => {
    expect(openGraphLocale("en-GB")).toBe("en_GB")
    expect(openGraphLocale("en_GB")).toBe("en_GB")
  })

  it("uses the country of the language for a region that is not a country", () => {
    expect(openGraphLocale("es-419")).toBe("es_ES")
    expect(openGraphLocale("en-001")).toBe("en_US")
  })

  it("changes an old language code to its new code", () => {
    expect(openGraphLocale("iw")).toBe("he_IL")
  })

  it("returns undefined for a language without an ISO 639-1 code", () => {
    expect(openGraphLocale("fil")).toBeUndefined()
    expect(openGraphLocale("und")).toBeUndefined()
  })

  it("returns only the language_COUNTRY format", () => {
    for (const locale of ["fi", "en", "en-GB", "zh-Hant", "sr-Latn", "pt-BR", "es-419", "nb"]) {
      expect(openGraphLocale(locale)).toMatch(/^[a-z]{2}_[A-Z]{2}$/)
    }
  })

  it("returns undefined for a value that is not a locale", () => {
    expect(openGraphLocale("x-default")).toBeUndefined()
    expect(openGraphLocale("")).toBeUndefined()
    expect(openGraphLocale(undefined)).toBeUndefined()
  })
})

describe("openGraphAlternates", () => {
  it("returns the other locales without x-default", () => {
    expect(openGraphAlternates("fi", ["en", "fi", "x-default"])).toEqual(["en_US"])
  })

  it("removes the duplicates", () => {
    expect(openGraphAlternates("fi", ["en", "en-US", "sv"])).toEqual(["en_US", "sv_SE"])
  })

  it("returns all locales for a page without a locale", () => {
    expect(openGraphAlternates(undefined, ["en", "fi"])).toEqual(["en_US", "fi_FI"])
  })
})
