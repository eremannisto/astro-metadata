# Individual components

Use the components directly in your own `<head>`. This gives you full control of the structure. Use it when you need only some parts, or when `Head` does not suit your layout.

## Basic setup

```astro
---
import { Canonical, Description, OpenGraph, Title } from "@mannisto/astro-metadata"
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
  Alternates,
  Canonical,
  Description,
  Icons,
  OpenGraph,
  Robots,
  Schema,
  Title,
  Twitter,
  schema,
} from "@mannisto/astro-metadata"

type Props = {
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
    <Robots />

    <OpenGraph
      title={title}
      description={description}
      siteName="My Site"
      image={{ url: "/og.jpg", alt: "My Site", width: 1200, height: 630 }}
    />

    <Twitter site="@mysite" image={{ url: "/og.jpg", alt: "My Site" }} />

    <Icons
      icons={[
        { path: "/favicon.ico", size: 32 },
        { path: "/icon.svg" },
        { path: "/apple-touch-icon.png", size: 180, apple: true },
      ]}
    />
    <link rel="manifest" href="/manifest.webmanifest" />

    <Schema data={schema.website()} />

    <Alternates
      languages={[
        { href: "/en", hreflang: "en" },
        { href: "/fi", hreflang: "fi" },
        { href: "/", hreflang: "x-default" },
      ]}
      feeds={[{ href: "/rss.xml", title: "Blog" }]}
    />
  </head>
  <body>
    <slot />
  </body>
</html>
```

## Differences from Head

- The components do not read `src/metadata.config.ts`. Only `Head`, `Icons` and the `schema` builders use the config and the integration.
- `Canonical`, `OpenGraph`, `Twitter` and `Alternates` still make the URLs absolute with the Astro `site`.
- `Icons` without the `icons` prop renders the generated favicons from the `favicon` option.
