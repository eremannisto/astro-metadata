# LanguageAlternates

Renders `<link rel="alternate" hreflang>` tags for multilingual sites. Tells search engines which language version to serve for a given region.

## Import
```astro
---
import { LanguageAlternates } from "@mannisto/astro-metadata"
---
```

## Usage

### Basic
```astro
<LanguageAlternates
  alternates={[
    { href: "https://example.com/en", hreflang: "en" },
    { href: "https://example.com/fi", hreflang: "fi" },
    { href: "https://example.com", hreflang: "x-default" },
  ]}
/>
```

### Regional variants
```astro
<LanguageAlternates
  alternates={[
    { href: "https://example.com/en-us", hreflang: "en-US" },
    { href: "https://example.com/en-gb", hreflang: "en-GB" },
    { href: "https://example.com", hreflang: "x-default" },
  ]}
/>
```

### With Head component
```astro
<Head
  title="My Page"
  languageAlternates={[
    { href: "https://example.com/en", hreflang: "en" },
    { href: "https://example.com/fi", hreflang: "fi" },
    { href: "https://example.com", hreflang: "x-default" },
  ]}
/>

<!-- Disabled -->
<Head title="My Page" languageAlternates={false} />
```

### With Metadata API
```astro
---
import { Metadata } from "@mannisto/astro-metadata"

Metadata.set({
  title: "About",
  languageAlternates: [
    { href: "https://example.com/en/about", hreflang: "en" },
    { href: "https://example.com/fi/about", hreflang: "fi" },
    { href: "https://example.com/about", hreflang: "x-default" },
  ],
})
---
```

### Dynamic alternates in a layout
```astro
---
import { LanguageAlternates } from "@mannisto/astro-metadata"

const currentPath = Astro.url.pathname
const baseUrl = "https://example.com"
---

<html>
  <head>
    <LanguageAlternates
      alternates={[
        { href: `${baseUrl}/en${currentPath}`, hreflang: "en" },
        { href: `${baseUrl}/fi${currentPath}`, hreflang: "fi" },
        { href: `${baseUrl}${currentPath}`, hreflang: "x-default" },
      ]}
    />
  </head>
  <body>
    <slot />
  </body>
</html>
```

## Props

| Prop                    | Type                  | Description                                                     |
| ----------------------- | --------------------- | --------------------------------------------------------------- |
| `alternates`            | `LanguageAlternate[]` | List of alternate language pages                                |
| `alternates[].href`     | `string`              | Full URL of the alternate page                                  |
| `alternates[].hreflang` | `string`              | Language or region code, e.g. `en`, `fi`, `en-US`, `x-default` |