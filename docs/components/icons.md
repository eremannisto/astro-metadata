# Icons

Renders the favicon tags. The component detects the MIME type of each file, supports light and dark variants, and sorts the tags in the recommended order.

With the `favicon` option of the integration, `Icons` renders the generated favicons automatically. See [Favicons](../usage/favicons.md).

## Import

```astro
---
import { Icons } from "@mannisto/astro-metadata"
---
```

## Usage

### Generated favicons

```astro
<!-- With the favicon option of the integration -->
<Icons />
```

### Your own files

```astro
<Icons
  icons={[
    { path: "/favicon.ico", size: 32 },
    { path: "/icon.svg" },
    { path: "/apple-touch-icon.png", size: 180, apple: true },
  ]}
/>
```

### Light and dark variants

```astro
<Icons
  icons={[
    { path: "/favicon.ico" },
    { path: "/icon-dark.svg", theme: "dark" },
    { path: "/icon-light.svg", theme: "light" },
  ]}
/>
```

### Disable the sort

The component sorts the icons in the recommended browser order: `ico`, `png`, `svg`, `apple`, then the light and dark variants. Set `sort={false}` to keep your order:

```astro
<Icons icons={[{ path: "/icon.svg" }, { path: "/favicon.ico" }]} sort={false} />
```

### With the Head component

```astro
<!-- Head renders the generated favicons automatically -->
<Head title="My Page" />

<!-- Your own files -->
<Head title="My Page" icons={{ icons: [{ path: "/favicon.ico" }] }} />

<!-- Disabled -->
<Head title="My Page" icons={false} />
```

## Props

| Prop    | Type         | Default                | Description                                  |
| ------- | ------------ | ---------------------- | -------------------------------------------- |
| `icons` | `IconFile[]` | The generated favicons | The icon files                               |
| `sort`  | `boolean`    | `true`                 | Sort the icons in the recommended order      |

## IconFile

| Prop    | Type                | Description                                                   |
| ------- | ------------------- | ------------------------------------------------------------- |
| `path`  | `string`            | The path of the file. The component detects the MIME type.    |
| `size`  | `number`            | The size in pixels. The `sizes` attribute becomes `NxN`.      |
| `theme` | `"light" \| "dark"` | Adds a `prefers-color-scheme` media query                     |
| `apple` | `boolean`           | Renders `<link rel="apple-touch-icon">`                       |

The paths get the Astro `base`.
