import sharp from "sharp"

/**
 * Returns the size of a PNG image and the color of its top-left pixel.
 */
export async function readPng(body: Buffer) {
  const image = sharp(body)
  const { width, height, format } = await image.metadata()
  const { data } = await image.extract({ left: 0, top: 0, width: 1, height: 1 }).raw().toBuffer({
    resolveWithObject: true,
  })
  const [r, g, b, alpha] = data
  return { width, height, format, corner: { r, g, b, alpha } }
}

/**
 * Returns the number of images in an ICO file, or -1 for a file without an ICO header.
 */
export function readIco(body: Buffer): number {
  const isIco = body.readUInt16LE(0) === 0 && body.readUInt16LE(2) === 1
  return isIco ? body.readUInt16LE(4) : -1
}
