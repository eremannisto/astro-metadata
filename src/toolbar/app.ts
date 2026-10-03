import { defineToolbarApp } from "astro/toolbar"

import { styleBadge } from "./toolbar-badge.ts"

import "./views/metadata-panel.ts"

import { checkPage, collect, summarize } from "./data.ts"
import type { MetadataPanel } from "./views/metadata-panel.ts"

export default defineToolbarApp({
  init(canvas, app) {
    styleBadge()

    const panel = document.createElement("astro-metadata-panel") as MetadataPanel
    canvas.append(panel)
    let open = false

    // The badge shows the worst problem of the page
    async function updateBadge() {
      const { checks } = await checkPage()
      const { level } = summarize(checks)
      if (level) {
        app.toggleNotification({ state: true, level })
      } else {
        app.toggleNotification({ state: false })
      }
    }

    async function load() {
      panel.data = undefined
      panel.data = await collect()
    }

    function setOpen(state: boolean) {
      app.toggleState({ state })
    }

    app.onToggled(({ state }) => {
      open = state
      if (state) load()
    })

    panel.addEventListener("close", () => {
      setOpen(false)
    })

    // Alt+M (Option+M on a Mac) opens and closes the panel. Escape closes it.
    // `code` is the key, not the character: Option+M types "µ" on a Mac.
    document.addEventListener("keydown", (event) => {
      const target = event.target as HTMLElement | null
      if (target?.closest("input, textarea, select, [contenteditable]")) return

      if (event.altKey && event.code === "KeyM") {
        event.preventDefault()
        setOpen(!open)
      } else if (event.key === "Escape" && open) {
        setOpen(false)
      }
    })

    // View transitions change the page without a full load
    document.addEventListener("astro:after-swap", () => {
      updateBadge()
      if (open) load()
    })

    updateBadge()

    // ?metadata in the URL opens the panel when the page loads
    if (new URLSearchParams(location.search).has("metadata")) setOpen(true)
  },
})
