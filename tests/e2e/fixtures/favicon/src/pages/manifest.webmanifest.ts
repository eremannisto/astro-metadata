import { icons } from "@mannisto/astro-metadata"
import type { APIRoute } from "astro"

export const GET: APIRoute = () => {
  return Response.json({
    name: "Favicon Site",
    icons: icons(),
  })
}
