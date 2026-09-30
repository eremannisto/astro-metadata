import "virtual:@mannisto/astro-metadata/config"

import type { APIRoute, GetStaticPaths } from "astro"

import { getConfig } from "../lib/config.ts"
import { buildManifest, manifestPaths } from "../lib/manifest.ts"

export const prerender = true

export const getStaticPaths: GetStaticPaths = () => {
  return manifestPaths(getConfig()).map((path) => {
    return { params: { lang: path.lang }, props: { locale: path.locale } }
  })
}

export const GET: APIRoute = ({ props }) => {
  const manifest = buildManifest(getConfig(), props.locale)
  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { "Content-Type": "application/manifest+json" },
  })
}
