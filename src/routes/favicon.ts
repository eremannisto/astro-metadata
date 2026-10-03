import type { APIRoute } from "astro"

import { Favicon } from "../lib/favicon.ts"

export const prerender = true

// The integration adds this route one time for each favicon file.
// The path without the base tells which file to generate.
export const GET: APIRoute = ({ url }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "")
  const path =
    base && url.pathname.startsWith(`${base}/`) ? url.pathname.slice(base.length) : url.pathname
  return Favicon.generate(path)
}
