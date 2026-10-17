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

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && open) setOpen(false)
    })

    // View transitions change the page without a full load
    document.addEventListener("astro:after-swap", () => {
      updateBadge()
      if (open) load()
    })

    updateBadge()
  },
})
