# Head component

Use `Head` in your layout, and give it the values of each page as props. `Head` renders the full `<head>`: the charset, the viewport, the title, the description, the canonical URL, the social cards, the favicons and the other tags.

## Basic setup

```astro
---
// src/layouts/Layout.astro
import { Head, type HeadProps } from "@mannisto/astro-metadata"

type Props = HeadProps
---

<html lang="en">
  <Head titleTemplate="%s | My Site" {...Astro.props} />
  <body>
    <slot />
  </body>
</html>
```

```astro
---
// src/pages/index.astro
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

The `title`, `description` and `image` props also go into the Open Graph and Twitter tags.

## Site-wide defaults

Put the values that are the same on all pages into `src/metadata.config.ts`. Then the layout does not need them:

```ts
// src/metadata.config.ts
import { defineMetadata } from "@mannisto/astro-metadata"

export default defineMetadata({
  siteName: "My Site",
  titleTemplate: "%s | My Site",
  image: { url: "/og.jpg", width: 1200, height: 630 },
})
```

The props of `Head` override the config values. See [Config file and integration](config.md).

## Absolute URLs

Set `site` in `astro.config.mjs`. `Head` uses it for these URLs:

- The canonical URL. Without a `canonical` prop, it is the URL of the current page.
- The `og:url`, `og:image` and `twitter:image` values.
- The `hreflang` links.

A path such as `/og.jpg` becomes `https://example.com/og.jpg`. The package also adds the Astro `base`. You can use the same function in your own code:

```ts
import { url } from "@mannisto/astro-metadata"

url("/og.jpg") // "https://example.com/og.jpg"
```

Without `site`, `url()` returns the path with the base.

## Override or disable a part

Set a prop to `false` to remove a part of the head:

```astro
<Layout
  title="About"
  description="Learn more about us"
  openGraph={{ title: "A different title for social cards" }}
  twitter={false}
/>
```

## Slots

Use the slots to add your own tags:

```astro
<Head title="My Site">
  <!-- Renders after the charset, before the viewport -->
  <meta slot="top" http-equiv="X-UA-Compatible" content="IE=edge" />

  <!-- Renders at the end of <head> -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
</Head>
```

See the [Head component reference](../components/head.md) for all props.
