# Twitter

Renders Twitter card meta tags for rich previews on X (formerly Twitter). When used inside `Head`, `title` and `description` fall back to the page values automatically.

## Import

```astro
---
import { Twitter } from "@mannisto/astro-metadata"
---
```

## Usage

### Basic

```astro
<Twitter
  card="summary_large_image"
  image={{
    url: "/og.jpg",
    alt: "My Site",
  }}
/>
<!--
  Output:
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="/og.jpg">
  <meta name="twitter:image:alt" content="My Site">
-->
```

### With site and creator

```astro
<Twitter
  card="summary_large_image"
  site="@mysite"
  creator="@myhandle"
  image={{
    url: "/og.jpg",
    alt: "My Site",
  }}
/>
<!--
  Output:
  <meta name="twitter:site" content="@mysite">
  <meta name="twitter:creator" content="@myhandle">
-->
```

### Summary card (small image)

```astro
<Twitter
  card="summary"
  title="My Page"
  description="Welcome to my site"
/>
<!-- Output: <meta name="twitter:card" content="summary"> -->
```

### With Head component

```astro
<Head
  title="My Page"
  description="Welcome to my site"
  twitter={{
    card: "summary_large_image",
    site: "@mysite",
    creator: "@myhandle",
    image: {
      url: "/og.jpg",
      alt: "My Site",
    },
  }}
/>
```

### With Metadata API

```astro
---
import { Metadata } from "@mannisto/astro-metadata"

Metadata.set({
  title: "About",
  description: "Learn more about us",
  twitter: {
    card: "summary_large_image",
    site: "@mysite",
    image: {
      url: "/og/about.jpg",
      alt: "About us",
    },
  },
})
---
```

### In a layout

```astro
---
import { Twitter } from "@mannisto/astro-metadata"

interface Props {
  title: string
  description: string
  image?: string
}

const { title, description, image } = Astro.props
---

<html>
  <head>
    <Twitter
      card="summary_large_image"
      title={title}
      description={description}
      site="@mysite"
      image={image ? { url: image, alt: title } : undefined}
    />
  </head>
  <body>
    <slot />
  </body>
</html>
```

## Props

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

## Card Types

| Type                  | Description                                     |
| --------------------- | ----------------------------------------------- |
| `summary`             | Small card with a thumbnail image               |
| `summary_large_image` | Large card with a prominent image (recommended) |
| `player`              | Card with an embedded video or audio player     |
| `app`                 | Card for mobile app downloads                   |
