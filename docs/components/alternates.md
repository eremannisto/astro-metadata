# Alternates

Renders `<link rel="alternate">` tags:

- **Languages:** `hreflang` links tell search engines about the other language versions of the page.
- **Feeds:** RSS, Atom and JSON feed links let feed readers find your feeds.

## Import

```astro
---
import { Alternates } from "@mannisto/astro-metadata"
---
```

## Usage

### Languages

```astro
<Alternates
  languages={[
    { href: "/en", hreflang: "en" },
    { href: "/fi", hreflang: "fi" },
    { href: "/en", hreflang: "x-default" },
  ]}
/>
```

The component makes the URLs absolute with the Astro `site`. Search engines require absolute `hreflang` URLs.

### Regional variants

```astro
<Alternates
  languages={[
    { href: "/en-us", hreflang: "en-US" },
    { href: "/en-gb", hreflang: "en-GB" },
    { href: "/en-us", hreflang: "x-default" },
  ]}
/>
```

### Feeds

```astro
<Alternates
  feeds={[
    { href: "/rss.xml", title: "Blog" },
    { href: "/atom.xml", title: "Blog", type: "atom" },
    { href: "/feed.json", type: "json" },
  ]}
/>
```

The feed paths get the Astro `base`.

### With @mannisto/astro-i18n

`Locale.hreflang()` returns the links for all locales and `x-default`:

```astro
---
import { Locale } from "@mannisto/astro-i18n/runtime"
import { Head } from "@mannisto/astro-metadata"

const languages = Locale.hreflang(Astro.url, Astro.site!)
---

<Head title="My Page" languages={languages} />
```

### With the Head component

```astro
<Head title="My Page" languages={languages} feeds={[{ href: "/rss.xml" }]} />

<!-- Disabled -->
<Head title="My Page" languages={false} feeds={false} />
```

`Head` uses `feeds` from `src/metadata.config.ts` when the prop is missing.

## Props

| Prop        | Type                  | Description                        |
| ----------- | --------------------- | ---------------------------------- |
| `languages` | `LanguageAlternate[]` | The other language versions        |
| `feeds`     | `Feed[]`              | The feeds of the site              |

## LanguageAlternate

| Prop       | Type     | Description                                                     |
| ---------- | -------- | --------------------------------------------------------------- |
| `href`     | `string` | The path or URL of the page                                     |
| `hreflang` | `string` | The language or region code, e.g. `en`, `fi`, `en-US`, `x-default` |

## Feed

| Prop    | Type                         | Default | Description             |
| ------- | ---------------------------- | ------- | ----------------------- |
| `href`  | `string`                     | —       | The path of the feed    |
| `title` | `string`                     | —       | The name of the feed    |
| `type`  | `"rss" \| "atom" \| "json"`  | `"rss"` | The feed format         |
