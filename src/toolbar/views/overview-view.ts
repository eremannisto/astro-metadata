import { html, LitElement, nothing, unsafeCSS } from "lit"

import { LIMITS } from "../../lib/checks.js"
import { findMeta } from "../data.ts"
import type { Check, PageMetadata } from "../data.ts"
import shared from "../styles/shared.css?inline"

import "../ui/alert/alert.ts"
import "../ui/color-swatch/color-swatch.ts"
import "../ui/image/image.ts"

import { define } from "../define.ts"
import type { AlertItem } from "../ui/alert/alert.ts"
import type { Level } from "../ui/badge/badge.ts"
import { code, withCode } from "../ui/inline-code/inline-code.ts"

import "../ui/section/section.ts"
import "../ui/table/table.ts"

import type { Section } from "../ui/section/section.ts"
import type { Table, TableRow } from "../ui/table/table.ts"
import { manifestBlock, schemaBlocks } from "./code-blocks.ts"
import styles from "./overview-view.css?inline"

/** An icon file of the page: a link tag or an icon of the web app manifest. */
type IconFile = {
  /** The path of the file, without the query, e.g. "/favicon-32.png". */
  path: string
  /** The URL to load the image. */
  src: string
  sizes?: string
  type?: string
  /** "icon", "apple-touch-icon" or "manifest". */
  use: string
}

/** The part of a web app manifest that the Overview reads. */
type ManifestJson = {
  icons?: { src: string; sizes?: string; type?: string }[]
}

/**
 * Returns the size of an icon from its `sizes` value, e.g. 32 for "32x32".
 * An icon without a size, e.g. an SVG, scales to any size, so it sorts last.
 */
function sizeOf(file: IconFile): number {
  const size = Number.parseInt(file.sizes ?? "", 10)
  return Number.isNaN(size) ? Number.POSITIVE_INFINITY : size
}

/**
 * Returns all icon files of the page, from the smallest to the largest.
 */
function iconFiles(data: PageMetadata): IconFile[] {
  const files: IconFile[] = data.icons.map((icon) => {
    return {
      path: icon.href.split("?")[0],
      src: icon.href,
      sizes: icon.sizes,
      type: icon.type,
      use: icon.rel,
    }
  })

  const manifest = data.manifest
  const manifestIcons = (manifest?.data as ManifestJson | undefined)?.icons ?? []
  // Manifest icon paths are relative to the manifest URL
  const base = new URL(manifest?.url ?? "", location.href)
  for (const icon of manifestIcons) {
    const url = new URL(icon.src, base)
    files.push({
      path: url.pathname,
      src: url.href,
      sizes: icon.sizes,
      type: icon.type,
      use: "manifest",
    })
  }

  return files.sort((a, b) => {
    return sizeOf(a) - sizeOf(b)
  })
}

// The section of each field of a check. A field without a row in the section,
// e.g. "charset", opens only the section.
const FIELD_SECTIONS: Record<string, string> = {
  "json-ld": "Structured data",
  hreflang: "Locales",
}

/**
 * Returns the section of a field: "Social" for the Open Graph and Twitter (X) tags,
 * else "General".
 */
function sectionOf(field: string): string {
  if (FIELD_SECTIONS[field]) return FIELD_SECTIONS[field]
  if (field.startsWith("og:") || field.startsWith("twitter:")) return "Social"
  return "General"
}

/**
 * Returns the short name of a feed type, e.g. "rss" for "application/rss+xml".
 */
function feedFormat(type: string | undefined): string | undefined {
  if (!type) return undefined
  if (type.includes("atom")) return "atom"
  if (type.includes("json")) return "json"
  if (type.includes("rss")) return "rss"
  return type
}

/**
 * Returns a row with the tag name in the note. A row without a value gets no tag name.
 */
function tagRow(label: string, value: TableRow["value"], tag: string): TableRow {
  return { label, key: tag, value, note: value === undefined ? undefined : tag }
}

/**
 * Returns the heading of an alert, e.g. "Error: 1" or "Errors: 3".
 */
function heading(word: string, amount: number): string {
  return `${word}${amount === 1 ? "" : "s"}: ${amount}`
}

/**
 * Returns "1 file" or "3 files".
 */
function count(amount: number, word: string): string {
  return `${amount} ${word}${amount === 1 ? "" : "s"}`
}

/**
 * Returns a table row with the length of a text against a limit. The length is yellow
 * from 90 % of the limit, and orange over the limit.
 */
