# Individual components

Use components directly inside your own `<head>`. Useful when you only need specific pieces, or want full control over the structure.

## Basic setup
```astro
---
import {
  Title,
  Description,
  Canonical,
  OpenGraph,
  Favicon,
} from "@mannisto/astro-metadata"
---

<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <Title value="My Page" template="%s | My Site" />
    <Description value="Welcome to my site" />
    <Canonical />
    <OpenGraph
      title="My Page"
      description="Welcome to my site"
      image={{ url: "/og.jpg", alt: "My Site" }}
    />
    <Favicon icons={[{ path: "/favicon.ico" }, { path: "/favicon.svg" }]} />
  </head>
  <body>
    <slot />
  </body>
</html>
```

## Full example
```astro
---
import {
  Title, Description, Canonical, Keywords, Robots,
  OpenGraph, Twitter, Favicon, Schema, LanguageAlternates,
} from "@mannisto/astro-metadata"

interface Props {
  title: string
  description: string
}

const { title, description } = Astro.props
---

<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <Title value={title} template="%s | My Site" />
    <Description value={description} />
    <Canonical />
    <Keywords value={["astro", "seo", "metadata"]} />
    <Robots />

    <OpenGraph
      title={title}
      description={description}
      siteName="My Site"
      image={{ url: "/og.jpg", alt: "My Site", width: 1200, height: 630 }}
    />

    <Twitter
      card="summary_large_image"
      site="@mysite"
      image={{ url: "/og.jpg", alt: "My Site" }}
    />

    <Favicon
      icons={[
        { path: "/favicon.ico" },
        { path: "/favicon.svg" },
        { path: "/apple-touch-icon.png", size: 180, apple: true },
      ]}
      manifest="/site.webmanifest"
    />

    <Schema
      schema={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "My Site",
        url: "https://example.com",
      }}
    />

    <LanguageAlternates
      alternates={[
        { href: "https://example.com/en", hreflang: "en" },
        { href: "https://example.com/fi", hreflang: "fi" },
        { href: "https://example.com", hreflang: "x-default" },
      ]}
    />
  </head>
  <body>
    <slot />
  </body>
</html>
```

## When to use

- When you need fine-grained control over the `<head>` structure
- When `Head` is too opinionated for your setup
- When you only need a subset of metadata features