# Individual Components

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
      image={{
        url: "/og.jpg",
        alt: "My Site",
      }}
    />
    <Favicon
      icons={[
        { path: "/favicon.ico" },
        { path: "/favicon.svg" },
      ]}
    />
  </head>
  <body>
    <slot />
  </body>
</html>
```

## Full control example

Use all available components:

```astro
---
import {
  Title,
  Description,
  Canonical,
  Keywords,
  Robots,
  OpenGraph,
  Twitter,
  Favicon,
  Schema,
  LanguageAlternates,
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
    <Robots index={true} follow={true} />

    <OpenGraph
      title={title}
      description={description}
      siteName="My Site"
      locale="en_US"
      image={{
        url: "/og.jpg",
        alt: "My Site",
        width: 1200,
        height: 630,
      }}
    />

    <Twitter
      card="summary_large_image"
      site="@mysite"
      image={{
        url: "/og.jpg",
        alt: "My Site",
      }}
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

## Selective usage

Only use what you need:

```astro
---
import { Title, Description, Canonical } from "@mannisto/astro-metadata"

const { title, description } = Astro.props
---

<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <Title value={title} template="%s | My Site" />
    <Description value={description} />
    <Canonical />
  </head>
  <body>
    <slot />
  </body>
</html>
```

## Conditional rendering

Add components conditionally:

```astro
---
import {
  Title,
  Description,
  OpenGraph,
  Schema,
} from "@mannisto/astro-metadata"

interface Props {
  title: string
  description: string
  image?: string
  schema?: Record<string, unknown>
}

const { title, description, image, schema } = Astro.props
---

<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <Title value={title} template="%s | My Site" />
    <Description value={description} />

    {image && (
      <OpenGraph
        title={title}
        description={description}
        image={{
          url: image,
          alt: title,
        }}
      />
    )}

    {schema && <Schema schema={schema} />}
  </head>
  <body>
    <slot />
  </body>
</html>
```

## Mixing with custom tags

Add your own meta tags alongside the components:

```astro
---
import { Title, Description, OpenGraph } from "@mannisto/astro-metadata"

const { title, description } = Astro.props
---

<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="author" content="Ere Männistö" />
    <meta name="theme-color" content="#1a1a2e" />

    <Title value={title} template="%s | My Site" />
    <Description value={description} />
    <OpenGraph
      title={title}
      description={description}
    />

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="stylesheet" href="/styles/global.css" />
  </head>
  <body>
    <slot />
  </body>
</html>
```

## When to use

- When you need fine-grained control over the `<head>` structure
- When `Head` component is too opinionated
- When you only need a subset of metadata features
- When integrating with existing head management
