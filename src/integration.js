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
  "schema",
]

// The Lit modules of the dev toolbar app
const LIT_MODULES = [
  "lit",
  "lit/directives/style-map.js",
  "lit/directives/unsafe-html.js",
  "lit/directives/unsafe-svg.js",
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
 * Loads sharp for the image sizes of the build checks, or undefined without sharp.
 *
 * @param {URL | undefined} root - The root of the Astro project.
 * @returns {import("./integration").BuildContext["sharp"]}
 */
function loadSharp(root) {
  if (!root) return undefined
  try {
    return createRequire(import.meta.url)(findSharp(root))
  } catch {
    return undefined
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

// The MIME types of the image files, by their extension
const MIME_TYPES = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
}

/**
 * Returns the debug features: the dev toolbar app (`client`) and the build checks (`build`).
 *
 * @param {import("./integration").MetadataOptions["debug"]} debug
 * @returns {{ client: boolean, build: boolean }}
 */
function debugOptions(debug) {
  if (typeof debug === "boolean") return { client: debug, build: debug }
  return { client: debug?.client ?? true, build: debug?.build ?? true }
}

/**
 * Returns the path of a file of the site in the output directory, or undefined for
 * a file on another site.
 *
 * @param {string} url - The URL or path of the file.
 * @param {import("./integration").BuildContext} context
 * @returns {string | undefined}
 */
function outputFile(url, context) {
  const site = context.site ? new URL(context.site) : undefined
  let parsed
  try {
    parsed = new URL(url, site ?? "http://localhost/")
  } catch {
    return undefined
  }
  if (site ? parsed.origin !== site.origin : /^https?:\/\//i.test(url)) return undefined

  // The output directory has no folder for the base
  const base = context.base.replace(/\/$/, "")
  let pathname = decodeURIComponent(parsed.pathname)
  if (base && pathname.startsWith(`${base}/`)) pathname = pathname.slice(base.length)
  return path.join(context.dir, pathname)
}

/**
 * Reads a file of the page from the output directory: whether it exists, its type,
 * its size in bytes, and the size of an image.
 *
 * @param {string} url
 * @param {import("./integration").BuildContext} context
 * @returns {Promise<import("./lib/checks").Asset | undefined>} Undefined for a file on another site.
 */
async function readAsset(url, context) {
  const file = outputFile(url, context)
  if (!file) return undefined
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return { url, ok: false }

  /** @type {import("./lib/checks").Asset} */
  const asset = {
    url,
    ok: true,
    type: MIME_TYPES[path.extname(file).toLowerCase()],
    bytes: fs.statSync(file).size,
  }
  if (context.sharp && asset.type !== "image/x-icon") {
    try {
      const { width, height } = await context.sharp(file).metadata()
      asset.width = width
      asset.height = height
    } catch {
      // sharp can not read the file: the checks skip the image size
    }
  }
  return asset
}

/**
 * Reads the `og:image` and the favicons of a page from the output directory.
 *
 * @param {import("./lib/checks").HeadData} head
 * @param {import("./integration").BuildContext} context
 * @param {Map<string, Promise<import("./lib/checks").Asset | undefined>>} cache - The files that other pages already read.
 * @returns {Promise<import("./lib/checks").PageAssets>}
 */
async function readAssets(head, context, cache) {
  const read = (url) => {
    if (!cache.has(url)) cache.set(url, readAsset(url, context))
    return cache.get(url)
  }

  const image = head.meta["og:image"] ? await read(head.meta["og:image"]) : undefined
  const links = head.links.filter((link) => {
    return /(^|\s)(icon|apple-touch-icon)(\s|$)/i.test(link.rel ?? "") && link.href
  })
  const icons = await Promise.all(
    links.map((link) => {
      // The query, e.g. "?v=3f2a1c9e", is not part of the file name
      return read(link.href.split("?")[0])
    })
  )
  return {
    image,
    icons: icons.filter((icon) => {
      return icon !== undefined
    }),
  }
}

/**
 * Returns the URL path of a built HTML file: "/blog/index.html" becomes "/blog/",
 * and "/about.html" becomes "/about".
 *
 * @param {string} file - The path of the file in the output directory.
 * @returns {string}
 */
function pagePath(file) {
  if (file.endsWith("/index.html")) return file.slice(0, -"index.html".length)
  return file.replace(/\.html$/, "")
}

/**
 * Checks the metadata of the built pages and logs the errors and the warnings:
 * the head of each page, its files, and the pages of the site together.
 *
 * @param {import("./integration").BuildContext} context
 * @param {import("astro").AstroIntegrationLogger} logger - The integration logger.
 */
async function checkPages(context, logger) {
  const { checkAssets, checkHead, checkSite, isIgnored, parseHead, sortChecks } =
    await import("./lib/checks.js")
  const options = context.checks

  const pages = []
  for (const file of findHtmlFiles(context.dir)) {
    const html = fs.readFileSync(file, "utf-8")
    // Astro writes redirects as HTML pages without metadata
    if (/<meta[^>]+http-equiv=["']?refresh/i.test(html)) continue

    const page = `/${path.relative(context.dir, file).split(path.sep).join("/")}`
    if (isIgnored(pagePath(page), context.pages)) continue

    pages.push({ path: page, head: parseHead(html) })
  }

  const siteChecks = checkSite(pages, options)
  const cache = new Map()
  let count = 0

  for (const page of pages) {
    const assets = await readAssets(page.head, context, cache)
    const checks = sortChecks([
      ...checkHead(page.head, options),
      ...checkAssets(page.head, assets, options),
      ...(siteChecks.get(page.path) ?? []),
    ])
    const problems = checks.filter((check) => {
      return check.level !== "info"
    })
    if (problems.length === 0) continue

    count++
    const lines = problems.map((check) => {
      return `  - ${check.message}`
    })
    logger.warn(`${page.path}\n${lines.join("\n")}`)
  }

  if (count > 0) {
    const label = count === 1 ? "1 page has" : `${count} pages have`
    logger.warn(
      `${label} metadata problems. Turn off a rule with \`rules.ignore\`, or all build checks with \`debug: { build: false }\`.`
    )
  }
}

// The path of the check endpoint of the dev server
const CHECK_PATH = "/__astro-metadata/check"

/**
 * Reads the body of a request as text.
 *
 * @param {import("node:http").IncomingMessage} request
 * @returns {Promise<string>}
 */
function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = ""
    request.setEncoding("utf-8")
    request.on("data", (chunk) => {
      body += chunk
    })
    request.on("end", () => {
      resolve(body)
    })
    request.on("error", reject)
  })
}

/**
 * Checks a page for the dev toolbar app: its head, and the files that the app loaded.
 *
 * @param {{ html: string, path: string, assets: import("./lib/checks").PageAssets }} page
 * @param {import("./integration").BuildContext} context
 * @returns {Promise<{ ignored: boolean, checks: import("./lib/checks").Check[] }>}
 */
async function checkDevPage(page, context) {
  const { checkAssets, checkHead, isIgnored, parseHead, sortChecks } =
    await import("./lib/checks.js")
  if (isIgnored(page.path, context.pages)) return { ignored: true, checks: [] }

  const head = parseHead(page.html)
  const checks = sortChecks([
    ...checkHead(head, context.checks),
    ...checkAssets(head, page.assets, context.checks),
  ])
  return { ignored: false, checks }
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
  const debug = debugOptions(options.debug)

  /** @type {import("./integration").BuildContext} */
  const context = {
    dir: "",
    base: "/",
    pages: options.pages?.ignore,
    checks: { ignore: options.rules?.ignore, custom: options.rules?.custom },
  }

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
        const { validateCustomRules } = await import("./lib/checks.js")
        try {
          validateCustomRules(options.rules?.custom)
        } catch (error) {
          throw new Error(`${NAME} ${error instanceof Error ? error.message : error}`, {
            cause: error,
          })
        }

        // The dev toolbar app runs only in dev, and the `debug` option can turn it off
        const toolbar = command === "dev" && debug.client
        context.root = config.root
        context.site = config.site
        context.base = config.base

        const favicon = options.favicon
          ? await resolveFavicon(config.root, config.publicDir, options.favicon, logger)
          : undefined

        /** @type {import("./lib/config").RuntimeConfig} */
        const runtime = {
          favicon,
          site: config.site,
          base: config.base,
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
            // The dev toolbar app uses Lit. Without this list, Vite finds Lit only when the
            // app loads, and the page reloads one time.
            optimizeDeps: toolbar
              ? {
                  include: LIT_MODULES.map((module) => {
                    return `${NAME} > ${module}`
                  }),
                }
              : undefined,
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

        if (toolbar) {
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
      // The dev toolbar app sends the page to this endpoint, and the server runs the
      // checks. The custom rules are functions in the Astro config, so only the server has them.
      "astro:server:setup": ({ server }) => {
        if (!debug.client) return

        server.middlewares.use(async (request, response, next) => {
          const url = request.url?.split("?")[0] ?? ""
          if (request.method !== "POST" || !url.endsWith(CHECK_PATH)) return next()

          try {
            const body = JSON.parse(await readBody(request))
            const result = await checkDevPage(body, context)
            response.setHeader("Content-Type", "application/json")
            response.end(JSON.stringify(result))
          } catch (error) {
            response.statusCode = 500
            response.end(JSON.stringify({ error: String(error) }))
          }
        })
      },
      "astro:build:done": async ({ dir, logger }) => {
        if (!debug.build) return

        context.dir = fileURLToPath(dir)
        context.sharp = loadSharp(context.root)
        await checkPages(context, logger)
      },
    },
  }
}