function lengthRow(label: string, key: string, text: string | undefined, limit: number): TableRow {
  if (!text) return { label, key }

  let noteLevel: TableRow["noteLevel"]
  if (text.length > limit) noteLevel = "over"
  else if (text.length >= limit * 0.9) noteLevel = "near"
  return { label, key, value: text, note: `${text.length} / ${limit}`, noteLevel }
}

/**
 * The values of the page at one look: the status, then the values by category,
 * in the order of their importance.
 */
export class OverviewView extends LitElement {
  static properties = { data: { attribute: false } }
  static styles = [unsafeCSS(shared), unsafeCSS(styles)]

  declare data: PageMetadata

  /**
   * Returns the Twitter (X) rows. Twitter (X) uses the Open Graph title, description and image,
   * so these rows show only when the page has its own Twitter (X) value.
   */
  twitterRows(): TableRow[] {
    const x = this.data.twitter
    const rows = [
      tagRow("Card", code(findMeta(x, "twitter:card")), "twitter:card"),
      tagRow("Site", code(findMeta(x, "twitter:site")), "twitter:site"),
      tagRow("Creator", code(findMeta(x, "twitter:creator")), "twitter:creator"),
    ]
    const overrides = [
      tagRow("Title", findMeta(x, "twitter:title"), "twitter:title"),
      tagRow("Description", findMeta(x, "twitter:description"), "twitter:description"),
      tagRow("Image", findMeta(x, "twitter:image"), "twitter:image"),
    ].filter((row) => {
      return row.value !== undefined
    })
    return [...rows, ...overrides]
  }

  /**
   * Opens the section of a field, and marks its row, e.g. after a click on a problem.
   */
  async showField(field: string): Promise<void> {
    const section = this.renderRoot.querySelector<Section>(
      `astro-metadata-section[heading="${sectionOf(field)}"]`
    )
    if (!section || section.empty) return

    section.closed = false
    await section.updateComplete
    for (const table of section.querySelectorAll<Table>("astro-metadata-table")) {
      if (await table.highlight(field)) return
    }
    section.scrollIntoView({ block: "start", behavior: "smooth" })
  }

  /**
   * Returns an alert with the checks of one level, e.g. all errors.
   */
  renderAlert(level: Level, heading: string, checks: Check[]) {
    const items: AlertItem[] = checks.map((check) => {
      return { content: withCode(check.message), target: check.field }
    })
    return html`
      <astro-metadata-alert
        level=${level}
        heading=${heading}
        .items=${items}
        @select=${(event: CustomEvent<string>) => {
          this.showField(event.detail)
        }}
      ></astro-metadata-alert>
    `
  }

  /**
   * The status of the page: one alert for each level, with the errors first.
   * Without errors and warnings, a green alert shows that all is good.
   */
  renderStatus() {
    if (this.data.ignored) {
      return html`
        <div class="alerts">
          <astro-metadata-alert
            level="info"
            heading="Checks are off for this page"
            .items=${[{ content: withCode("The `pages.ignore` option of the integration matches this page.") }]}
          ></astro-metadata-alert>
        </div>
      `
    }

    const checks = this.data.checks
    const byLevel = (level: Check["level"]) => {
      return checks.filter((check) => {
        return check.level === level
      })
    }
    const errors = byLevel("error")
    const warnings = byLevel("warning")
    const notes = byLevel("info")

    // A noindex page is not a problem, but it is also not "all good"
    const hidden = /noindex/i.test(this.data.robots ?? "")
    const good = errors.length === 0 && warnings.length === 0 && !hidden

    return html`
      <div class="alerts">
        ${errors.length > 0 ? this.renderAlert("error", heading("Error", errors.length), errors) : nothing}
        ${
          warnings.length > 0
            ? this.renderAlert("warning", heading("Warning", warnings.length), warnings)
            : nothing
        }
        ${good ? this.renderAlert("success", "No issues found", []) : nothing}
        ${
          notes.length > 0
            ? this.renderAlert(
                "info",
                hidden ? "Hidden from search engines" : heading("Note", notes.length),
                notes
              )
            : nothing
        }
      </div>
    `
  }

