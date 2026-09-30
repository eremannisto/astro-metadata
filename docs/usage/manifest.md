# Web app manifest

The web app manifest tells the browser how to install the site as an app: the name, the icons and the colors. Put the manifest in `src/metadata.config.ts`. The integration then serves it at `/manifest.webmanifest`, and `Head` renders the link tag.

## Setup

```ts
// src/metadata.config.ts
import { defineMetadata } from "@mannisto/astro-metadata"

export default defineMetadata({
  themeColor: "#1e40af",
  manifest: {
    name: "My Site",
    shortName: "Site",
    backgroundColor: "#ffffff",
  },
})
```

The result:

```json
{
  "name": "My Site",
  "short_name": "Site",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "theme_color": "#1e40af",
  "background_color": "#ffffff",
  "icons": [
    { "src": "/icon-192.png?v=1a2b3c4d", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png?v=1a2b3c4d", "sizes": "512x512", "type": "image/png" },
    { "src": "/icon-maskable.png?v=1a2b3c4d", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

The manifest gets the icons only with the `favicon` option. See [Favicons](favicons.md).

## Translations

The `name`, `shortName`, `description` and `startUrl` values can have one value for each locale. Then each locale gets its own manifest:

```ts
export default defineMetadata({
  manifest: {
    name: {
      en: "Tischenko Gallery",
      fi: "Tischenkon galleria",
    },
    startUrl: {
      en: "/",
      fi: "/fi/",
    },
  },
})
```

- The first locale uses `/manifest.webmanifest`.
- The other locales use `/<locale>/manifest.webmanifest`, for example `/fi/manifest.webmanifest`.

Each manifest has a `lang` value. `Head` links the manifest of the page locale.

## Other fields

Put other manifest fields into `extra`. The integration copies them into the file unchanged:

```ts
manifest: {
  name: "My Site",
  extra: {
    categories: ["art"],
    shortcuts: [{ name: "Exhibitions", url: "/exhibitions" }],
  },
}
```

## Values

| Value             | Type                                                   | Default                     | Description                                 |
| ----------------- | ------------------------------------------------------ | --------------------------- | ------------------------------------------- |
| `name`            | `Localized`                                            | —                           | The name of the app. Required.              |
| `shortName`       | `Localized`                                            | —                           | The name on the home screen                 |
| `description`     | `Localized`                                            | —                           | The description of the app                  |
| `display`         | `"standalone" \| "fullscreen" \| "minimal-ui" \| "browser"` | `"standalone"`         | How the installed app opens                 |
| `startUrl`        | `Localized`                                            | `"/"`                       | The page that the installed app opens       |
| `themeColor`      | `string`                                               | `themeColor` in the config  | The color of the app interface. For a light and a dark color, the manifest uses the light color. |
| `backgroundColor` | `string`                                               | —                           | The color of the start screen               |
| `extra`           | `Record<string, unknown>`                              | —                           | Other manifest fields                       |

## Your own manifest

Do not put `manifest` in the config file. Make your own endpoint, and give its path to `Head`:

```astro
<Head manifest="/site.webmanifest" />
```

`icons()` gives the generated icons to your endpoint. See [Favicons](favicons.md#the-web-app-manifest).
