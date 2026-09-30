# Head

Renders the full `<head>` with all other components. The charset and the viewport are always included, and the canonical URL is included by default. The title, the description and the image also go into the Open Graph and Twitter tags.

`Head` uses the values in `src/metadata.config.ts` when a prop is missing. See [Config file and integration](../usage/config.md).

## Import

```astro
---
import { Head, type HeadProps } from "@mannisto/astro-metadata"
---
```

## Usage

### Basic

```astro
<Head
  title="Home"
  description="Welcome to my site"
  image={{
    url: "/og.jpg",
    alt: "My Open Graph banner",
    width: 1200,
    height: 630,
  }}
/>
```

### With a title template

`Head` replaces `%s` with the page title. In this example, the title is "Welcome | My Site":

```astro
<Head title="Welcome" titleTemplate="%s | My Site" />
```

### Disable parts

Set a prop to `false` to remove that part:

```astro
<Head title="My Page" twitter={false} robots={false} canonical={false} />
```

### Override the Open Graph and Twitter values

Open Graph and Twitter use `title`, `description` and `image`. Override specific values when necessary:

```astro
<Head
  title="My Page"
  description="Default description"
  image={{ url: "/og.jpg", alt: "My Site" }}
  openGraph={{ title: "A shorter title for sharing" }}
  twitter={{ card: "summary" }}
/>
```

### Theme color and color scheme

```astro
<Head
  title="My Page"
  themeColor={{ light: "#ffffff", dark: "#111111" }}
  colorScheme="light dark"
/>
```

Two colors give two `theme-color` tags with `prefers-color-scheme` media queries.

### Languages and feeds

```astro
<Head
  title="My Page"
  languages={[
    { href: "/en/page", hreflang: "en" },
    { href: "/fi/page", hreflang: "fi" },
    { href: "/en/page", hreflang: "x-default" },
  ]}
  feeds={[{ href: "/rss.xml", title: "Blog" }]}
/>
```

### Structured data

```astro
---
import { Head, schema } from "@mannisto/astro-metadata"
---

<Head title="Home" schema={[schema.website(), schema.organization({ logo: "/logo.png" })]} />
```

### Slots

```astro
<Head title="My Site">
  <!-- Renders after the charset, before the viewport -->
  <meta slot="top" http-equiv="X-UA-Compatible" content="IE=edge" />

  <!-- Renders at the end of <head> -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
</Head>
```

## Props

| Prop            | Type                                    | Default                                   | Description                                         |
| --------------- | --------------------------------------- | ----------------------------------------- | --------------------------------------------------- |
| `title`         | `string`                                | `siteName` in the config                  | The page title                                      |
| `titleTemplate` | `string`                                | `titleTemplate` in the config             | The title template, e.g. `"%s \| My Site"`          |
| `description`   | `string \| false`                       | `description` in the config               | The page description                                |
| `canonical`     | `string \| false`                       | The URL of the current page               | The canonical URL                                   |
| `charset`       | `string`                                | `"UTF-8"`                                 | The document charset                                |
| `viewport`      | `string`                                | `"width=device-width, initial-scale=1.0"` | The viewport meta content                           |
| `image`         | `OpenGraphImage \| false`               | `image` in the config                     | The image for Open Graph and Twitter                |
| `robots`        | `RobotsProps \| false`                  | `robots` in the config                    | The robots directives                               |
| `openGraph`     | `OpenGraphProps \| false`               | —                                         | Open Graph overrides                                |
| `twitter`       | `TwitterProps \| false`                 | `twitter` in the config                   | Twitter card overrides                              |
| `icons`         | `IconsProps \| false`                   | The generated favicons                    | The favicon files                                   |
| `manifest`      | `string \| false`                       | The manifest from the config              | The path of the web app manifest                    |
| `schema`        | `SchemaData \| SchemaData[] \| false`   | —                                         | JSON-LD structured data                             |
| `languages`     | `LanguageAlternate[] \| false`          | —                                         | The `hreflang` links                                |
| `feeds`         | `Feed[] \| false`                       | `feeds` in the config                     | The RSS, Atom or JSON feed links                    |
| `themeColor`    | `string \| { light, dark } \| false`    | `themeColor` in the config                | The color of the browser interface                  |
| `colorScheme`   | `string \| false`                       | `colorScheme` in the config               | The color modes of the page, e.g. `"light dark"`    |
| `locale`        | `string`                                | `Astro.currentLocale`                     | The locale of the localized config values           |

## Slots

| Slot      | Description                              |
| --------- | ---------------------------------------- |
| `top`     | Renders after the charset, before the viewport |
| (default) | Renders at the end of `<head>`           |
