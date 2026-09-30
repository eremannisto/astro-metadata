# Favicons

The integration generates all favicon files from one source image. `Head` then renders the favicon tags automatically.

## Setup

```js
// astro.config.mjs
import metadata from "@mannisto/astro-metadata/integration"
import { defineConfig } from "astro/config"

export default defineConfig({
  integrations: [
    metadata({
      favicon: {
        source: "./src/assets/logo.svg",
        background: "#1e40af",
      },
    }),
  ],
})
```

## The source image

- **SVG:** Use an SVG when possible. The icons are sharp at all sizes, and modern browsers use the SVG directly. Give the SVG a `viewBox`.
- **PNG, WebP or JPEG:** The image must be square and at least 512 × 512 px.

The integration shows a warning for a source that is not square, a raster source that is smaller than 512 px, and an SVG without a `viewBox`.

## Generated files

| File                   | Size            | Use                                                        |
| ---------------------- | --------------- | ---------------------------------------------------------- |
| `/favicon.ico`         | 16 and 32 px    | Old browsers, and tools that request `/favicon.ico`       |
| `/icon.svg`            | —               | Modern browsers. Only for an SVG source.                   |
| `/apple-touch-icon.png`| 180 px          | iOS home screen. The icon has space and a background color. |
| `/icon-192.png`        | 192 px          | The web app manifest                                       |
| `/icon-512.png`        | 512 px          | The web app manifest                                       |
| `/icon-maskable.png`   | 512 px          | The web app manifest. Android can cut it to a circle.      |

The integration generates the files at build time as prerendered endpoints. They use the Astro `base`.

`Head` renders the tags for `favicon.ico`, `icon.svg` and `apple-touch-icon.png`. Each URL has a `?v=` value that changes when the source changes, so browsers load the new icons.

## Options

| Option       | Type     | Default     | Description                                                        |
| ------------ | -------- | ----------- | ------------------------------------------------------------------ |
| `source`     | `string` | —           | The path of the source image, relative to the project root. Required. |
| `background` | `string` | `"#ffffff"` | The background color of the Apple and maskable icons               |

## The web app manifest

With a `manifest` in `src/metadata.config.ts`, the manifest gets the generated icons automatically. See [Web app manifest](manifest.md).

For your own manifest endpoint, use `icons()`:

```ts
// src/pages/manifest.webmanifest.ts
import { icons } from "@mannisto/astro-metadata"
import type { APIRoute } from "astro"

export const GET: APIRoute = () => {
  return Response.json({
    name: "My Site",
    icons: icons(),
  })
}
```

Then give the path to `Head`: `<Head manifest="/manifest.webmanifest" />`.

## Your own icon files

Without the `favicon` option, give your own files to the `icons` prop. See the [Icons component](../components/icons.md).
