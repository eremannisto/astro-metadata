import { describe, it, expect, beforeEach } from "vitest"
import { Metadata } from "../../src/lib/metadata.ts"

describe("Metadata", () => {

  beforeEach(() => {
    Metadata.set({})
  })

  describe("set / get", () => {
    it("stores title", () => {
      Metadata.set({ title: "About" })
      expect(Metadata.get().title).toBe("About")
    })

    it("stores description", () => {
      Metadata.set({ description: "Hello" })
      expect(Metadata.get().description).toBe("Hello")
    })

    it("replaces the entire store on each set", () => {
      Metadata.set({ title: "About", description: "Hello" })
      Metadata.set({ title: "Contact" })
      expect(Metadata.get().description).toBeUndefined()
    })

    it("clears the store when set with empty object", () => {
      Metadata.set({ title: "About" })
      Metadata.set({})
      expect(Metadata.get().title).toBeUndefined()
    })
  })

  describe("getters", () => {
    it("returns title", () => {
      Metadata.set({ title: "About" })
      expect(Metadata.title).toBe("About")
    })

    it("returns description", () => {
      Metadata.set({ description: "Hello" })
      expect(Metadata.description).toBe("Hello")
    })

    it("returns canonical", () => {
      Metadata.set({ canonical: "https://example.com" })
      expect(Metadata.canonical).toBe("https://example.com")
    })

    it("returns keywords", () => {
      Metadata.set({ keywords: ["astro", "seo"] })
      expect(Metadata.keywords).toEqual(["astro", "seo"])
    })

    it("returns undefined for unset values", () => {
      Metadata.set({ title: "About" })
      expect(Metadata.canonical).toBeUndefined()
      expect(Metadata.keywords).toBeUndefined()
      expect(Metadata.description).toBeUndefined()
    })
  })

  describe("resolve", () => {
    it("page title wins over default", () => {
      Metadata.set({ title: "About" })
      const result = Metadata.resolve({ title: "My Site" })
      expect(result.title).toBe("About")
    })

    it("falls back to default title when not set", () => {
      const result = Metadata.resolve({ title: "My Site" })
      expect(result.title).toBe("My Site")
    })

    it("page description wins over default", () => {
      Metadata.set({ description: "Page description" })
      const result = Metadata.resolve({ description: "Default description" })
      expect(result.description).toBe("Page description")
    })

    it("falls back to default description when not set", () => {
      const result = Metadata.resolve({ description: "Default description" })
      expect(result.description).toBe("Default description")
    })

    it("page canonical wins over default", () => {
      Metadata.set({ canonical: "https://example.com/about" })
      const result = Metadata.resolve({ canonical: "https://example.com" })
      expect(result.canonical).toBe("https://example.com/about")
    })

    it("page keywords wins over default", () => {
      Metadata.set({ keywords: ["page", "specific"] })
      const result = Metadata.resolve({ keywords: ["default"] })
      expect(result.keywords).toEqual(["page", "specific"])
    })

    it("page openGraph wins over default", () => {
      Metadata.set({ openGraph: { title: "Page OG Title" } })
      const result = Metadata.resolve({ openGraph: { title: "Default OG Title" } })
      expect(result.openGraph?.title).toBe("Page OG Title")
    })

    it("returns defaults when store is empty", () => {
      const result = Metadata.resolve({
        title:       "My Site",
        description: "Default description",
      })
      expect(result.title).toBe("My Site")
      expect(result.description).toBe("Default description")
    })

    it("returns empty object when store and defaults are empty", () => {
      const result = Metadata.resolve({})
      expect(result).toEqual({})
    })
  })

})