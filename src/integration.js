import crypto from "node:crypto"
import fs from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"
import { fileURLToPath, URL } from "node:url"

import { defaultFaviconFiles, resolveFaviconFiles } from "./lib/favicon-files.js"

const NAME = "@mannisto/astro-metadata"

// The site values of the options. The components read them at build time.
const SITE_KEYS = [
  "siteName",
  "titleTemplate",
  "description",
  "image",
  "twitter",
  "themeColor",
  "feeds",
  "robots",
  "manifest",
]

/**
 * Finds sharp: first the copy that Astro installs as an optional dependency,
 * then a copy in the project.
 *
 * @param {URL} root - The root of the Astro project.
 * @returns {string} The absolute path of the sharp package.
 * @throws {Error} When sharp is not installed.
 */
function findSharp(root) {
  const fromProject = createRequire(fileURLToPath(new URL("./package.json", root)))
  try {
    const astro = fromProject.resolve("astro/package.json")
    return createRequire(astro).resolve("sharp")
  } catch {
    // Astro was installed without its optional dependencies
  }
  try {
    return fromProject.resolve("sharp")
  } catch {
    throw new Error(
      `${NAME} The favicon option needs sharp. Install it in your project: npm install sharp`
    )
  }
}

/**
 * Checks the favicon source and returns the data for the generated files.
 * Warns about a source that gives blurred or cut icons.
 *
 * @param {URL} root - The root of the Astro project.
 * @param {URL} publicDir - The public directory of the Astro project.
 * @param {import("./integration").FaviconOptions} options - The `favicon` option.
 * @param {import("astro").AstroIntegrationLogger} logger - The integration logger.
 * @returns {Promise<import("./lib/favicon").FaviconInfo>} The favicon data.
 */
async function resolveFavicon(root, publicDir, options, logger) {
  const source = fileURLToPath(new URL(options.source, root))
  if (!fs.existsSync(source)) throw new Error(`${NAME} Favicon source not found: ${options.source}`)

  const content = fs.readFileSync(source)
  const svg = path.extname(source).toLowerCase() === ".svg"
  const hash = crypto.createHash("sha256").update(content).digest("hex").slice(0, 8)

  // The endpoints load sharp from the same path: see `loadSharp` in lib/favicon-image.ts
  const sharpPath = findSharp(root)
  const sharp = createRequire(import.meta.url)(sharpPath)
  const { width = 0, height = 0 } = await sharp(content).metadata()
  if (width !== height) {
    logger.warn(`The favicon source is not square (${width}x${height}). The icons get empty space.`)
  }
  if (!svg && Math.min(width, height) < 512) {
    logger.warn(`The favicon source is smaller than 512 px. The large icons become blurred.`)
  }
  if (svg && !/viewBox=/i.test(content.toString("utf-8"))) {
    logger.warn("The favicon SVG has no viewBox. It can not scale correctly.")
  }

  let files
  try {
    files = resolveFaviconFiles(options.files ?? defaultFaviconFiles(svg), svg)
  } catch (error) {
    throw new Error(`${NAME} ${error instanceof Error ? error.message : error}`, { cause: error })
  }

  // A file in public/ with the same path replaces the generated file in the build
  for (const file of files) {
    if (fs.existsSync(fileURLToPath(new URL(`.${file.path}`, publicDir)))) {
      logger.warn(
        `public${file.path} replaces the generated ${file.path}. Remove it from public/ to use the generated file.`
      )
    }
  }

  return {
    source,
    background: options.background ?? "#ffffff",
    svg,
    hash,
    sharp: sharpPath,
    files,
  }
}

/**
 * Returns the paths of all HTML files in a directory and its subdirectories.
 *
 * @param {string} dir
 * @returns {string[]}
 */
function findHtmlFiles(dir) {
  return fs
    .readdirSync(dir, { recursive: true, encoding: "utf-8" })
    .filter((file) => {
      return file.endsWith(".html")
    })
    .map((file) => {
      return path.join(dir, file)
    })
    .sort()
}

/**
 * Checks the metadata of the built pages and logs the problems.
 *
 * @param {string} dir - The output directory of the build.
 * @param {import("astro").AstroIntegrationLogger} logger - The integration logger.
 */
async function checkPages(dir, logger) {
  const { checkHead, parseHead } = await import("./lib/checks.js")
  let count = 0

  for (const file of findHtmlFiles(dir)) {
    const html = fs.readFileSync(file, "utf-8")
    // Astro writes redirects as HTML pages without metadata
    if (/<meta[^>]+http-equiv=["']?refresh/i.test(html)) continue

    const problems = checkHead(parseHead(html)).filter((check) => {
      return check.level !== "info"
    })
    if (problems.length === 0) continue

    count++
    const page = `/${path.relative(dir, file).split(path.sep).join("/")}`
    const lines = problems.map((check) => {
      return `  - ${check.message}`
    })
    logger.warn(`${page}\n${lines.join("\n")}`)
  }

  if (count > 0) {
    const pages = count === 1 ? "1 page has" : `${count} pages have`
    logger.warn(`${pages} metadata problems. Set \`checks: false\` to hide these warnings.`)
  }
}

/**
 * The Astro integration of `@mannisto/astro-metadata`. It gives the site values to the
 * `<Metadata>` component, generates the favicons and the web app manifest, and checks
 * the metadata of the built pages.
 *
 * @param {import("./integration").MetadataOptions} [options]
 * @returns {import("astro").AstroIntegration}
 */
export default function metadata(options = {}) {
  return {
    name: NAME,
    hooks: {
      "astro:config:setup": async ({
        config,
        command,
        updateConfig,
        injectRoute,
        addDevToolbarApp,
        logger,
      }) => {
        const favicon = options.favicon
          ? await resolveFavicon(config.root, config.publicDir, options.favicon, logger)
          : undefined

        /** @type {import("./lib/config").RuntimeConfig} */
        const runtime = {
          favicon,
          trailingSlash: config.trailingSlash,
          buildFormat: config.build.format,
        }
        for (const key of SITE_KEYS) {
          if (options[key] !== undefined) runtime[key] = options[key]
        }

        // The config is plain data, so it goes to the components as a build-time constant
        updateConfig({
          vite: {
            define: { __ASTRO_METADATA__: JSON.stringify(runtime) },
          },
        })

        // A manifest object: one manifest file for each locale of its texts
        if (typeof options.manifest === "object") {
          injectRoute({
            pattern: "/[...lang]/manifest.webmanifest",
            entrypoint: new URL("./routes/manifest.ts", import.meta.url),
            prerender: true,
          })
        }

        // One route for each favicon file, all with the same endpoint
        if (favicon) {
          for (const file of favicon.files) {
            injectRoute({
              pattern: file.path,
              entrypoint: new URL("./routes/favicon.ts", import.meta.url),
              prerender: true,
            })
          }
        }

        if (command === "dev" && options.debug !== false) {
          addDevToolbarApp({
            id: "mannisto-astro-metadata",
            name: "Metadata",
            icon: fs.readFileSync(
              new URL("./assets/icons/binoculars.svg", import.meta.url),
              "utf-8"
            ),
            entrypoint: new URL("./toolbar/app.ts", import.meta.url),
          })
        }
      },
      "astro:build:done": async ({ dir, logger }) => {
        if (options.checks === false) return
        await checkPages(fileURLToPath(dir), logger)
      },
    },
  }
}
