import type { Config } from "prettier"

/**
 * NOTE: Prettier will be removed in the future and replaced with Biome,
 * when we have a way to format Astro files with Biome.
 */
const config: Config = {
  plugins: ["prettier-plugin-astro"],
  semi: false,
  singleQuote: false,
  tabWidth: 2,
  printWidth: 100,
  trailingComma: "es5",
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
}

export default config
