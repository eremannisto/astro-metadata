import AI_BOTS from "./ai-bots.json"
import { getConfig } from "./config.ts"

/**
 * The AI crawlers of the search group: they show the site in AI answers, or load a page
 * when a user asks for it. The names come from the documentation of each company.
 */
const SEARCH_BOTS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
]

/**
 * The training crawlers of the large companies. They are also in `ai-bots.json`, but the
 * file must block them even if a new version of the list does not have them.
 */
const TRAINING_BOTS = ["GPTBot", "ClaudeBot", "Google-Extended", "Applebot-Extended"]

/**
 * The crawlers that the file never blocks: Apple search, and the Facebook link previews.
 */
const KEPT_BOTS = ["Applebot", "facebookexternalhit"]

/**
 * Returns the names that are not in a list, without case: robots.txt compares the names
 * without case.
 */
function without(names: string[], list: string[]): string[] {
  const caseless = new Set(
    list.map((name) => {
      return name.toLowerCase()
    })
  )
  return names.filter((name) => {
    return !caseless.has(name.toLowerCase())
  })
}

/**
 * Returns a group of the file: the crawlers, and the rule for them.
 */
function group(names: string[], rule: string): string {
  const agents = names.map((name) => {
    return `User-agent: ${name}`
  })
  return [...agents, rule].join("\n")
}

/**
 * The `robots.txt` file of the `robots.ai` option.
 */
export const RobotsTxt = {
  /**
   * Returns the AI crawlers that the file blocks.
   * Without `search: false` or `training: false`, the file blocks no crawlers.
   */
  blocked(): string[] {
    const ai = getConfig().robots?.ai ?? {}
    const otherBots = without(AI_BOTS, TRAINING_BOTS)
    const training = without([...TRAINING_BOTS, ...otherBots], [...SEARCH_BOTS, ...KEPT_BOTS])
    return [...(ai.search === false ? SEARCH_BOTS : []), ...(ai.training === false ? training : [])]
  },

  /**
   * Returns the text of the file: the blocked AI crawlers, the rule for all other
   * crawlers, and the sitemap with `@astrojs/sitemap`.
   */
  build(): string {
    const { site, base = "/", sitemap } = getConfig()
    const blocked = RobotsTxt.blocked()

    const groups = [
      ...(blocked.length > 0 ? [group(blocked, "Disallow: /")] : []),
      group(["*"], "Allow: /"),
    ]
    if (sitemap && site) {
      const url = new URL(`${base.replace(/\/$/, "")}/sitemap-index.xml`, site)
      groups.push(`Sitemap: ${url.href}`)
    }
    return `${groups.join("\n\n")}\n`
  },
}
