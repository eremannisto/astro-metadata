import fs from "node:fs/promises"
import { createRequire } from "node:module"
import type Sharp from "sharp"

import { getConfig } from "./config.ts"
import type { FaviconInfo } from "./favicon.ts"

// The Apple icon shows the logo on the background color, with space around it.
// The logo fills 80 % of the icon.
const APPLE_CONTENT = 0.8

/**
 * Loads sharp from the path that the integration found. The build writes this code into
 * the dist folder of the project, and with pnpm the project can not see the dependencies
 * of this package from there.
 */
function loadSharp(favicon: FaviconInfo): typeof Sharp {
  return createRequire(import.meta.url)(favicon.sharp)
}

/**
 * Renders a square PNG of the source with transparent space around it.
 * An SVG source is rasterized at a density that gives a sharp result at the size.
 */
async function renderPng(favicon: FaviconInfo, size: number): Promise<Buffer> {
  const sharp = loadSharp(favicon)
  const source = await fs.readFile(favicon.source)
  const meta = await sharp(source).metadata()
  const smallest = Math.min(meta.width ?? size, meta.height ?? size)
  const density = favicon.svg ? Math.min(2400, Math.ceil((72 * size) / smallest)) : undefined

  return sharp(source, density ? { density } : {})
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()
}

/**
 * Renders a square icon with a background color and padding around the logo.
 */
async function renderPadded(favicon: FaviconInfo, size: number, content: number): Promise<Buffer> {
  const inner = Math.round(size * content)
  const logo = await renderPng(favicon, inner)
  const offset = Math.floor((size - inner) / 2)
  const sharp = loadSharp(favicon)

  return sharp({
    create: { width: size, height: size, channels: 4, background: favicon.background },
  })
    .composite([{ input: logo, left: offset, top: offset }])
    .png()
    .toBuffer()
}

/**
 * Puts PNG images into an ICO container: a 6-byte header, a 16-byte entry
 * for each image, and then the PNG data of each image.
 */
function toIco(images: { size: number; png: Buffer }[]): Buffer {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(images.length, 4)

  let offset = 6 + 16 * images.length
  const entries = images.map((image) => {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(image.size >= 256 ? 0 : image.size, 0)
    entry.writeUInt8(image.size >= 256 ? 0 : image.size, 1)
    entry.writeUInt8(0, 2)
    entry.writeUInt8(0, 3)
    entry.writeUInt16LE(1, 4)
    entry.writeUInt16LE(32, 6)
    entry.writeUInt32LE(image.png.length, 8)
    entry.writeUInt32LE(offset, 12)
    offset += image.png.length
    return entry
  })

  return Buffer.concat([
    header,
    ...entries,
    ...images.map((image) => {
      return image.png
    }),
  ])
}

/**
 * Renders a generated favicon file as a response.
 *
 * @param path - The path of the file, e.g. "/apple-touch-icon.png".
 * @returns The response with the file, or a 404 for a file that is not in the favicon config.
 */
export async function renderFavicon(path: string): Promise<Response> {
  const favicon = getConfig().favicon
  const file = favicon?.files.find((entry) => {
    return entry.path === path
  })
  if (!favicon || !file) return new Response(null, { status: 404 })

  if (file.type === "svg") {
    const svg = await fs.readFile(favicon.source)
    return new Response(svg, { headers: { "Content-Type": "image/svg+xml" } })
  }

  if (file.type === "ico") {
    const images = await Promise.all(
      file.sizes.map(async (size) => {
        return { size, png: await renderPng(favicon, size) }
      })
    )
    return new Response(new Uint8Array(toIco(images)), {
      headers: { "Content-Type": "image/x-icon" },
    })
  }

  const size = file.sizes[0]
  const png =
    file.use === "apple"
      ? await renderPadded(favicon, size, APPLE_CONTENT)
      : await renderPng(favicon, size)
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } })
}
