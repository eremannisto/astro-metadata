# Schema

Outputs a `<script type="application/ld+json">` tag for structured data. Use it to help search engines understand your content and qualify for rich results.

## Import

```astro
---
import { Schema } from "@mannisto/astro-metadata"
---
```

## Usage

### Person

```astro
<Schema
  schema={{
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Ere Männistö",
    url: "https://example.com",
    jobTitle: "Software Engineer",
  }}
/>
<!--
  Output:
  <script type="application/ld+json">
    {"@context":"https://schema.org","@type":"Person",...}
  </script>
-->
```

### Organization

```astro
<Schema
  schema={{
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "My Company",
    url: "https://example.com",
    logo: "https://example.com/logo.png",
  }}
/>
```

### Website

```astro
<Schema
  schema={{
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "My Site",
    url: "https://example.com",
  }}
/>
```

### Article

```astro
<Schema
  schema={{
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How to Build an Astro Site",
    description: "A complete guide to building with Astro",
    datePublished: "2024-01-15",
    author: {
      "@type": "Person",
      name: "Ere Männistö",
    },
  }}
/>
```

### Product

```astro
<Schema
  schema={{
    "@context": "https://schema.org",
    "@type": "Product",
    name: "My Product",
    description: "A great product",
    offers: {
      "@type": "Offer",
      price: "29.99",
      priceCurrency: "USD",
    },
  }}
/>
```

### With Head component

```astro
<Head
  title="My Page"
  schema={{
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "My Site",
    url: "https://example.com",
  }}
/>
```

### With Metadata API

```astro
---
import { Metadata } from "@mannisto/astro-metadata"

Metadata.set({
  title: "How to Build an Astro Site",
  description: "A complete guide",
  schema: {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How to Build an Astro Site",
    datePublished: "2024-01-15",
    author: {
      "@type": "Person",
      name: "Ere Männistö",
    },
  },
})
---
```

### In a layout

```astro
---
import { Schema } from "@mannisto/astro-metadata"

interface Props {
  title: string
  description: string
}

const { title, description } = Astro.props
---

<html>
  <head>
    <Schema
      schema={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: title,
        description: description,
      }}
    />
  </head>
  <body>
    <slot />
  </body>
</html>
```

## Props

| Prop     | Type                      | Description    |
| -------- | ------------------------- | -------------- |
| `schema` | `Record<string, unknown>` | JSON-LD object |
