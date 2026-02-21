# Head component

The simplest approach — use `Head` in your layout and pass props down from pages. Charset and viewport are included automatically. Title, description and image flow into Open Graph and Twitter by default.

## Basic setup
```astro
---
// layouts/Layout.astro
import { Head, type HeadProps } from "@mannisto/astro-metadata"

interface Props extends HeadProps {}

const { title, ...rest } = Astro.props
---

<html lang="en">
  <Head
    title={title}
    titleTemplate="%s | My Site"
    favicon={{
      icons: [
        { path: "/favicon.ico" },
        { path: "/favicon.svg" },
        { path: "/apple-touch-icon.png", size: 180, apple: true },
      ],
      manifest: "/site.webmanifest",
    }}
    {...rest}
  />
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

<Layout
  title="Home"
  description="Welcome to my site"
  image={{ url: "/og.jpg", alt: "My Site", width: 1200, height: 630 }}
>
  <h1>Hello</h1>
</Layout>
```

The `image` prop flows into Open Graph and Twitter automatically. No extra configuration needed for basic social sharing.

## Overriding per page

You can override any prop on a per-page basis, or disable components entirely with `false`:
```astro
<Layout
  title="About"
  description="Learn more about us"
  openGraph={{ title: "A different title for social sharing" }}
  twitter={false}
/>
```

## Slots

Add custom elements to the head:
```astro
<Head title="My Site">
  <!-- Renders before charset and viewport -->
  <meta slot="top" http-equiv="X-UA-Compatible" content="IE=edge" />

  <!-- Renders at the end of <head> -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
</Head>
```

## Props

| Prop                 | Type                                      | Default                                   | Description                        |
| -------------------- | ----------------------------------------- | ----------------------------------------- | ---------------------------------- |
| `title`              | `string`                                  | —                                         | Page title. Required.              |
| `titleTemplate`      | `` `${string}%s${string}` ``              | —                                         | Title template, e.g. `"%s \| My Site"` |
| `description`        | `string \| false`                         | —                                         | Page description                   |
| `canonical`          | `string \| false`                         | `Astro.url.href`                          | Canonical URL                      |
| `keywords`           | `string[] \| false`                       | —                                         | List of keywords                   |
| `charset`            | `string`                                  | `"UTF-8"`                                 | Document charset                   |
| `viewport`           | `string`                                  | `"width=device-width, initial-scale=1.0"` | Viewport meta content              |
| `image`              | `OpenGraphImage \| false`                 | —                                         | Image passed to OG and Twitter     |
| `robots`             | `RobotsProps \| false`                    | —                                         | Robots directives                  |
| `openGraph`          | `OpenGraphProps \| false`                 | —                                         | Open Graph overrides               |
| `twitter`            | `TwitterProps \| false`                   | —                                         | Twitter card overrides             |
| `favicon`            | `FaviconProps \| false`                   | —                                         | Favicon configuration              |
| `schema`             | `SchemaProps \| false`                    | —                                         | JSON-LD structured data            |
| `languageAlternates` | `LanguageAlternate[] \| false`            | —                                         | Hreflang alternate links           |

Any prop that accepts `false` can be used to disable that component entirely on a per-page basis.