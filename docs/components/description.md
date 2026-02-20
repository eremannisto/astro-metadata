# Description

Renders a meta description tag for your page.

## Import

```astro
---
import { Description } from "@mannisto/astro-metadata"
---
```

## Usage

### Basic

```astro
<Description value="Welcome to my site" />
<!-- Output: <meta name="description" content="Welcome to my site"> -->
```

### With Head component

```astro
<Head
  title="My Page"
  description="Welcome to my site"
/>
```

### With Metadata API

```astro
---
import { Metadata } from "@mannisto/astro-metadata"

Metadata.set({
  title: "About",
  description: "Learn more about us",
})
---
```

### In a layout

```astro
---
import { Description } from "@mannisto/astro-metadata"

interface Props {
  description: string
}

const { description } = Astro.props
---

<html>
  <head>
    <Description value={description} />
  </head>
  <body>
    <slot />
  </body>
</html>
```

## Props

| Prop    | Type     | Description      |
| ------- | -------- | ---------------- |
| `value` | `string` | Page description |
