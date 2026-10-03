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
      siteName: "Acme Studio",
      titleTemplate: "%s | Acme Studio",
      description: "Tools for small teams.",
      image: { url: "/og.jpg", alt: "Acme Studio", width: 1200, height: 630 },
      twitter: { site: "@acmestudio" },
      themeColor: "#111111",
      feeds: [{ href: "/rss.xml", title: "News" }],
      favicon: { source: "./src/assets/logo.svg" },
      manifest: { name: "Acme Studio" },
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
| `twitter` | — | `site`: the Twitter (X) handle of the site. `card`: `"summary"` or `"summary_large_image"` (default) for pages with an image. |
| `themeColor` | — | The color of the browser interface. Give one color, or `{ light, dark }`. |
| `feeds` | — | The RSS, Atom or JSON feeds: `href`, `title` and `type` (`"rss"` by default). |
| `robots` | — | `index: false` or `follow: false` for all pages, for example on a staging site. `extra`: other directives, for example `"max-image-preview:large"`. |
| `favicon` | — | Generates the favicons from one image. See [Favicons](#favicons). |
| `manifest` | — | Generates the web app manifest, or links your own. See [Web app manifest](#web-app-manifest). |
| `schema` | — | The structured data of the site: `publisher` is the organization or the person behind the site. `false` turns it off. See [Structured data](#structured-data). |
| `debug` | `true` | The Metadata app in the dev toolbar (`client`) and the checks in the build log (`build`). Set `false` to turn off both, or `{ client: false }` or `{ build: false }` to turn off one. See [Checks](#checks). |
| `rules` | — | `ignore`: the ids of the check rules to turn off. `custom`: your own rules. See [Checks](#checks). |
| `pages` | — | `ignore`: the pages without checks, as path patterns, for example `["/404", "/drafts/**"]`. See [Checks](#checks). |

### Translations

Each text can be one string, or an object with one string for each locale:

```typescript
metadata({
  siteName: { en: "Acme Studio", fi: "Acme Studio Suomi" },
  titleTemplate: { en: "%s | Acme Studio", fi: "%s | Acme Studio Suomi" },
})
```

`<Metadata>` uses the text of the locale of the page, or of its `locale` prop. A locale without a text uses the first text.

### Locales

`<Metadata>` reads the locales from your i18n setup. You do not need extra code:

- **[`@mannisto/astro-i18n`](https://github.com/eremannisto/astro-i18n):** the locale, the public URL of the page (`/about` and not `/en/about`) and the hreflang links.
- **The `i18n` option of Astro:** the locale and the hreflang links.

The hreflang links contain the page in each locale, and `x-default` for the default locale. To give your own links, use the `hreflang` prop. `hreflang={[]}` turns the links off, for example on a 404 page.

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

<Layout title="About" description="The story of Acme Studio.">
  <h1>About</h1>
</Layout>
```

The page values override the site values. For example, `title="About"` gives:

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>About | Acme Studio</title>
<meta name="description" content="The story of Acme Studio.">
<link rel="canonical" href="https://example.com/about/">
<meta property="og:title" content="About">
<meta property="og:description" content="The story of Acme Studio.">
<meta property="og:url" content="https://example.com/about/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Acme Studio">
<meta property="og:image" content="https://example.com/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@acmestudio">
...
```

| Prop | Default | Description |
|---|---|---|
| `title` | `siteName` | The page title. The title template adds the site name. |
| `description` | `description` | The page description. |
| `image` | `image` | The social image: `url`, `alt`, `width` and `height`. |
| `type` | `"website"` | The Open Graph type, for example `"article"`. |
| `author` | — | The author of an article: a name, or `{ name, url, twitter }`. `twitter` gives `twitter:creator`. |
| `published` | — | The publication date of an article. |
| `modified` | — | The date of the last change of an article. |
| `canonical` | The current page | The canonical path or URL. With `@mannisto/astro-i18n`, the default is the public URL of the page. |
| `index` | `true` | `false` keeps the page out of search results. |
| `follow` | `true` | `false` tells search engines not to follow the links. |
| `hreflang` | From the i18n setup | The hreflang links: the page in each locale, and `x-default`: `{ hreflang, href }[]`. See [Locales](#locales). |
| `breadcrumbs` | — | The path from the home page to the page: `{ name, url }[]`. See [Structured data](#structured-data). |
| `schema` | — | Structured data items of your own, for example a `Product`. See [Structured data](#structured-data). |
| `locale` | The locale of the page | The locale of the translated site values. See [Locales](#locales). |

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
    name: "Acme Studio",
    shortName: "Acme",
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

`<Metadata>` renders the structured data (JSON-LD) of each page by itself. You only give the values of the page.

**The site.** Each page gets the `WebSite` and its publisher: by default, an organization with the site name. Give the logo and the profiles in the config:

```typescript
metadata({
  siteName: "Acme Studio",
  schema: {
    publisher: {
      logo: "/logo.png",
      sameAs: ["https://github.com/acme-studio"],
    },
  },
})
```

For a personal site, use `publisher: { type: "Person" }`. Set `schema: false` to turn off the site data.

**An article.** Set `type="article"`. The article uses the title, the description and the image of the page:

```astro
<Metadata
  title="Hello"
  type="article"
  published={post.date}
  author={{ name: "Acme Writer", url: "/about", twitter: "@acmewriter" }}
/>
```

**Breadcrumbs.** Give the path from the home page to the page:

```astro
<Metadata
  breadcrumbs={[
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
  ]}
/>
```

**Your own items.** Give other types, for example a `Product` or an `Event`, in `schema`. The types come from [`schema-dts`](https://github.com/google/schema-dts), so your editor completes the schema.org fields:

```astro
<Metadata schema={{ "@type": "Event", name: "Opening night", startDate: "2026-11-01" }} />
```

All items go into one graph. The items link to each other with `@id`, and all URLs are absolute.

## Checks

The integration checks the metadata of each page. Each problem has a level:

| Level | Meaning | Examples |
| --- | --- | --- |
| Error | The metadata is broken. | No title, placeholder text such as `undefined`, two canonical links, invalid JSON-LD, an `og:image` that does not load |
| Warning | Fix it for better results. | A long title, the same title on two pages, no `twitter:card`, an `og:image` over 600 KB, an hreflang page that does not link back |
| Info | Good to know. | `noindex`, a short description, no `og:image:alt` |

The checks look at three things:

- **The head of each page:** the tags, the structured data and the hreflang links. A page with `noindex` gets no search and sharing checks.
- **The files of each page:** the `og:image` and the favicons. The checks load them, and compare the real image size, format and file size with the tags. Files on other sites are not checked.
- **All pages together:** the same title or description on two pages, and hreflang links that do not link back. Only the build can compare the pages.

The results show in two places:

- **In dev:** Open the Metadata app in the Astro dev toolbar. It shows the problems of the current page. Click a problem to open the row of its tag. The app also shows the link previews of Google, Twitter (X), Facebook, LinkedIn, WhatsApp, Discord and Slack, and all metadata tags.
- **In the build:** The integration logs the errors and the warnings of the prerendered pages:

```
[WARN] [@mannisto/astro-metadata] /about/index.html
  - The page has no description.
```

### Turn off rules

All rules and their ids are in [`src/lib/rules.js`](./src/lib/rules.js). Give the ids of the rules to turn off in `rules.ignore`. This applies to the dev toolbar app and to the build:

```typescript
metadata({
  rules: {
    ignore: ["description-short", "og-image-alt-missing"],
  },
})
```

### Custom rules

Add your own rules in `rules.custom`. A rule has an `id`, a `level` (`"error"`, `"warning"` or `"info"`), a `message`, and a `check` function that returns `true` when the page has the problem:

```typescript
metadata({
  rules: {
    custom: [
      {
        id: "title-brand",
        level: "warning",
        message: "The title must contain the brand name.",
        check(head) {
          return !head.titles[0]?.includes("Acme Studio")
        },
      },
    ],
  },
})
```

The `head` has the metadata of the page:

| Value | Description |
|---|---|
| `titles` | The texts of all title tags. |
| `meta` | The first `content` of each meta tag, by its `name` or `property`, for example `head.meta["og:image"]`. |
| `metaCount` | The number of meta tags with each name. |
| `links` | The attributes of all link tags, for example `{ rel: "canonical", href: "…" }`. |
| `schemas` | The texts of the JSON-LD scripts. |
| `lang`, `charset` | The `lang` attribute of the html tag, and the charset. |

The rule can also have:
- `message` as a function, `(head) => string`, for a message with values of the page.
- `field`, the tag of the problem, for example `"og:title"`. A click on the problem in the dev toolbar app opens its row.
- `indexed: true`, to skip the rule on a noindex page.

The custom rules run in the build and in the dev toolbar app. In dev, the dev server runs them, because they are functions in the Astro config. Text between backticks in a message shows as code in the dev toolbar app. The `MetadataRule` type gives your editor completion.

### Ignore pages

Some pages do not need checks, for example a 404 page or the drafts. Give their paths in `pages.ignore`, without the base. In a pattern, `*` matches one part of the path, and `**` matches any number of parts:

```typescript
metadata({
  pages: {
    ignore: ["/404", "/drafts/**"],
  },
})
```

The build does not check these pages, and does not compare them with the other pages. The dev toolbar app shows all values of these pages, but no problems.

Set `debug: { build: false }` to hide the build warnings, `debug: { client: false }` to remove the dev toolbar app, and `debug: false` to turn off both.

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
| `Schema.graph(page)` | `Graph` | The structured data that `<Metadata>` renders for a page |
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
- <LanguageAlternates alternates={links} />
- <Schema schema={data} />
+ <Metadata hreflang={links} schema={data} />
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
