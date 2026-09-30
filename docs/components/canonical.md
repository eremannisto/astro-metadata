# Canonical

Renders the canonical link tag. The canonical URL tells search engines the main URL of the page.

## Import

```astro
---
import { Canonical } from "@mannisto/astro-metadata"
---
```

## Usage

```astro
<!-- The URL of the current page -->
<Canonical />
<!-- Output: <link rel="canonical" href="https://example.com/page"> -->

<!-- A path or a URL -->
<Canonical value="/other-page" />

<!-- With Head -->
<Head title="My Page" canonical="/other-page" />

<!-- Disabled -->
<Head title="My Page" canonical={false} />
```

Without a value, the canonical URL is the absolute URL of the current page, without the query string. A path gets the Astro `site` and `base`. Set `site` in `astro.config.mjs`: without it, the canonical URL is only a path.

## Props

| Prop    | Type     | Default                     | Description                   |
| ------- | -------- | --------------------------- | ----------------------------- |
| `value` | `string` | The URL of the current page | The canonical path or URL     |
