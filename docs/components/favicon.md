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
<!-- Output: <link rel="icon" href="/favicon.ico" type="image/x-icon"> -->
```

### Multiple formats

Include multiple formats for better browser compatibility:

```astro
<Favicon
  icons={[
    { path: "/favicon.ico" },
    { path: "/favicon.svg" },
  ]}
/>
<!--
  Output:
  <link rel="icon" href="/favicon.ico" type="image/x-icon">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
-->
```

### With sizes

Specify sizes for PNG favicons:

```astro
<Favicon
  icons={[
    { path: "/favicon.ico" },
    { path: "/favicon-32x32.png", size: 32 },
    { path: "/favicon-96x96.png", size: 96 },
  ]}
/>
<!--
  Output:
  <link rel="icon" href="/favicon.ico" type="image/x-icon">
  <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32">
  <link rel="icon" href="/favicon-96x96.png" type="image/png" sizes="96x96">
-->
```

### Apple Touch Icon

Add an Apple Touch Icon for iOS devices:

```astro
<Favicon
  icons={[
    { path: "/favicon.ico" },
    { path: "/apple-touch-icon.png", size: 180, apple: true },
  ]}
/>
<!--
  Output:
  <link rel="icon" href="/favicon.ico" type="image/x-icon">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180">
-->
```

### Dark and light mode variants

Provide different icons for light and dark mode:

```astro
<Favicon
  icons={[
    { path: "/favicon.ico" },
    { path: "/favicon-dark.svg", theme: "dark" },
    { path: "/favicon-light.svg", theme: "light" },
  ]}
/>
<!--
  Output:
  <link rel="icon" href="/favicon.ico" type="image/x-icon">
  <link rel="icon" href="/favicon-dark.svg" type="image/svg+xml"
        media="(prefers-color-scheme: dark)">
  <link rel="icon" href="/favicon-light.svg" type="image/svg+xml"
        media="(prefers-color-scheme: light)">
-->
```

### With manifest

```astro
<Favicon
  icons={[{ path: "/favicon.ico" }]}
  manifest="/site.webmanifest"
/>
<!--
  Output:
  <link rel="icon" href="/favicon.ico" type="image/x-icon">
  <link rel="manifest" href="/site.webmanifest">
-->
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

When using the `Head` component, pass the favicon configuration as a prop:

```astro
<Head
  title="My Page"
  favicon={{
    icons: [
      { path: "/favicon.ico" },
      { path: "/favicon.svg" },
    ],
    manifest: "/site.webmanifest",
  }}
/>
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
