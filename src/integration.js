import fs from "node:fs"
import { fileURLToPath, URL } from "node:url"

const NAME = "@mannisto/astro-metadata"
const CONFIG_ID = "virtual:@mannisto/astro-metadata/config"
const RESOLVED_CONFIG_ID = `\0${CONFIG_ID}`
const CONFIG_FILES = ["src/metadata.config.ts", "src/metadata.config.js", "src/metadata.config.mjs"]

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
      "astro:config:setup": ({ config, updateConfig, injectScript }) => {
        const configFile = findConfigFile(config.root, options.config)

        updateConfig({
          vite: {
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
      },
    },
  }
}
