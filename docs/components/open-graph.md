# OpenGraph

Renders Open Graph meta tags for rich previews when your pages are shared on social platforms. When used inside `Head`, `title`, `description` and `url` fall back to the page values automatically.

## Import

```astro
---
import { OpenGraph } from "@mannisto/astro-metadata"
---
```

## Usage

### Basic

```astro
<OpenGraph
  title="My Page"
  description="Welcome to my site"
  image={{
    url: "/og.jpg",
    alt: "My Site",
  }}
/>
<!--
  Output:
  <meta property="og:title" content="My Page">
  <meta property="og:description" content="Welcome to my site">
  <meta property="og:type" content="website">
  <meta property="og:image" content="/og.jpg">
  <meta property="og:image:alt" content="My Site">
-->
```

### With image dimensions

```astro
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
<!--
  Output:
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
-->
```

### With site name and locale

```astro
<OpenGraph
  title="My Page"
  description="Welcome to my site"
  siteName="My Site"
  locale="en_US"
/>
<!--
  Output:
  <meta property="og:site_name" content="My Site">
  <meta property="og:locale" content="en_US">
-->
```

### Article type

```astro
<OpenGraph
  title="How to Build an Astro Site"
  description="A complete guide"
  type="article"
/>
<!-- Output: <meta property="og:type" content="article"> -->
```

### With video

```astro
<OpenGraph
  title="My Page"
  description="Watch our video"
  video={{
    url: "https://example.com/video.mp4",
    type: "video/mp4",
    width: 1280,
    height: 720,
  }}
/>
```

### With Head component

```astro
<Head
  title="My Page"
  description="Welcome to my site"
  openGraph={{
    siteName: "My Site",
    locale: "en_US",
    image: {
      url: "/og.jpg",
      alt: "My Site",
      width: 1200,
      height: 630,
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
  openGraph: {
    type: "article",
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
import { OpenGraph } from "@mannisto/astro-metadata"

interface Props {
  title: string
  description: string
  image?: string
}

const { title, description, image } = Astro.props
---

<html>
  <head>
    <OpenGraph
      title={title}
      description={description}
      image={image ? { url: image, alt: title } : undefined}
    />
  </head>
  <body>
    <slot />
  </body>
</html>
```

## Props

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

## OpenGraphImage

| Prop        | Type     | Description                                |
| ----------- | -------- | ------------------------------------------ |
| `url`       | `string` | Image URL. Required if image is set.       |
| `secureUrl` | `string` | HTTPS image URL                            |
| `type`      | `string` | MIME type, e.g. `"image/jpeg"`             |
| `alt`       | `string` | Image alt text                             |
| `width`     | `number` | Image width in pixels. Recommended: `1200` |
| `height`    | `number` | Image height in pixels. Recommended: `630` |

## OpenGraphVideo

| Prop        | Type     | Description                          |
| ----------- | -------- | ------------------------------------ |
| `url`       | `string` | Video URL. Required if video is set. |
| `secureUrl` | `string` | HTTPS video URL                      |
| `type`      | `string` | MIME type, e.g. `"video/mp4"`        |
| `width`     | `number` | Video width in pixels                |
| `height`    | `number` | Video height in pixels               |

## OpenGraphAudio

| Prop        | Type     | Description                          |
| ----------- | -------- | ------------------------------------ |
| `url`       | `string` | Audio URL. Required if audio is set. |
| `secureUrl` | `string` | HTTPS audio URL                      |
| `type`      | `string` | MIME type, e.g. `"audio/mpeg"`       |
