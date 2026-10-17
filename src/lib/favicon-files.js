// Plain JavaScript: the integration runs in Node, which does not strip types in node_modules.

// A PNG file of this size or larger goes into the web app manifest. Smaller PNG files get an
// icon link tag. 192 px is the smallest icon that browsers use to install a web app.
const MANIFEST_SIZE = 192

/**
 * The default files. An SVG source also gives `favicon.svg`.
 *
 * @param {boolean} svg - True for an SVG source.
 * @returns {import("./favicon-files").FaviconFile[]}
 */
export function defaultFaviconFiles(svg) {
  return [
    { path: "/favicon.ico", sizes: [16, 32] },
    ...(svg ? [{ path: "/favicon.svg" }] : []),
    { path: "/favicon-16.png", size: 16 },
    { path: "/favicon-32.png", size: 32 },
    { path: "/apple-touch-icon.png", size: 180 },
    { path: "/favicon-192.png", size: 192 },
    { path: "/favicon-512.png", size: 512 },
  ]
}

/**
 * Returns true for a whole number from 1 to a maximum.
 *
 * @param {unknown} value
 * @param {number} max
 * @returns {boolean}
 */
function isSize(value, max) {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= max
}

/**
 * Checks the favicon files and finds the use of each file from its name, format and size:
 * - `.ico` and `.svg` files get an icon link tag.
 * - `apple-touch-icon.png` gets the Apple link tag and the background color.
 * - Other `.png` files smaller than 192 px get an icon link tag.
 * - Other `.png` files of 192 px or larger go into the web app manifest.
 *
 * @param {import("./favicon-files").FaviconFile[]} files - The `files` option, or the defaults.
 * @param {boolean} svg - True for an SVG source.
 * @returns {import("./favicon-files").ResolvedFaviconFile[]}
 * @throws {Error} For a file that the package can not generate.
 */
export function resolveFaviconFiles(files, svg) {
  const paths = new Set()

  return files.map((file) => {
    const { path } = file
    if (typeof path !== "string" || !path.startsWith("/")) {
      throw new Error(`The favicon path "${path}" must start with "/".`)
    }
    if (paths.has(path)) {
      throw new Error(`The favicon path "${path}" is in the list two times.`)
    }
    paths.add(path)

    const type = path.split(".").pop()?.toLowerCase()
    const name = path.split("/").pop() ?? ""

    if (type === "svg") {
      if (!svg) throw new Error(`"${path}" needs an SVG source.`)
      if (file.size !== undefined || file.sizes !== undefined) {
        throw new Error(`"${path}" is an SVG file, so it has no size.`)
      }
      return { path, type, use: "icon", sizes: [] }
    }

    if (type === "ico") {
      if (file.size !== undefined && file.sizes !== undefined) {
        throw new Error(`"${path}" has "size" and "sizes". Use one.`)
      }
      const sizes = file.sizes ?? (file.size !== undefined ? [file.size] : [16, 32])
      const valid = sizes.every((size) => {
        return isSize(size, 256)
      })
      if (sizes.length === 0 || !valid) {
        throw new Error(`The sizes of "${path}" must be whole numbers from 1 to 256.`)
      }
      const sorted = [...sizes].sort((a, b) => {
        return a - b
      })
      return { path, type, use: "icon", sizes: sorted }
    }

    if (type === "png") {
      if (file.sizes !== undefined) {
        throw new Error(`"${path}" is a PNG file: use "size", not "sizes".`)
      }
      if (!isSize(file.size, 4096)) {
        throw new Error(`"${path}" needs a "size" from 1 to 4096.`)
      }
      let use = file.size >= MANIFEST_SIZE ? "manifest" : "icon"
      if (name.startsWith("apple-touch-icon")) use = "apple"
      return { path, type, use, sizes: [file.size] }
    }

    throw new Error(`"${path}" must be an .ico, .png or .svg file.`)
  })
}