  /**
   * The favicon row: the logo, and the number of files. Its child rows list all icon
   * files, from the smallest to the largest. The logo is the SVG, or else the largest file.
   */
  faviconRow(): TableRow {
    const files = iconFiles(this.data)
    if (files.length === 0) return { label: "Favicons", key: "favicon" }

    const svg = files.find((file) => {
      return file.type === "image/svg+xml"
    })
    const logo = svg ?? files[files.length - 1]

    return {
      label: "Favicons",
      key: "favicon",
      value: html`<span class="favicon"
        ><img src=${logo.src} alt="" width="20" height="20"
      /></span>`,
      note: count(files.length, "file"),
      children: files.map((file) => {
        const size = sizeOf(file)
        return {
          label: Number.isFinite(size) ? `${size} × ${size}` : "Any size",
          value: code(file.path),
          note: file.use,
        }
      }),
    }
  }

  renderLocales() {
    const links = this.data.hreflang
    if (links.length === 0) return nothing

    const page = this.data.canonical
    const rows: TableRow[] = links.map((link) => {
      const fallback = link.hreflang === "x-default"
      return {
        label: fallback ? "Default" : (link.hreflang ?? ""),
        labelCode: !fallback,
        value: link.href,
        // Shows which row is the current page, and what "Default" is
        note: fallback ? "x-default" : link.href === page ? "this page" : undefined,
      }
    })
    return html`<astro-metadata-table .rows=${rows}></astro-metadata-table>`
  }

  renderFeeds() {
    const feeds = this.data.feeds
    if (feeds.length === 0) return nothing

    const rows: TableRow[] = feeds.map((feed) => {
      return { label: feed.title ?? "Feed", value: code(feed.href), note: feedFormat(feed.type) }
    })
    return html`<astro-metadata-table .rows=${rows}></astro-metadata-table>`
  }

  render() {
    const data = this.data
    const og = data.openGraph
    const image = findMeta(og, "og:image")
    const width = findMeta(og, "og:image:width")
    const height = findMeta(og, "og:image:height")

    return html`
      ${this.renderStatus()}

      <astro-metadata-section heading="General">
        <astro-metadata-table
          .rows=${[
            lengthRow("Title", "title", data.title, LIMITS.title),
            lengthRow("Description", "description", data.description, LIMITS.description),
            { label: "Canonical", key: "canonical", value: data.canonical },
            { label: "Robots", key: "robots", value: code(data.robots ?? "index, follow") },
            { label: "Language", key: "lang", value: code(data.lang) },
            {
              label: "Theme color",
              key: "theme-color",
              value:
                data.themeColors.length > 0
                  ? html`${data.themeColors.map((theme) => {
                      return html`<astro-metadata-color-swatch color=${theme.color}>
                      </astro-metadata-color-swatch>`
                    })}`
                  : undefined,
            },
            this.faviconRow(),
          ]}
        ></astro-metadata-table>
      </astro-metadata-section>

      <astro-metadata-section heading="Social">
        <astro-metadata-image class="image" .src=${image}></astro-metadata-image>
        <h3 class="subheading">Open Graph</h3>
        <astro-metadata-table
          .rows=${[
            tagRow("Title", findMeta(og, "og:title"), "og:title"),
            tagRow("Description", findMeta(og, "og:description"), "og:description"),
            tagRow("Type", code(findMeta(og, "og:type")), "og:type"),
            tagRow("Site name", findMeta(og, "og:site_name"), "og:site_name"),
            tagRow("Image", image, "og:image"),
            tagRow(
              "Image size",
              width && height ? `${width} × ${height}` : undefined,
              "og:image:width"
            ),
            tagRow("Image alt", findMeta(og, "og:image:alt"), "og:image:alt"),
          ]}
        ></astro-metadata-table>
        <h3 class="subheading">Twitter (X)</h3>
        <astro-metadata-table .rows=${this.twitterRows()}></astro-metadata-table>
      </astro-metadata-section>

      <astro-metadata-section heading="Locales" ?empty=${data.hreflang.length === 0}
        >${this.renderLocales()}</astro-metadata-section
      >

      <astro-metadata-section heading="Structured data" ?empty=${data.schemas.length === 0}>
        ${schemaBlocks(data.schemas)}
      </astro-metadata-section>

      <astro-metadata-section heading="Web app manifest" ?empty=${!data.manifest}>
        ${manifestBlock(data.manifest)}
      </astro-metadata-section>

      <astro-metadata-section heading="Feeds" ?empty=${data.feeds.length === 0}
        >${this.renderFeeds()}</astro-metadata-section
      >
    `
  }
}

define("astro-metadata-overview", OverviewView)
