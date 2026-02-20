# Robots

Controls how search engines crawl and index your page. Defaults to `index, follow`.

## Import

```astro
---
import { Robots } from "@mannisto/astro-metadata"
---
```

## Usage

### Basic

By default, pages are indexed and links are followed:

```astro
<Robots />
<!-- Output: <meta name="robots" content="index, follow"> -->
```

### Prevent indexing

```astro
<Robots index={false} />
<!-- Output: <meta name="robots" content="noindex, follow"> -->
```

### Prevent following links

```astro
<Robots follow={false} />
<!-- Output: <meta name="robots" content="index, nofollow"> -->
```

### Block completely

```astro
<Robots index={false} follow={false} />
<!-- Output: <meta name="robots" content="noindex, nofollow"> -->
```

### Prevent caching

```astro
<Robots archive={false} />
<!-- Output: <meta name="robots" content="index, follow, noarchive"> -->
```

### Extra directives

```astro
<Robots extra="max-snippet:-1, max-image-preview:large" />
<!-- Output: <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large"> -->
```

### With Head component

```astro
<Head
  title="My Page"
  robots={{
    index: false,
    follow: true,
  }}
/>
```

### With Metadata API

```astro
---
import { Metadata } from "@mannisto/astro-metadata"

Metadata.set({
  title: "Private Page",
  robots: {
    index: false,
    follow: false,
  },
})
---
```

### In a layout

```astro
---
import { Robots } from "@mannisto/astro-metadata"

interface Props {
  noindex?: boolean
}

const { noindex } = Astro.props
---

<html>
  <head>
    <Robots index={!noindex} />
  </head>
  <body>
    <slot />
  </body>
</html>
```

## Props

| Prop      | Type      | Default | Description                                                             |
| --------- | --------- | ------- | ----------------------------------------------------------------------- |
| `index`   | `boolean` | `true`  | Allow indexing                                                          |
| `follow`  | `boolean` | `true`  | Allow following links                                                   |
| `archive` | `boolean` | `true`  | Allow search engines to cache the page                                  |
| `snippet` | `boolean` | `true`  | Allow text snippets in search results                                   |
| `extra`   | `string`  | —       | Additional directives, e.g. `"max-snippet:-1, max-image-preview:large"` |
