// Downloads the AI crawler names of the ai.robots.txt project, and writes them into
// src/lib/ai-bots.json. Run it with `pnpm bots:update`.

import fs from "node:fs"

const SOURCE = "https://raw.githubusercontent.com/ai-robots-txt/ai.robots.txt/main/robots.json"
const OUTPUT = new URL("../src/lib/ai-bots.json", import.meta.url)

const response = await fetch(SOURCE)
if (!response.ok) throw new Error(`${SOURCE} answered ${response.status}`)
const bots = await response.json()

const seen = new Set()
const names = Object.keys(bots)
  .filter((name) => {
    const isUsageSignal = name.startsWith("__")
    return !isUsageSignal
  })
  .sort((a, b) => {
    return a.localeCompare(b, "en")
  })
  .filter((name) => {
    const caseless = name.toLowerCase()
    if (seen.has(caseless)) return false
    seen.add(caseless)
    return true
  })

fs.writeFileSync(OUTPUT, `${JSON.stringify(names, null, 2)}\n`)
console.log(`Wrote ${names.length} AI crawler names to src/lib/ai-bots.json.`)
