import type { APIRoute } from "astro"

import { renderFavicon } from "../lib/favicon-image.ts"

export const prerender = true

export const GET: APIRoute = () => {
  return renderFavicon("icon-512.png")
}
