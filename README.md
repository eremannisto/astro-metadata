# Astro Metadata

![banner](./assets/banner.png)

![npm version](https://img.shields.io/npm/v/@mannisto/astro-metadata)
![license](https://img.shields.io/badge/license-MIT-green)
![astro peer dependency](https://img.shields.io/npm/dependency-version/@mannisto/astro-metadata/peer/astro)

Astro components for managing your page head — metadata, social sharing, favicons, and SEO.

## Installation
```bash
# pnpm
pnpm add @mannisto/astro-metadata

# npm
npm install @mannisto/astro-metadata

# yarn
yarn add @mannisto/astro-metadata
```

## Usage

There are three ways to use this package. Pick what suits your project, or combine them freely.

### Head component

The simplest approach — use `Head` in your layout and pass props down from pages. Title, description and image flow into Open Graph and Twitter automatically.
```astro
---
import { Head } from "@mannisto/astro-metadata"
---

<html>
  <Head
    title="Home"
    titleTemplate="%s | My Site"
    description="Welcome to my site"
    image={{ url: "/og.jpg", alt: "My Site", width: 1200, height: 630 }}
  />
  <body>
    <slot />
  </body>
</html>
```

[Read more →](docs/usage/head.md)

### Metadata API

Set metadata in pages, resolve in layouts — no prop drilling.
```astro
---
// pages/about.astro
import { Metadata } from "@mannisto/astro-metadata"

Metadata.set({
  title: "About",
  description: "Learn more about us",
})
---
```
```astro
---
// layouts/Layout.astro
import { Head, Metadata } from "@mannisto/astro-metadata"

const meta = Metadata.resolve({
  title: "My Site",
  titleTemplate: "%s | My Site",
})
---

<html>
  <Head {...meta} />
  <body>
    <slot />
  </body>
</html>
```

[Read more →](docs/usage/metadata.md)

### Individual components

Use components directly in your `<head>` for full control.
```astro
---
import { Title, Description, OpenGraph } from "@mannisto/astro-metadata"
---

<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <Title value="My Page" template="%s | My Site" />
    <Description value="Welcome to my site" />
    <OpenGraph
      title="My Page"
      image={{ url: "/og.jpg", alt: "My Site" }}
    />
  </head>
  <body>
    <slot />
  </body>
</html>
```

[Read more →](docs/usage/components.md)

## Components

- [Canonical](docs/components/canonical.md)
- [Description](docs/components/description.md)
- [Favicon](docs/components/favicon.md)
- [Head](docs/components/head.md)
- [Keywords](docs/components/keywords.md)
- [LanguageAlternates](docs/components/language-alternates.md)
- [OpenGraph](docs/components/open-graph.md)
- [Robots](docs/components/robots.md)
- [Schema](docs/components/schema.md)
- [Title](docs/components/title.md)
- [Twitter](docs/components/twitter.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup and contribution guidelines.

## License

MIT © [Ere Männistö](https://github.com/eremannisto)