# Twitter

Renders Twitter card meta tags for rich previews on X. When used inside `Head`, `title`, `description`, `image` and `url` are inherited from the page automatically.

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
  site="@mysite"
  image={{ url: "/og.jpg", alt: "My Site" }}
/>
```

### With Head component
```astro
<!-- Inherits title, description, image from page automatically -->
<Head
  title="My Page"
  description="Welcome to my site"
  image={{ url: "/og.jpg", alt: "My Site" }}
/>

<!-- Override specific Twitter values -->
<Head
  title="My Page"
  image={{ url: "/og.jpg", alt: "My Site" }}
  twitter={{ card: "summary", site: "@mysite" }}
/>

<!-- Disable Twitter entirely -->
<Head title="My Page" twitter={false} />
```

## Props

| Prop          | Type                                                      | Default                 | Description                          |
| ------------- | --------------------------------------------------------- | ----------------------- | ------------------------------------ |
| `title`       | `string`                                                  | —                       | Card title                           |
| `description` | `string`                                                  | —                       | Card description                     |
| `url`         | `string`                                                  | —                       | Canonical URL for the card           |
| `card`        | `"summary" \| "summary_large_image" \| "player" \| "app"` | `"summary_large_image"` | Card type                            |
| `site`        | `string`                                                  | —                       | Twitter handle of the site           |
| `creator`     | `string`                                                  | —                       | Twitter handle of the content author |
| `image.url`   | `string`                                                  | —                       | Image URL. Required if image is set. |
| `image.alt`   | `string`                                                  | —                       | Image alt text                       |

## Card types

| Type                  | Description                                     |
| --------------------- | ----------------------------------------------- |
| `summary`             | Small card with a thumbnail image               |
| `summary_large_image` | Large card with a prominent image (recommended) |
| `player`              | Card with an embedded video or audio player     |
| `app`                 | Card for mobile app downloads                   |