import type { APIRoute } from "astro"

import { RobotsTxt } from "../lib/robots-txt.ts"

export const prerender = true

export const GET: APIRoute = () => {
  return new Response(RobotsTxt.build(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
