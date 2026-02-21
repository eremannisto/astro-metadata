# OpenGraph

Renders Open Graph meta tags for rich previews when pages are shared on social platforms. When used inside `Head`, `title`, `description`, `image` and `url` are inherited from the page automatically.

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
  image={{ url: "/og.jpg", alt: "My Site", width: 1200, height: 630 }}
/>
```

### With site name and locale
```astro
<OpenGraph
  title="My Page"
  siteName="My Site"
  locale="en_US"
  localeAlternate={["fi_FI"]}
  image={{ url: "/og.jpg", alt: "My Site" }}
/>
```

### With Head component
```astro
<!-- Inherits title, description, image from page automatically -->
<Head
  title="My Page"
  description="Welcome to my site"
  image={{ url: "/og.jpg", alt: "My Site", width: 1200, height: 630 }}
/>

<!-- Override specific OG values -->
<Head
  title="My Page"
  image={{ url: "/og.jpg", alt: "My Site" }}
  openGraph={{ title: "A different title for sharing", type: "article" }}
/>

<!-- Disable OG entirely -->
<Head title="My Page" openGraph={false} />
```

## Props

| Prop              | Type             | Default     | Description                                  |
| ----------------- | ---------------- | ----------- | -------------------------------------------- |
| `title`           | `string`         | —           | OG title                                     |
| `description`     | `string`         | —           | OG description                               |
| `url`             | `string`         | —           | Canonical URL                                |
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