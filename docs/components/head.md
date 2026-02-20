# Head

Wraps the entire page head and composes all sub-components internally. Charset and viewport are always included and can be overridden if needed.

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
/>
<!--
  Output:
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Home</title>
    <meta name="description" content="Welcome to my site">
    <link rel="canonical" href="...">
  </head>
-->
```

### With title template

```astro
<Head
  title="Home"
  titleTemplate="%s | My Site"
  description="Welcome to my site"
/>
<!-- Output: <title>Home | My Site</title> -->
```

### With Open Graph and Twitter

```astro
<Head
  title="Home"
  description="Welcome to my site"
  openGraph={{
    image: {
      url: "/og.jpg",
      alt: "My Site",
      width: 1200,
      height: 630,
    },
  }}
  twitter={{
    card: "summary_large_image",
    site: "@mysite",
  }}
/>
```

### With favicon

```astro
<Head
  title="Home"
  favicon={{
    icons: [
      { path: "/favicon.ico" },
      { path: "/favicon.svg" },
    ],
  }}
/>
```

### Full configuration

```astro
<Head
  title="Home"
  titleTemplate="%s | My Site"
  description="Welcome to my site"
  canonical="https://example.com"
  keywords={["astro", "seo"]}
  robots={{
    index: true,
    follow: true,
  }}
  openGraph={{
    image: {
      url: "/og.jpg",
      alt: "My Site",
    },
  }}
  twitter={{
    card: "summary_large_image",
    site: "@mysite",
  }}
  favicon={{
    icons: [{ path: "/favicon.ico" }],
  }}
  schema={{
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "My Site",
  }}
  languageAlternates={[
    { href: "https://example.com/en", hreflang: "en" },
    { href: "https://example.com/fi", hreflang: "fi" },
  ]}
/>
```

### Using slots

Add custom elements to the head:

```astro
<Head title="My Site">
  <!-- Renders before charset and viewport -->
  <meta slot="top" http-equiv="X-UA-Compatible" content="IE=edge" />

  <!-- Renders at the end of <head> -->
  <script src="/analytics.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
</Head>
```

### With Metadata API

```astro
---
import { Head, Metadata } from "@mannisto/astro-metadata"

const meta = Metadata.resolve({
  title: "My Site",
  titleTemplate: "%s | My Site",
  description: "Default description",
})
---

<Head {...meta} />
```

### In a layout

```astro
---
import { Head, type HeadProps } from "@mannisto/astro-metadata"

interface Props extends HeadProps {}

const { title, description, ...rest } = Astro.props
---

<html>
  <Head
    title={title}
    titleTemplate="%s | My Site"
    description={description}
    {...rest}
  />
  <body>
    <slot />
  </body>
</html>
```

## Props

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

## Slots

| Slot      | Description                         |
| --------- | ----------------------------------- |
| `top`     | Renders before charset and viewport |
| (default) | Renders at the end of `<head>`      |
