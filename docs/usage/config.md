# Config file and integration

The integration loads `src/metadata.config.ts`. The file contains the site-wide defaults, for example the site name and the title template. `Head` uses these values when a page does not give a prop.

## Setup

Add the integration to `astro.config.mjs`:

```js
import metadata from "@mannisto/astro-metadata/integration"
import { defineConfig } from "astro/config"

export default defineConfig({
  site: "https://example.com",
  integrations: [metadata()],
})
```

Add `src/metadata.config.ts`. The integration also finds `src/metadata.config.js` and `src/metadata.config.mjs`:

```ts
import { defineMetadata } from "@mannisto/astro-metadata"

export default defineMetadata({
  siteName: "My Site",
  titleTemplate: "%s | My Site",
  description: "The default description",
  image: { url: "/og.jpg", alt: "My Site", width: 1200, height: 630 },
  robots: { archive: false },
  twitter: { site: "@mysite", creator: "@me" },
  themeColor: { light: "#ffffff", dark: "#111111" },
  colorScheme: "light dark",
  feeds: [{ href: "/rss.xml", title: "Blog" }],
})
```

`defineMetadata()` returns the config unchanged. It only gives the types to your editor.

## Translations

Each text can be one string, or an object with one string for each locale:

```ts
export default defineMetadata({
  siteName: {
    en: "Tischenko Gallery",
    fi: "Tischenkon galleria",
  },
  titleTemplate: {
    en: "%s | Tischenko Gallery",
    fi: "%s | Tischenkon galleria",
  },
})
```

`Head` uses the value of `Astro.currentLocale`. Set the `locale` prop to use a different locale. When the config has no value for the locale, `Head` uses the first value.

## Order of values

1. The props of `Head`.
2. The values in `src/metadata.config.ts`.
3. The default values of the components.

A prop with the value `false` removes the part. The config value then has no effect on that page.

## Config values

| Value           | Type                              | Description                                                             |
| --------------- | --------------------------------- | ----------------------------------------------------------------------- |
| `siteName`      | `Localized`                       | The name of the site. The title of a page without a title, and `og:site_name`. |
| `titleTemplate` | `Localized`                       | The title template, e.g. `"%s \| My Site"`                              |
| `description`   | `Localized`                       | The default description                                                 |
| `image`         | `OpenGraphImage`                  | The default image for Open Graph and Twitter                            |
| `robots`        | `RobotsProps`                     | The default robots directives                                           |
| `twitter`       | `{ card?, site?, creator? }`      | The default Twitter values                                              |
| `themeColor`    | `string \| { light, dark }`       | The color of the browser interface. Two colors follow the color mode.    |
| `colorScheme`   | `string`                          | The color modes of the site, e.g. `"light dark"`                        |
| `feeds`         | `ConfigFeed[]`                    | The RSS, Atom or JSON feeds. The `title` can be `Localized`.            |
| `manifest`      | `ManifestConfig`                  | The web app manifest. See [Web app manifest](manifest.md).              |

`Localized` is `string | Record<string, string>`.

## Integration options

| Option    | Type             | Default                   | Description                                                  |
| --------- | ---------------- | ------------------------- | ------------------------------------------------------------ |
| `config`  | `string`         | `src/metadata.config.ts`  | The path of the config file, relative to the project root    |
| `favicon` | `FaviconOptions` | —                         | Generates the favicons. See [Favicons](favicons.md).         |
| `checks`  | `boolean`        | `true`                    | Logs the metadata problems of the built pages. See [Checks](checks.md). |

## Without the integration

The components also work without the integration. Then `Head` uses only its props and the default values.
