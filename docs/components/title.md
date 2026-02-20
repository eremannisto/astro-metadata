# Title

Renders the `<title>` tag. The template must contain `%s`, which is replaced with the page title — TypeScript enforces this at the type level.

## Import

```astro
---
import { Title } from "@mannisto/astro-metadata"
---
```

## Usage

### Basic

```astro
<Title value="My Page" />
<!-- Output: <title>My Page</title> -->
```

### With template

```astro
<Title value="My Page" template="%s | My Site" />
<!-- Output: <title>My Page | My Site</title> -->
```

### Template variations

The `%s` placeholder can be anywhere in the template:

```astro
<!-- Suffix -->
<Title value="About" template="%s | My Site" />
<!-- Output: <title>About | My Site</title> -->

<!-- Prefix -->
<Title value="About" template="My Site | %s" />
<!-- Output: <title>My Site | About</title> -->
```

### With Head component

```astro
<Head
  title="My Page"
  titleTemplate="%s | My Site"
/>
```

### With Metadata API

```astro
---
import { Metadata } from "@mannisto/astro-metadata"

Metadata.set({
  title: "About",
})
---
```

### In a layout

```astro
---
import { Title } from "@mannisto/astro-metadata"

interface Props {
  title: string
}

const { title } = Astro.props
---

<html>
  <head>
    <Title value={title} template="%s | My Site" />
  </head>
  <body>
    <slot />
  </body>
</html>
```

## Props

| Prop       | Type                         | Description                         |
| ---------- | ---------------------------- | ----------------------------------- |
| `value`    | `string`                     | Page title. Required.               |
| `template` | `` `${string}%s${string}` `` | Template string. Must contain `%s`. |
