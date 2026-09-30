import crypto from "node:crypto"
import fs from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"
import { fileURLToPath, URL } from "node:url"

const NAME = "@mannisto/astro-metadata"
const CONFIG_ID = "virtual:@mannisto/astro-metadata/config"
const RESOLVED_CONFIG_ID = `\0${CONFIG_ID}`
const CONFIG_FILES = ["src/metadata.config.ts", "src/metadata.config.js", "src/metadata.config.mjs"]
const FAVICON_FILES = [
  "favicon.ico",
  "icon.svg",
  "apple-touch-icon.png",
  "icon-192.png",
  "icon-512.png",
  "icon-maskable.png",
]

/**
 * Finds the config file: the `config` option, or the first default file that exists.
 *
 * @param {URL} root - The root of the Astro project.
 * @param {string | undefined} path - The `config` option.
 * @returns {string | undefined} The absolute path of the config file.
 */
function findConfigFile(root, path) {
  if (path) {
    const file = fileURLToPath(new URL(path, root))
    if (!fs.existsSync(file)) throw new Error(`${NAME} Config file not found: ${path}`)
    return file
  }
  for (const candidate of CONFIG_FILES) {
    const file = fileURLToPath(new URL(candidate, root))
    if (fs.existsSync(file)) return file
  }
  return undefined
}

/**
 * Checks the favicon source and returns the data for the generated files.
 * Warns about a source that gives blurred or cut icons.
 *
 * @param {URL} root - The root of the Astro project.
 * @param {import("./integration").FaviconOptions} options - The `favicon` option.
 * @param {import("astro").AstroIntegrationLogger} logger - The integration logger.
 * @returns {Promise<import("./lib/favicon").FaviconInfo>} The favicon data.
 */
async function resolveFavicon(root, options, logger) {
  const source = fileURLToPath(new URL(options.source, root))
  if (!fs.existsSync(source)) throw new Error(`${NAME} Favicon source not found: ${options.source}`)

  const content = fs.readFileSync(source)
  const svg = path.extname(source).toLowerCase() === ".svg"
  const hash = crypto.createHash("sha256").update(content).digest("hex").slice(0, 8)

  const { default: sharp } = await import("sharp")
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

  // The endpoints load sharp from this path: see `loadSharp` in lib/favicon-image.ts
  const sharpPath = createRequire(import.meta.url).resolve("sharp")
  return { source, background: options.background ?? "#ffffff", svg, hash, sharp: sharpPath }
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
 * The Astro integration of `@mannisto/astro-metadata`. It loads the site-wide defaults
 * from `src/metadata.config.ts` and gives them to the components.
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
        injectScript,
        injectRoute,
        addDevToolbarApp,
        logger,
      }) => {
        const configFile = findConfigFile(config.root, options.config)
        const favicon = options.favicon
          ? await resolveFavicon(config.root, options.favicon, logger)
          : undefined

        updateConfig({
          vite: {
            // The favicon data is a build-time constant, so pages and endpoints can read it
            define: favicon ? { __ASTRO_METADATA_FAVICON__: JSON.stringify(favicon) } : {},
            plugins: [
              {
                name: "astro-metadata-config",
                resolveId(id) {
                  if (id === CONFIG_ID) return RESOLVED_CONFIG_ID
                },
                load(id) {
                  if (id !== RESOLVED_CONFIG_ID) return
                  const key = 'Symbol.for("@mannisto/astro-metadata/config")'
                  if (!configFile) return `globalThis[${key}] = {}`
                  return [
                    `import config from ${JSON.stringify(configFile)}`,
                    `globalThis[${key}] = config ?? {}`,
                  ].join("\n")
                },
              },
            ],
          },
        })

        // Runs on the server before each page, so the components can read the config
        injectScript("page-ssr", `import ${JSON.stringify(CONFIG_ID)}`)

        // The route reads the manifest from the config file. Without a manifest, it has no paths.
        if (configFile) {
          injectRoute({
            pattern: "/[...lang]/manifest.webmanifest",
            entrypoint: new URL("./routes/manifest.ts", import.meta.url),
            prerender: true,
          })
        }

        if (command === "dev") {
          addDevToolbarApp({
            id: "mannisto-astro-metadata",
            name: "Metadata",
            icon: "file-search",
            entrypoint: new URL("./toolbar/app.ts", import.meta.url),
          })
        }

        if (favicon) {
          for (const file of FAVICON_FILES) {
            if (file === "icon.svg" && !favicon.svg) continue
            injectRoute({
              pattern: `/${file}`,
              entrypoint: new URL(`./routes/${file}.ts`, import.meta.url),
              prerender: true,
            })
          }
        }
      },
      "astro:build:done": async ({ dir, logger }) => {
        if (options.checks === false) return
        await checkPages(fileURLToPath(dir), logger)
      },
    },
  }
}
