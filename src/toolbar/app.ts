import { defineToolbarApp } from "astro/toolbar"

import { checkHead, findLink, parseHead } from "../lib/checks.js"
import type { Check, HeadData } from "../lib/checks.js"

const STYLE = `
<style>
  :host astro-dev-toolbar-window {
    max-height: 480px;
    overflow-y: auto;
    color-scheme: dark;
  }
  h2 { margin: 0 0 8px; font-size: 16px; color: #fff; }
  h3 { margin: 16px 0 8px; font-size: 13px; color: #fff; }
  section + section { margin-top: 16px; }
  ul { margin: 0; padding: 0; list-style: none; }
  .check { padding: 6px 8px; margin-bottom: 4px; border-radius: 6px; font-size: 13px; }
  .error { background: rgba(185, 28, 28, 0.35); }
  .warning { background: rgba(180, 83, 9, 0.35); }
  .info { background: rgba(29, 78, 216, 0.35); }
  .ok { background: rgba(21, 128, 61, 0.35); }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { padding: 4px 8px 4px 0; text-align: left; vertical-align: top; }
  th { width: 140px; color: #bfc1c9; font-weight: 500; white-space: nowrap; }
  td { color: #fff; word-break: break-all; }
  td.empty { color: #6b7280; }
  .previews { display: grid; gap: 4px; max-width: 520px; }
  .label { margin-top: 8px; font-size: 12px; color: #bfc1c9; }
  .card { background: #fff; color: #202124; border-radius: 8px; overflow: hidden; }
  .google { padding: 12px 16px; font-family: Arial, sans-serif; }
  .google .site { font-size: 12px; color: #4d5156; }
  .google .title { font-size: 20px; color: #1a0dab; margin: 4px 0; line-height: 1.3; }
  .google .text { font-size: 14px; color: #4d5156; line-height: 1.5; }
  .social img { display: block; width: 100%; aspect-ratio: 1.91 / 1; object-fit: cover; background: #e5e7eb; }
  .social .body { padding: 10px 12px; font-family: system-ui, sans-serif; }
  .social .host { font-size: 12px; color: #65676b; text-transform: uppercase; }
  .social .title { font-size: 16px; font-weight: 600; margin: 2px 0; }
  .social .text { font-size: 14px; color: #65676b; }
  .x { border: 1px solid #cfd9de; border-radius: 16px; }
  .x.small { display: flex; }
  .x.small img { width: 130px; aspect-ratio: 1; flex: none; }
  .x .host { text-transform: none; color: #536471; }
  .clamp { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
  .missing { padding: 24px; text-align: center; color: #6b7280; background: #f3f4f6; font-size: 13px; }
  .x.small .missing { width: 130px; flex: none; box-sizing: border-box; padding: 24px 8px; }
</style>`

/**
 * Escapes a text for use in HTML.
 */
