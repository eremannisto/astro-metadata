# Astro Metadata

![banner](./assets/banner.png)

![Astro](https://img.shields.io/badge/astro-%232C2052.svg?style=for-the-badge&logo=astro&logoColor=white)
![npm version](https://img.shields.io/npm/v/@mannisto/astro-metadata?style=for-the-badge)
![license](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

The page metadata for Astro: the title, the description, the canonical URL, social cards, favicons, the web app manifest and structured data. Set the site values one time, and give each page only its own values.

- [Install](#install)
- [Configuration](#configuration)
- [Metadata component](#metadata-component)
- [Favicons](#favicons)
- [Web app manifest](#web-app-manifest)
- [Structured data](#structured-data)
- [Checks](#checks)
- [API](#api)
- [Good to know](#good-to-know)
- [Migrate from v1](#migrate-from-v1)
- [Contributing](#contributing)
- [License](#license)

## Install

```bash
npm install @mannisto/astro-metadata
```

The integration requires Astro 6.4.6 or later, or Astro 7.

## Configuration

```typescript
// astro.config.ts
import metadata from "@mannisto/astro-metadata"
import { defineConfig } from "astro/config"

export default defineConfig({
  site: "https://example.com",
  integrations: [
    metadata({
      siteName: "Tischenko Gallery",
      titleTemplate: "%s | Tischenko Gallery",
      description: "Contemporary art in Helsinki.",
      image: { url: "/og.jpg", alt: "Tischenko Gallery", width: 1200, height: 630 },
      twitter: { site: "@tischenko" },
      themeColor: "#111111",
      feeds: [{ href: "/rss.xml", title: "News" }],
      favicon: { source: "./src/assets/logo.svg" },
      manifest: { name: "Tischenko Gallery" },
    }),
  ],
})
```

Set `site` in the Astro config. The canonical URL and the social images must be absolute URLs, and the package uses `site` to make them.

| Option | Default | Description |
|---|---|---|
| `siteName` | — | The name of the site: the title of a page without a title, and `og:site_name`. |
| `titleTemplate` | — | The title template, for example `"%s \| My Site"`. `%s` is the page title. |
| `description` | — | The description of a page without a description. |
| `image` | — | The social image of a page without an image: `url`, `alt`, `width` and `height`. |
| `twitter` | — | `site`: the X handle of the site. `card`: `"summary"` or `"summary_large_image"` (default) for pages with an image. |
| `themeColor` | — | The color of the browser interface. Give one color, or `{ light, dark }`. |
| `feeds` | — | The RSS, Atom or JSON feeds: `href`, `title` and `type` (`"rss"` by default). |
| `robots` | — | `index: false` or `follow: false` for all pages, for example on a staging site. `extra`: other directives, for example `"max-image-preview:large"`. |
| `favicon` | — | Generates the favicons from one image. See [Favicons](#favicons). |
| `manifest` | — | Generates the web app manifest, or links your own. See [Web app manifest](#web-app-manifest). |
| `checks` | `true` | Logs the metadata problems of the built pages. See [Checks](#checks). |
| `debug` | `true` | Adds the Metadata app to the Astro dev toolbar. |

### Translations

Each text can be one string, or an object with one string for each locale:

```typescript
metadata({
  siteName: { en: "Tischenko Gallery", fi: "Tischenkon galleria" },
  titleTemplate: { en: "%s | Tischenko Gallery", fi: "%s | Tischenkon galleria" },
})
```

`<Metadata>` uses the text of `Astro.currentLocale`, or of its `locale` prop. A locale without a text uses the first text.

## Metadata component

Put `<Metadata>` into the `<head>` of your layout, and give it the values of the page:

```astro
---
// src/layouts/Layout.astro
import { Metadata, type MetadataProps } from "@mannisto/astro-metadata/components"

type Props = MetadataProps
---

<html lang="en">
  <head>
    <Metadata {...Astro.props} />
  </head>
  <body>
    <slot />
  </body>
</html>
```

```astro
---
// src/pages/about.astro
import Layout from "../layouts/Layout.astro"
---

<Layout title="About" description="The story of the gallery.">
  <h1>About</h1>
</Layout>
```

The page values override the site values. For example, `title="About"` gives:

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>About | Tischenko Gallery</title>
<meta name="description" content="The story of the gallery.">
<link rel="canonical" href="https://example.com/about/">
<meta property="og:title" content="About">
<meta property="og:description" content="The story of the gallery.">
<meta property="og:url" content="https://example.com/about/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Tischenko Gallery">
<meta property="og:image" content="https://example.com/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@tischenko">
...
```

| Prop | Default | Description |
|---|---|---|
| `title` | `siteName` | The page title. The title template adds the site name. |
| `description` | `description` | The page description. |
| `image` | `image` | The social image: `url`, `alt`, `width` and `height`. |
| `type` | `"website"` | The Open Graph type, for example `"article"`. |
| `author` | — | The X handle of the author, for example `"@annavirtanen"`. |
| `canonical` | The current page | The canonical path or URL. |
| `index` | `true` | `false` keeps the page out of search results. |
| `follow` | `true` | `false` tells search engines not to follow the links. |
| `languages` | — | The other language versions of the page: `{ hreflang, href }[]`. |
| `schema` | — | Structured data. See [Structured data](#structured-data). |
| `locale` | `Astro.currentLocale` | The locale of the translated site values. |

A tag is rendered only when it has a value. For example, the robots tag is necessary only with `index` or `follow` set to `false`.

## Favicons

Give one square source image. An SVG gives the best result. Use a PNG, WebP or JPEG of at least 512 × 512 px, or the large icons become blurred.

```typescript
metadata({
  favicon: {
    source: "./src/assets/logo.svg",
    background: "#ffffff",
  },
})
```

The integration generates these files, and `<Metadata>` renders their tags in the recommended order:

| File | Use |
|---|---|
| `/favicon.ico` | 16 and 32 px, for old browsers and tools |
| `/favicon.svg` | Modern browsers. Only for an SVG source. |
| `/favicon-16.png`, `/favicon-32.png` | Browser tabs |
| `/apple-touch-icon.png` | 180 px, for the iOS home screen |
| `/favicon-192.png`, `/favicon-512.png` | The web app manifest |

iOS shows transparent pixels as black, so the Apple icon shows the logo on the `background` color (white by default).

To generate other files, give a `files` list. It replaces the default files:

```typescript
favicon: {
  source: "./src/assets/logo.svg",
  files: [
    { path: "/favicon.ico", sizes: [16, 32, 48] },
    { path: "/favicon.svg" },
    { path: "/apple-touch-icon.png", size: 180 },
    { path: "/favicon-96.png", size: 96 },
    { path: "/favicon-512.png", size: 512 },
  ],
}
```

The extension sets the format: `.ico`, `.png` or `.svg`. The name and the size set the use:

- `.ico` and `.svg` files, and `.png` files smaller than 192 px, get an icon link tag.
- `apple-touch-icon.png` gets the Apple link tag.
- `.png` files of 192 px or larger go into the web app manifest.

Keep the names `favicon.ico` and `apple-touch-icon.png`. Browsers and iOS ask for these URLs directly.

## Web app manifest

Give the manifest as an object, and the integration serves it at `/manifest.webmanifest` with the generated icons:

```typescript
metadata({
  manifest: {
    name: "Tischenko Gallery",
    shortName: "Tischenko",
    backgroundColor: "#ffffff",
  },
})
```

| Value | Default | Description |
|---|---|---|
| `name` | — | The name of the app. |
| `shortName` | — | The name on the home screen. |
| `description` | — | The description of the app. |
| `startUrl` | `"/"` | The page that the installed app opens. |
| `display` | `"standalone"` | `"standalone"`, `"fullscreen"`, `"minimal-ui"` or `"browser"`. |
| `themeColor` | `themeColor` | The color of the app interface. |
| `backgroundColor` | — | The color of the start screen. |
| `extra` | — | Other manifest fields, copied into the file unchanged. |

With translated texts, each locale gets its own manifest: the first locale at `/manifest.webmanifest`, the others at `/fi/manifest.webmanifest` and so on.

To use your own manifest, give its path. The integration then only renders the link tag:

```typescript
metadata({
  manifest: "/site.webmanifest",
})
```

Your own manifest endpoint can use the generated icons with `Favicon.icons()`.

## Structured data

The `Schema` builders make the most common JSON-LD types. They fill in the site name and make all URLs absolute.

```astro
---
import { Metadata } from "@mannisto/astro-metadata/components"
import { Schema } from "@mannisto/astro-metadata/runtime"
---

<Metadata
  title="Hello"
  type="article"
  schema={[
    Schema.article({
      title: "Hello",
      published: new Date("2026-09-01"),
      author: { name: "Ere Männistö", url: "/about" },
      url: "/blog/hello",
    }),
    Schema.breadcrumbs([
      { name: "Home", url: "/" },
      { name: "Blog", url: "/blog" },
    ]),
  ]}
/>
```

The `schema` prop also takes your own objects. The types come from [`schema-dts`](https://github.com/google/schema-dts), so your editor completes the schema.org fields.

## Checks

The integration checks the metadata of each page, for example:
- a missing title or description
- a title longer than 60 characters
- an image without a width and a height
- invalid JSON-LD

The results show in two places:

- **In dev:** Open the Metadata app in the Astro dev toolbar. It shows the problems of the current page, the page as a Google result and as social cards, and all metadata tags.
- **In the build:** The integration logs the problems of the prerendered pages:

```
[WARN] [@mannisto/astro-metadata] /about/index.html
  - The page has no description.
```

Set `checks: false` to hide the build warnings, and `debug: false` to remove the dev toolbar app.

## API

```typescript
import { Favicon, Manifest, Schema, Site } from "@mannisto/astro-metadata/runtime"
```

| Method | Returns | Description |
|---|---|---|
| `Site.config` | `MetadataConfig` | The site values of the integration |
| `Site.name("fi")` | `string` | The site name of a locale |
| `Site.title("About", "fi")` | `string` | The page title in the title template |
| `Site.url("/og.jpg")` | `string` | The absolute URL of a path |
| `Site.pageUrl("/about")` | `string` | The absolute URL of a page, with the trailing slash of Astro |
| `Favicon.config` | `FaviconConfig` | The favicon config, or `undefined` without the `favicon` option |
| `Favicon.files` | `ResolvedFaviconFile[]` | The generated files |
| `Favicon.links()` | `FaviconLink[]` | The link tags of the generated files |
| `Favicon.icons()` | `ManifestIcon[]` | The icons for a web app manifest |
| `Favicon.url("/favicon.ico")` | `string` | The URL of a file, with the base and a hash |
| `Favicon.generate("/favicon-32.png")` | `Promise<Response>` | Generates a file of the config |
| `Manifest.config` | `ManifestConfig \| string` | The `manifest` option |
| `Manifest.url("fi")` | `string` | The URL of the manifest of a locale |
| `Manifest.build("fi")` | `object` | The manifest of a locale |
| `Manifest.paths()` | `ManifestPath[]` | The generated manifest files |
| `Schema.website()` | `WebSite` | The website, with the site name and URL |
| `Schema.organization()` | `Organization` | The organization: `name`, `url`, `logo`, `sameAs` |
| `Schema.article()` | `Article` | An article: `title`, `description`, `image`, `published`, `modified`, `author`, `url`, `type` |
| `Schema.breadcrumbs()` | `BreadcrumbList` | The path to the current page: `{ name, url }[]` |
| `Schema.stringify(data)` | `string` | JSON that is safe inside a script tag |

| Component | Props |
|---|---|
| `<Metadata>` | See [Metadata component](#metadata-component) |

Import the types from `@mannisto/astro-metadata/runtime`, for example `import type { MetadataImage } from "@mannisto/astro-metadata/runtime"`.

## Good to know

- **CMS data.** Give CMS values to `<Metadata>` as props. The site values of the integration are fixed at startup, and a change restarts the dev server.
- **Trailing slash.** The canonical URL and the `hreflang` links follow the `trailingSlash` setting of Astro. With `"ignore"`, `build.format` decides.
- **`sharp`.** The favicons use the `sharp` package that Astro installs. If you install Astro without its optional dependencies, install `sharp` yourself.
- **Files in `public/`.** A file in `public/` with the same path as a generated favicon replaces the generated file. The integration shows a warning.
- **With @mannisto/astro-i18n.** Give the locale and the hreflang links to `<Metadata>`:

  ```astro
  ---
  import { Locale } from "@mannisto/astro-i18n/runtime"
  import { Metadata } from "@mannisto/astro-metadata/components"

  const { code } = Locale.use(Astro)
  ---

  <Metadata locale={code} languages={Locale.hreflang(Astro.url, Astro.site!)} />
  ```

## Migrate from v1

Version 2 is a new API. The main changes:

### Move the site values into the integration

```diff
- <Head title="About" titleTemplate="%s | My Site" description="..." />
+ metadata({ titleTemplate: "%s | My Site", description: "..." })
```

### Use `<Metadata>` inside your own `<head>`

`<Head>` rendered the `<head>` element. `<Metadata>` renders only the tags.

```diff
- import { Head } from "@mannisto/astro-metadata"
+ import { Metadata } from "@mannisto/astro-metadata/components"

- <Head title="About" />
+ <head>
+   <Metadata title="About" />
+ </head>
```

### Replace the removed components

`Title`, `Description`, `Canonical`, `Robots`, `OpenGraph`, `Twitter`, `Favicon`, `LanguageAlternates`, `Keywords` and `Schema` are removed. `<Metadata>` renders their tags.

```diff
- <LanguageAlternates alternates={languages} />
- <Schema schema={data} />
+ <Metadata languages={languages} schema={data} />
```

### Replace the `Metadata` store

`Metadata.set()` and `Metadata.resolve()` are removed. Give the values as props to your layout.

### Replace the robots object and the `false` props

```diff
- <Head robots={{ index: false }} twitter={false} />
+ <Metadata index={false} />
```

### Generate the favicons

```diff
- <Head favicon={{ icons: [{ path: "/favicon.ico" }] }} />
+ metadata({ favicon: { source: "./src/assets/logo.svg" } })
```

## Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md) for the setup and the test commands. Report bugs and ideas in [GitHub issues](https://github.com/eremannisto/astro-metadata/issues).

## License

MIT © [Ere Männistö](https://github.com/eremannisto)
