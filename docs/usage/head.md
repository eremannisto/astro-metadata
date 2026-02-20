# Head Component

The simplest approach — use `Head` in your layout and pass props down from pages. Charset and viewport are included automatically.

## Basic setup

Create a layout that accepts metadata props:

```astro
---
// layouts/Layout.astro
import { Head, type HeadProps } from "@mannisto/astro-metadata"

interface Props extends HeadProps {}

const { title, description, ...rest } = Astro.props
---

<html lang="en">
  <Head
    title={title}
    titleTemplate="%s | My Site"
    description={description}
    {...rest}
  />
  <body>
    <slot />
  </body>
</html>
```

Then use it in your pages:

```astro
---
// pages/index.astro
import Layout from "../layouts/Layout.astro"
---

<Layout
  title="Home"
  description="Welcome to my site"
>
  <h1>Hello</h1>
</Layout>
```

## Adding Open Graph and Twitter

Pass social sharing configuration as props:

```astro
---
// pages/about.astro
import Layout from "../layouts/Layout.astro"
---

<Layout
  title="About"
  description="Learn more about us"
  openGraph={{
    image: {
      url: "/og/about.jpg",
      alt: "About us",
      width: 1200,
      height: 630,
    },
  }}
  twitter={{
    card: "summary_large_image",
    site: "@mysite",
  }}
>
  <h1>About</h1>
</Layout>
```

## Adding favicon

Configure favicons in your layout for site-wide usage:

```astro
---
// layouts/Layout.astro
import { Head, type HeadProps } from "@mannisto/astro-metadata"

interface Props extends HeadProps {}

const { title, description, ...rest } = Astro.props
---

<html lang="en">
  <Head
    title={title}
    titleTemplate="%s | My Site"
    description={description}
    favicon={{
      icons: [
        { path: "/favicon.ico" },
        { path: "/favicon.svg" },
        { path: "/apple-touch-icon.png", size: 180, apple: true },
      ],
      manifest: "/site.webmanifest",
    }}
    {...rest}
  />
  <body>
    <slot />
  </body>
</html>
```

## Adding structured data

Pass JSON-LD schema for rich search results:

```astro
---
// pages/blog/[slug].astro
import Layout from "../../layouts/Layout.astro"

const post = await getPost(Astro.params.slug)
---

<Layout
  title={post.title}
  description={post.excerpt}
  openGraph={{
    type: "article",
    image: {
      url: post.coverImage,
      alt: post.title,
    },
  }}
  schema={{
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author.name,
    },
  }}
>
  <article>
    <h1>{post.title}</h1>
  </article>
</Layout>
```

## Using slots

Add custom elements to the head:

```astro
<Layout title="Home" description="Welcome">
  <!-- Add to layout's Head component -->
</Layout>
```

In your layout, expose slots:

```astro
---
// layouts/Layout.astro
import { Head, type HeadProps } from "@mannisto/astro-metadata"

interface Props extends HeadProps {}

const { title, description, ...rest } = Astro.props
---

<html lang="en">
  <Head title={title} description={description} {...rest}>
    <slot name="head" />
  </Head>
  <body>
    <slot />
  </body>
</html>
```

Then use it:

```astro
<Layout title="Home" description="Welcome">
  <link slot="head" rel="preconnect" href="https://fonts.googleapis.com" />
  <script slot="head" src="/analytics.js"></script>

  <h1>Hello</h1>
</Layout>
```

## When to use

- Simple sites with a single layout
- When prop drilling is acceptable
- When you want the simplest possible setup
