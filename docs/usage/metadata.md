# Metadata API

Set metadata in pages, resolve in layouts — no prop drilling through nested layout layers.

## Basic setup

Set metadata in your page:
```astro
---
// pages/about.astro
import { Metadata } from "@mannisto/astro-metadata"
import Layout from "../layouts/Layout.astro"

Metadata.set({
  title: "About",
  description: "Learn more about us",
})
---

<Layout>
  <h1>About</h1>
</Layout>
```

Resolve it in your layout with defaults:
```astro
---
// layouts/Layout.astro
import { Head, Metadata } from "@mannisto/astro-metadata"

const meta = Metadata.resolve({
  title: "My Site",
  titleTemplate: "%s | My Site",
  description: "Default description",
})
---

<html lang="en">
  <Head {...meta} />
  <body>
    <slot />
  </body>
</html>
```

`Metadata.resolve()` merges page values over your layout defaults — whatever the page sets wins, everything else falls back gracefully.

## Setting all metadata
```astro
---
// pages/blog/[slug].astro
import { Metadata } from "@mannisto/astro-metadata"
import Layout from "../../layouts/Layout.astro"

const post = await getPost(Astro.params.slug)

Metadata.set({
  title: post.title,
  description: post.excerpt,
  canonical: `https://example.com/blog/${post.slug}`,
  image: {
    url: post.coverImage,
    alt: post.title,
    width: 1200,
    height: 630,
  },
  openGraph: { type: "article" },
  twitter: {
    card: "summary_large_image",
    creator: post.author.twitter,
  },
  schema: {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author.name,
    },
  },
})
---

<Layout>
  <article>
    <h1>{post.title}</h1>
  </article>
</Layout>
```

## Layout with site-wide defaults
```astro
---
// layouts/Layout.astro
import { Head, Metadata } from "@mannisto/astro-metadata"

const meta = Metadata.resolve({
  title: "My Site",
  titleTemplate: "%s | My Site",
  description: "A great website",
  image: { url: "/og.jpg", alt: "My Site", width: 1200, height: 630 },
  openGraph: { siteName: "My Site", locale: "en_US" },
  twitter: { site: "@mysite", card: "summary_large_image" },
  favicon: {
    icons: [
      { path: "/favicon.ico" },
      { path: "/favicon.svg" },
    ],
  },
})
---

<html lang="en">
  <Head {...meta} />
  <body>
    <slot />
  </body>
</html>
```

## Nested layouts

The Metadata API shines with deeply nested layouts — metadata set in the page flows through any number of layout layers:
```astro
---
// pages/blog/[slug].astro
import { Metadata } from "@mannisto/astro-metadata"
import BlogLayout from "../../layouts/BlogLayout.astro"

const post = await getPost(Astro.params.slug)

Metadata.set({
  title: post.title,
  description: post.excerpt,
  image: { url: post.coverImage, alt: post.title },
  openGraph: { type: "article" },
})
---

<BlogLayout>
  <article>
    <h1>{post.title}</h1>
  </article>
</BlogLayout>
```
```astro
---
// layouts/BlogLayout.astro
import BaseLayout from "./BaseLayout.astro"
---

<BaseLayout>
  <main class="blog-content">
    <slot />
  </main>
</BaseLayout>
```
```astro
---
// layouts/BaseLayout.astro
import { Head, Metadata } from "@mannisto/astro-metadata"

const meta = Metadata.resolve({
  title: "My Blog",
  titleTemplate: "%s | My Blog",
  description: "Thoughts and tutorials",
})
---

<html lang="en">
  <Head {...meta} />
  <body>
    <slot />
  </body>
</html>
```

## When to use

- Sites with deeply nested layouts
- When you want metadata co-located with page content
- When prop drilling becomes unwieldy