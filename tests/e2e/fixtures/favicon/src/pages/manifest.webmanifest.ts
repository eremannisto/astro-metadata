import { Favicon } from "@mannisto/astro-metadata/runtime"
import type { APIRoute } from "astro"

export const GET: APIRoute = () => {
  return Response.json({
    name: "Favicon Site",
    icons: Favicon.icons(),
  })
}
