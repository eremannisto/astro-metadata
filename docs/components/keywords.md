# Keywords

Renders a meta keywords tag for your page.

## Import

```astro
---
import { Keywords } from "@mannisto/astro-metadata"
---
```

## Usage

### Basic

```astro
<Keywords value={["astro", "seo", "metadata"]} />
<!-- Output: <meta name="keywords" content="astro, seo, metadata"> -->
```

### With Head component

```astro
<Head
  title="My Page"
  keywords={["astro", "seo", "metadata"]}
/>
```

### With Metadata API

```astro
---
import { Metadata } from "@mannisto/astro-metadata"

Metadata.set({
  title: "About",
  keywords: ["astro", "seo", "metadata"],
})
---
```

### In a layout

```astro
---
import { Keywords } from "@mannisto/astro-metadata"

interface Props {
  keywords?: string[]
}

const { keywords } = Astro.props
---

<html>
  <head>
    {keywords && <Keywords value={keywords} />}
  </head>
  <body>
    <slot />
  </body>
</html>
```

## Props

| Prop    | Type       | Description      |
| ------- | ---------- | ---------------- |
| `value` | `string[]` | List of keywords |
