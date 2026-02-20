# Astro Metadata

![banner](./assets/banner.png)

![npm version](https://img.shields.io/npm/v/@mannisto/astro-metadata)
![license](https://img.shields.io/badge/license-MIT-green)
![astro peer dependency](https://img.shields.io/npm/dependency-version/@mannisto/astro-metadata/peer/astro)

Astro components for managing your page head — metadata, social sharing, favicons, and SEO.

## Table of contents

- [Installation](#installation)
- [Usage](#usage)
  - [Head component](#1-head-component)
  - [Individual components](#2-individual-components)
  - [Metadata utility](#3-metadata-utility)
- [Components](#components)
  - [Canonical](#canonical)
  - [Description](#description)
  - [Favicon](#favicon)
  - [Head](#head)
  - [Keywords](#keywords)
  - [LanguageAlternates](#languagealternates)
  - [OpenGraph](#opengraph)
  - [Robots](#robots)
  - [Schema](#schema)
  - [Title](#title)
  - [Twitter](#twitter)
- [Contributing](#contributing)
- [License](#license)

## Installation

```bash
# pnpm
pnpm add @mannisto/astro-metadata

# npm
npm install @mannisto/astro-metadata

# yarn
yarn add @mannisto/astro-metadata
```

## Usage

There are three ways to use this package. Pick what suits your project, or combine them freely.

### 1. Head component

The simplest approach. Use `Head` in your layout and pass props down from your pages. Charset and viewport are included automatically.

```astro
---
// layouts/Layout.astro
import { Head } from "@mannisto/astro-metadata"
import type { HeadProps } from "@mannisto/astro-metadata"

interface Props extends HeadProps {}

const { title, description, ...rest } = Astro.props
---

<html>
  <Head title={title} description={description} titleTemplate="%s | My Site" {...rest} />
  <body>
    <slot />
  </body>
</html>
```

```astro
---
// pages/index.astro
import Layout from "../layouts/Layout.astro"
---

<Layout title="Home" description="Welcome to my site">
  <h1>Hello</h1>
</Layout>
```

Best for simple sites where pages pass metadata as props to their layout.

### 2. Individual components

Use components directly inside your own `<head>`. Useful when you only need specific pieces, or want full control over the structure.

```astro
---
import { Title, Description, OpenGraph, Favicon } from "@mannisto/astro-metadata"
---

<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <Title value="My Page" template="%s | My Site" />
    <Description value="Welcome to my site" />
    <OpenGraph
      title="My Page"
      description="Welcome to my site"
      image={{
        url: "/og.jpg",
        alt: "My Site",
        width: 1200,
        height: 630,
      }}
    />
    <Favicon icons={[{ path: "/favicon.ico" }, { path: "/favicon.svg" }]} />
  </head>
  <body>
    <slot />
  </body>
</html>
```

Best for when you want to compose only what you need, or when `Head` is too opinionated for your setup.

### 3. Metadata utility

Set metadata in your page, resolve it in your layout. Eliminates prop drilling through nested layout layers.

```astro
---
// pages/about.astro
import { Metadata } from "@mannisto/astro-metadata"
import Layout from "../layouts/Layout.astro"

Metadata.set({
  title: "About",
  description: "Learn more about us",
  openGraph: {
    image: {
      url: "/og/about.jpg",
      alt: "About",
    },
  },
})
---

<Layout>
  <h1>About</h1>
</Layout>
```

```astro
---
// layouts/Layout.astro
import { Head, Metadata } from "@mannisto/astro-metadata"

const meta = Metadata.resolve({
  title: "My Site",
  description: "Default description",
  titleTemplate: "%s | My Site",
})
---

<html>
  <Head {...meta} />
  <body>
    <slot />
  </body>
</html>
```

`Metadata.resolve()` merges page values over your layout defaults — whatever the page sets wins, everything else falls back gracefully.

Best for sites with deeply nested layouts, or when you want to keep metadata co-located with page content.

## Components

<details>
<summary><strong>Canonical</strong></summary>

Renders a canonical link tag. Falls back to `Astro.url.href` when no value is provided, so every page gets a canonical tag with zero configuration.

```astro
<Canonical value="https://example.com/page" />
```

| Prop    | Type     | Description                                  |
| ------- | -------- | -------------------------------------------- |
| `value` | `string` | Canonical URL. Defaults to `Astro.url.href`. |

</details>

<details>
<summary><strong>Description</strong></summary>
```astro
<Description value="Welcome to my site" />
```

| Prop    | Type     | Description      |
| ------- | -------- | ---------------- |
| `value` | `string` | Page description |

</details>

<details>
<summary><strong>Favicon</strong></summary>

Favicon support with light and dark mode variants, automatic MIME type detection, and automatic sorting.

```astro
<Favicon
  icons={[
    { path: "/favicon.ico" },
    { path: "/favicon.svg" },
    { path: "/favicon-96x96.png", size: 96 },
    { path: "/apple-touch-icon.png", size: 180, apple: true },
    { path: "/favicon-dark.svg", theme: "dark" },
    { path: "/favicon-light.svg", theme: "light" },
  ]}
  manifest="/site.webmanifest"
/>
```

Icons are automatically sorted in the recommended browser order: `ico` → `png` → `svg` → `apple` → themed variants. Pass `sort={false}` to preserve the original order.

| Prop       | Type            | Default | Description                             |
| ---------- | --------------- | ------- | --------------------------------------- |
| `icons`    | `FaviconFile[]` | —       | List of favicon files                   |
| `manifest` | `string`        | —       | Path to web app manifest                |
| `sort`     | `boolean`       | `true`  | Sort icons in recommended browser order |

#### FaviconFile

| Prop    | Type                | Description                                                 |
| ------- | ------------------- | ----------------------------------------------------------- |
| `path`  | `string`            | Path to the file. MIME type is detected automatically.      |
| `size`  | `number`            | Size in pixels. Rendered as `NxN` in the `sizes` attribute. |
| `theme` | `"light" \| "dark"` | Adds a `prefers-color-scheme` media query                   |
| `apple` | `boolean`           | Renders as `<link rel="apple-touch-icon">`                  |

</details>

<details>
<summary><strong>Head</strong></summary>

Wraps the entire page head and composes all sub-components internally. Charset and viewport are always included and can be overridden if needed.

```astro
<Head
  title="Home"
  titleTemplate="%s | My Site"
  description="Welcome to my site"
  openGraph={{
    image: {
      url: "/og.jpg",
      alt: "My Site",
      width: 1200,
      height: 630,
    },
  }}
  favicon={{
    icons: [{ path: "/favicon.ico" }, { path: "/favicon.svg" }],
  }}
/>
```

| Prop                 | Type                         | Default                                   | Description                                               |
| -------------------- | ---------------------------- | ----------------------------------------- | --------------------------------------------------------- |
| `title`              | `string`                     | —                                         | Page title. Required.                                     |
| `titleTemplate`      | `` `${string}%s${string}` `` | —                                         | Title template. Must contain `%s`, e.g. `"%s \| My Site"` |
| `description`        | `string`                     | —                                         | Page description                                          |
| `canonical`          | `string`                     | `Astro.url.href`                          | Canonical URL                                             |
| `keywords`           | `string[]`                   | —                                         | List of keywords                                          |
| `charset`            | `string`                     | `"UTF-8"`                                 | Document charset                                          |
| `viewport`           | `string`                     | `"width=device-width, initial-scale=1.0"` | Viewport meta content                                     |
| `robots`             | `RobotsProps`                | —                                         | Robots directives                                         |
| `openGraph`          | `OpenGraphProps`             | —                                         | Open Graph tags                                           |
| `twitter`            | `TwitterProps`               | —                                         | Twitter card tags                                         |
| `favicon`            | `FaviconProps`               | —                                         | Favicon configuration                                     |
| `schema`             | `SchemaProps`                | —                                         | JSON-LD structured data                                   |
| `languageAlternates` | `LanguageAlternate[]`        | —                                         | Hreflang alternate links                                  |

#### Slots

```astro
<Head title="My Site">
  <!-- Renders before charset and viewport -->
  <meta slot="top" http-equiv="X-UA-Compatible" content="IE=edge" />

  <!-- Renders at the end of <head> -->
  <script src={analyticsUrl}></script>
</Head>
```

</details>

<details>
<summary><strong>Keywords</strong></summary>
```astro
<Keywords value={["astro", "seo", "metadata"]} />
```

| Prop    | Type       | Description      |
| ------- | ---------- | ---------------- |
| `value` | `string[]` | List of keywords |

</details>

<details>
<summary><strong>LanguageAlternates</strong></summary>

Renders `<link rel="alternate" hreflang>` tags for multilingual sites. Tells search engines which language version to serve for a given region.

```astro
<LanguageAlternates
  alternates={[
    { href: "https://example.com/en", hreflang: "en" },
    { href: "https://example.com/fi", hreflang: "fi" },
    { href: "https://example.com", hreflang: "x-default" },
  ]}
/>
```

| Prop                    | Type                  | Description                                                    |
| ----------------------- | --------------------- | -------------------------------------------------------------- |
| `alternates`            | `LanguageAlternate[]` | List of alternate language pages                               |
| `alternates[].href`     | `string`              | Full URL of the alternate page                                 |
| `alternates[].hreflang` | `string`              | Language or region code, e.g. `en`, `fi`, `en-US`, `x-default` |

</details>

<details>
<summary><strong>OpenGraph</strong></summary>

Renders Open Graph meta tags for rich previews when your pages are shared on social platforms. When used inside `Head`, `title`, `description` and `url` fall back to the page values automatically.

```astro
<OpenGraph
  title="My Page"
  description="Welcome to my site"
  url="https://example.com"
  type="website"
  siteName="My Site"
  locale="en_US"
  localeAlternate={["fi_FI", "fr_FR"]}
  image={{
    url: "/og.jpg",
    secureUrl: "https://example.com/og.jpg",
    type: "image/jpeg",
    alt: "My Site",
    width: 1200,
    height: 630,
  }}
  video={{
    url: "https://example.com/video.mp4",
    secureUrl: "https://example.com/video.mp4",
    type: "video/mp4",
    width: 1280,
    height: 720,
  }}
  audio={{
    url: "https://example.com/audio.mp3",
    secureUrl: "https://example.com/audio.mp3",
    type: "audio/mpeg",
  }}
/>
```

| Prop              | Type             | Default     | Description                                  |
| ----------------- | ---------------- | ----------- | -------------------------------------------- |
| `title`           | `string`         | —           | OG title                                     |
| `description`     | `string`         | —           | OG description                               |
| `url`             | `string`         | —           | Canonical URL for the OG object              |
| `type`            | `string`         | `"website"` | OG type                                      |
| `siteName`        | `string`         | —           | Name of the site                             |
| `locale`          | `string`         | —           | Locale, e.g. `en_US`                         |
| `localeAlternate` | `string[]`       | —           | Alternate locales, e.g. `["fi_FI", "fr_FR"]` |
| `image`           | `OpenGraphImage` | —           | Image metadata                               |
| `video`           | `OpenGraphVideo` | —           | Video metadata                               |
| `audio`           | `OpenGraphAudio` | —           | Audio metadata                               |

#### OpenGraphImage

| Prop        | Type     | Description                                |
| ----------- | -------- | ------------------------------------------ |
| `url`       | `string` | Image URL. Required if image is set.       |
| `secureUrl` | `string` | HTTPS image URL                            |
| `type`      | `string` | MIME type, e.g. `"image/jpeg"`             |
| `alt`       | `string` | Image alt text                             |
| `width`     | `number` | Image width in pixels. Recommended: `1200` |
| `height`    | `number` | Image height in pixels. Recommended: `630` |

#### OpenGraphVideo

| Prop        | Type     | Description                          |
| ----------- | -------- | ------------------------------------ |
| `url`       | `string` | Video URL. Required if video is set. |
| `secureUrl` | `string` | HTTPS video URL                      |
| `type`      | `string` | MIME type, e.g. `"video/mp4"`        |
| `width`     | `number` | Video width in pixels                |
| `height`    | `number` | Video height in pixels               |

#### OpenGraphAudio

| Prop        | Type     | Description                          |
| ----------- | -------- | ------------------------------------ |
| `url`       | `string` | Audio URL. Required if audio is set. |
| `secureUrl` | `string` | HTTPS audio URL                      |
| `type`      | `string` | MIME type, e.g. `"audio/mpeg"`       |

</details>

<details>
<summary><strong>Robots</strong></summary>

Controls how search engines crawl and index your page. Defaults to `index, follow`.

```astro
<Robots archive={false} extra="max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
```

| Prop      | Type      | Default | Description                                                             |
| --------- | --------- | ------- | ----------------------------------------------------------------------- |
| `index`   | `boolean` | `true`  | Allow indexing                                                          |
| `follow`  | `boolean` | `true`  | Allow following links                                                   |
| `archive` | `boolean` | `true`  | Allow search engines to cache the page                                  |
| `snippet` | `boolean` | `true`  | Allow text snippets in search results                                   |
| `extra`   | `string`  | —       | Additional directives, e.g. `"max-snippet:-1, max-image-preview:large"` |

</details>

<details>
<summary><strong>Schema</strong></summary>

Outputs a `<script type="application/ld+json">` tag for structured data. Use it to help search engines understand your content and qualify for rich results.

```astro
<Schema
  schema={{
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Ere Männistö",
    url: "https://example.com",
  }}
/>
```

| Prop     | Type                      | Description    |
| -------- | ------------------------- | -------------- |
| `schema` | `Record<string, unknown>` | JSON-LD object |

</details>

<details>
<summary><strong>Title</strong></summary>

Renders the `<title>` tag. The template must contain `%s`, which is replaced with the page title — TypeScript enforces this at the type level.

```astro
<Title value="My Page" template="%s | My Site" />
```

| Prop       | Type                         | Description                         |
| ---------- | ---------------------------- | ----------------------------------- |
| `value`    | `string`                     | Page title. Required.               |
| `template` | `` `${string}%s${string}` `` | Template string. Must contain `%s`. |

</details>

<details>
<summary><strong>Twitter</strong></summary>

Renders Twitter card meta tags for rich previews on X. When used inside `Head`, `title` and `description` fall back to the page values automatically.

```astro
<Twitter
  card="summary_large_image"
  site="@mysite"
  creator="@myhandle"
  url="https://example.com"
  image={{
    url: "/og.jpg",
    alt: "My Site",
  }}
/>
```

| Prop          | Type                                                      | Default                 | Description                                |
| ------------- | --------------------------------------------------------- | ----------------------- | ------------------------------------------ |
| `title`       | `string`                                                  | —                       | Card title                                 |
| `description` | `string`                                                  | —                       | Card description                           |
| `url`         | `string`                                                  | —                       | Canonical URL for the card                 |
| `card`        | `"summary" \| "summary_large_image" \| "player" \| "app"` | `"summary_large_image"` | Card type                                  |
| `site`        | `string`                                                  | —                       | Twitter handle of the site, e.g. `@mysite` |
| `creator`     | `string`                                                  | —                       | Twitter handle of the content author       |
| `image.url`   | `string`                                                  | —                       | Image URL. Required if image is set.       |
| `image.alt`   | `string`                                                  | —                       | Image alt text                             |

</details>

## Contributing

### Setup

Clone the repository and run the init script:

```bash
git clone https://github.com/eremannisto/astro-metadata
cd astro-metadata
pnpm run init
```

This installs all dependencies, links the local package to the fixture project, and installs Playwright browsers.

### Running tests

Run unit tests only:

```bash
pnpm test:unit
```

Run end-to-end component tests:

```bash
pnpm test:e2e
```

Run all tests:

```bash
pnpm test:all
```

### Linting and formatting

This project uses [Biome](https://biomejs.dev) for linting and formatting.

Check for issues:

```bash
pnpm check
```

Auto-fix issues:

```bash
pnpm check:fix
```

All pull requests must pass the Biome check and unit tests before merging. These are enforced automatically via GitHub Actions.

### Project structure

```
astro-metadata/
  src/
    components/       # Astro components
    lib/              # Metadata utility
  tests/
    e2e/
      components/     # Playwright component tests
      fixtures/       # Astro test project
    unit/
      metadata.test.ts
  scripts/
    init.sh
  index.ts
  playwright.config.ts
  vitest.config.ts
  biome.json
```

## License

MIT © [Ere Männistö](https://github.com/eremannisto)
