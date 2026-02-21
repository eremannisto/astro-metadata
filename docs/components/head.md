# Head

Wraps the entire page head and composes all sub-components internally. Charset and viewport are always included. Title, description and image flow into Open Graph and Twitter automatically.

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
    alt: "My OpenGraph banner", 
    width: 1200, 
    height: 630 
  }}
/>
```

### With title template

The `%s` placeholder is replaced with the page title. Use it to append or prepend a site name across all pages. In the following example, the output would be "Welcome | My Site"

```astro
<Head
  title="Welcome"
  titleTemplate="%s | My Site"
/>
```

### Disabling components

Any prop can be set to `false` to disable it entirely:
```astro
<Head
  title="My Page"
  twitter={false}
  robots={false}
  canonical={false}
/>
```

### Overriding OG and Twitter

By default OG and Twitter inherit `title`, `description` and `image`. Override specific values when needed:
```astro
<Head
  title="My Page"
  description="Default description"
  image={{ url: "/og.jpg", alt: "My Site" }}
  openGraph={{ title: "A punchier title for sharing" }}
  twitter={{ card: "summary" }}
/>
```

### Using slots
```astro
<Head title="My Site">
  <!-- Renders before charset and viewport -->
  <meta slot="top" http-equiv="X-UA-Compatible" content="IE=edge" />

  <!-- Renders at the end of <head> -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
</Head>
```

### In a layout
```astro
---
import { Head, type HeadProps } from "@mannisto/astro-metadata"

interface Props extends HeadProps {}

const { title, ...rest } = Astro.props
---

<html>
  <Head title={title} titleTemplate="%s | My Site" {...rest} />
  <body>
    <slot />
  </body>
</html>
```

## Props

| Prop                 | Type                           | Default                                   | Description                           |
| -------------------- | ------------------------------ | ----------------------------------------- | ------------------------------------- |
| `title`              | `string`                       | —                                         | Page title. Required.                 |
| `titleTemplate`      | `` `${string}%s${string}` ``   | —                                         | Title template, e.g. `"%s \| My Site"` |
| `description`        | `string \| false`              | —                                         | Page description                      |
| `canonical`          | `string \| false`              | `Astro.url.href`                          | Canonical URL                         |
| `keywords`           | `string[] \| false`            | —                                         | List of keywords                      |
| `charset`            | `string`                       | `"UTF-8"`                                 | Document charset                      |
| `viewport`           | `string`                       | `"width=device-width, initial-scale=1.0"` | Viewport meta content                 |
| `image`              | `OpenGraphImage \| false`      | —                                         | Image passed to OG and Twitter        |
| `robots`             | `RobotsProps \| false`         | —                                         | Robots directives                     |
| `openGraph`          | `OpenGraphProps \| false`      | —                                         | Open Graph overrides                  |
| `twitter`            | `TwitterProps \| false`        | —                                         | Twitter card overrides                |
| `favicon`            | `FaviconProps \| false`        | —                                         | Favicon configuration                 |
| `schema`             | `SchemaProps \| false`         | —                                         | JSON-LD structured data               |
| `languageAlternates` | `LanguageAlternate[] \| false` | —                                         | Hreflang alternate links              |

## Slots

| Slot      | Description                         |
| --------- | ----------------------------------- |
| `top`     | Renders before charset and viewport |
| (default) | Renders at the end of `<head>`      |