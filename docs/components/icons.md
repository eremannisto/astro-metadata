# Favicon

Favicon support with light and dark mode variants, automatic MIME type detection, and automatic sorting.

## Import
```astro
---
import { Favicon } from "@mannisto/astro-metadata"
---
```

## Usage

### Single favicon
```astro
<Favicon icons={[{ path: "/favicon.ico" }]} />
```

### Multiple formats
```astro
<Favicon
  icons={[
    { path: "/favicon.ico" },
    { path: "/favicon.svg" },
    { path: "/favicon-32x32.png", size: 32 },
    { path: "/apple-touch-icon.png", size: 180, apple: true },
  ]}
/>
```

### Dark and light mode variants
```astro
<Favicon
  icons={[
    { path: "/favicon.ico" },
    { path: "/favicon-dark.svg", theme: "dark" },
    { path: "/favicon-light.svg", theme: "light" },
  ]}
/>
```

### With manifest
```astro
<Favicon
  icons={[{ path: "/favicon.ico" }]}
  manifest="/site.webmanifest"
/>
```

### Disable sorting

Icons are automatically sorted in the recommended browser order: `ico` → `png` → `svg` → `apple` → themed variants. Pass `sort={false}` to preserve the original order:
```astro
<Favicon
  icons={[
    { path: "/favicon.svg" },
    { path: "/favicon.ico" },
  ]}
  sort={false}
/>
```

### With Head component
```astro
<Head
  title="My Page"
  favicon={{
    icons: [
      { path: "/favicon.ico" },
      { path: "/favicon.svg" },
      { path: "/apple-touch-icon.png", size: 180, apple: true },
    ],
    manifest: "/site.webmanifest",
  }}
/>

<!-- Disabled -->
<Head title="My Page" favicon={false} />
```

## Props

| Prop       | Type            | Default | Description                             |
| ---------- | --------------- | ------- | --------------------------------------- |
| `icons`    | `FaviconFile[]` | —       | List of favicon files                   |
| `manifest` | `string`        | —       | Path to web app manifest                |
| `sort`     | `boolean`       | `true`  | Sort icons in recommended browser order |

## FaviconFile

| Prop    | Type                | Description                                                 |
| ------- | ------------------- | ----------------------------------------------------------- |
| `path`  | `string`            | Path to the file. MIME type is detected automatically.      |
| `size`  | `number`            | Size in pixels. Rendered as `NxN` in the `sizes` attribute. |
| `theme` | `"light" \| "dark"` | Adds a `prefers-color-scheme` media query                   |
| `apple` | `boolean`           | Renders as `<link rel="apple-touch-icon">`                  |