function escape(value: string | undefined): string {
  return (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

/**
 * Returns the host of a URL, or the host of the current page for an invalid URL.
 */
function hostOf(value: string | undefined): string {
  try {
    return new URL(value ?? "", location.href).host
  } catch {
    return location.host
  }
}

/**
 * Renders the list of checks, or one line when the page has no problems.
 */
function renderChecks(checks: Check[]): string {
  if (checks.length === 0) {
    return `<ul><li class="check ok">The metadata of this page has no problems.</li></ul>`
  }
  const items = checks.map((check) => {
    return `<li class="check ${check.level}">${escape(check.message)}</li>`
  })
  return `<ul>${items.join("")}</ul>`
}

/**
 * Renders the image of a social card, or a box when the page has no image.
 */
function renderImage(image: string | undefined): string {
  if (!image) return `<div class="missing">No image</div>`
  return `<img src="${escape(image)}" alt="" data-preview />`
}

/**
 * Renders how the page looks as a Google result, as an X card and as a Facebook or LinkedIn card.
 */
function renderPreviews(head: HeadData): string {
  const meta = head.meta
  const title = head.titles[0]
  const canonical = findLink(head, "canonical") ?? location.href
  const host = hostOf(canonical)
  const path = new URL(canonical, location.href).pathname.split("/").filter(Boolean)

  const ogTitle = meta["og:title"] ?? title
  const ogDescription = meta["og:description"] ?? meta.description
  const ogImage = meta["og:image"]
  const xTitle = meta["twitter:title"] ?? ogTitle
  const xImage = meta["twitter:image"] ?? ogImage
  const xSmall = (meta["twitter:card"] ?? "summary") === "summary"

  return `
    <div class="previews">
      <div class="label">Google</div>
      <div class="card google">
        <div class="site">${escape(meta["og:site_name"] ?? host)} › ${escape([host, ...path].join(" › "))}</div>
        <div class="title clamp">${escape(title)}</div>
        <div class="text clamp">${escape(meta.description)}</div>
      </div>
      <div class="label">X</div>
      <div class="card social x${xSmall ? " small" : ""}">
        ${renderImage(xImage)}
        <div class="body">
          <div class="host">${escape(host)}</div>
          <div class="title clamp">${escape(xTitle)}</div>
        </div>
      </div>
      <div class="label">Facebook, LinkedIn</div>
      <div class="card social">
        ${renderImage(ogImage)}
        <div class="body">
          <div class="host">${escape(host)}</div>
          <div class="title clamp">${escape(ogTitle)}</div>
          <div class="text clamp">${escape(ogDescription)}</div>
        </div>
      </div>
    </div>`
}

/**
 * Renders the metadata of the page as a table.
 */
function renderTable(head: HeadData): string {
  const alternates = head.links.filter((link) => {
    return link.rel === "alternate" && link.hreflang
  })
  const feeds = head.links.filter((link) => {
    return link.rel === "alternate" && !link.hreflang && link.type
  })
  const types = head.schemas.map((schema) => {
    try {
      const data = JSON.parse(schema)
      const items = Array.isArray(data) ? data : [data]
      return items
        .map((item) => {
          return item["@type"] ?? "?"
        })
        .join(", ")
    } catch {
      return "invalid JSON"
    }
  })

  const rows: [string, string | undefined][] = [
    ["Title", head.titles[0]],
    ["Description", head.meta.description],
    ["Language", head.lang],
    ["Canonical", findLink(head, "canonical")],
    ["Robots", head.meta.robots],
    ["og:title", head.meta["og:title"]],
    ["og:description", head.meta["og:description"]],
    ["og:image", head.meta["og:image"]],
    ["og:type", head.meta["og:type"]],
    ["twitter:card", head.meta["twitter:card"]],
    ["twitter:site", head.meta["twitter:site"]],
    [
      "Alternates",
      alternates
        .map((link) => {
          return `${link.hreflang}: ${link.href}`
        })
        .join("\n"),
    ],
    [
      "Feeds",
      feeds
        .map((link) => {
          return `${link.title ?? link.type}: ${link.href}`
        })
        .join("\n"),
    ],
    ["Manifest", findLink(head, "manifest")],
    ["Theme color", head.meta["theme-color"]],
    ["JSON-LD", types.join("\n")],
  ]

  const cells = rows.map(([name, value]) => {
    if (!value) return `<tr><th>${name}</th><td class="empty">none</td></tr>`
    return `<tr><th>${name}</th><td>${escape(value).replace(/\n/g, "<br>")}</td></tr>`
  })
  return `<table>${cells.join("")}</table>`
}

/**
 * Loads a preview image from the current server when the production URL does not load yet.
 * When the image does not load from the current server either, the card shows a message.
 */
function useLocalImages(root: HTMLElement): void {
  for (const image of root.querySelectorAll<HTMLImageElement>("img[data-preview]")) {
    image.addEventListener("error", () => {
      const url = new URL(image.src)
      if (url.origin !== location.origin) {
        image.src = `${location.origin}${url.pathname}${url.search}`
        return
      }
      const missing = document.createElement("div")
      missing.className = "missing"
      missing.textContent = "The image does not load"
      image.replaceWith(missing)
    })
  }
}

export default defineToolbarApp({
  init(canvas, app) {
    function render() {
      const head = parseHead(document.documentElement.outerHTML)
      const checks = checkHead(head)

      const error = checks.some((check) => {
        return check.level === "error"
      })
      const warning = checks.some((check) => {
        return check.level === "warning"
      })
      if (error || warning) {
        app.toggleNotification({ state: true, level: error ? "error" : "warning" })
      } else {
        app.toggleNotification({ state: false })
      }

      const element = document.createElement("astro-dev-toolbar-window")
      element.innerHTML = `
        ${STYLE}
        <section>
          <h2>Metadata</h2>
          ${renderChecks(checks)}
        </section>
        <section>
          <h3>Previews</h3>
          ${renderPreviews(head)}
        </section>
        <section>
          <h3>Head</h3>
          ${renderTable(head)}
        </section>`
      useLocalImages(element)
      canvas.replaceChildren(element)
    }

    render()
    app.onToggled(({ state }) => {
      if (state) render()
    })
    document.addEventListener("astro:after-swap", render)
  },
})
