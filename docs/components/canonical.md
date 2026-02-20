# Canonical

Renders a canonical link tag. Falls back to `Astro.url.href` when no value is provided, so every page gets a canonical tag with zero configuration.

## Import

```astro
---
import { Canonical } from "@mannisto/astro-metadata"
---
```

## Usage

### Basic

Uses the current page URL automatically:

```astro
<Canonical />
<!-- Output: <link rel="canonical" href="https://example.com/current-page"> -->
```

### Custom URL

Override with a specific canonical URL:

```astro
<Canonical value="https://example.com/page" />
<!-- Output: <link rel="canonical" href="https://example.com/page"> -->
```

### With Head component

```astro
<Head
  title="My Page"
  canonical="https://example.com/page"
/>
```

### With Metadata API

```astro
---
import { Metadata } from "@mannisto/astro-metadata"

Metadata.set({
  title: "About",
  canonical: "https://example.com/about",
})
---
```

### In a layout

```astro
---
import { Canonical } from "@mannisto/astro-metadata"
---

<html>
  <head>
    <Canonical />
  </head>
  <body>
    <slot />
  </body>
</html>
```

## Props

| Prop    | Type     | Default          | Description                                  |
| ------- | -------- | ---------------- | -------------------------------------------- |
| `value` | `string` | `Astro.url.href` | Canonical URL. Defaults to `Astro.url.href`. |
