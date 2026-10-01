import type { APIRoute, GetStaticPaths } from "astro"

import { Manifest } from "../lib/manifest.ts"

export const prerender = true

export const getStaticPaths: GetStaticPaths = () => {
  return Manifest.paths().map((path) => {
    return { params: { lang: path.lang }, props: { locale: path.locale } }
  })
}

export const GET: APIRoute = ({ props }) => {
  const manifest = Manifest.build(props.locale)
  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { "Content-Type": "application/manifest+json" },
  })
}
