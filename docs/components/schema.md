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

### Article
```astro
<Schema
  schema={{
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How to Build an Astro Site",
    datePublished: "2024-01-15",
    author: {
      "@type": "Person",
      name: "Ere Männistö",
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

<!-- Disabled -->
<Head title="My Page" schema={false} />
```

### With Metadata API
```astro
---
import { Metadata } from "@mannisto/astro-metadata"

Metadata.set({
  title: "How to Build an Astro Site",
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

## Props

| Prop     | Type                      | Description    |
| -------- | ------------------------- | -------------- |
| `schema` | `Record<string, unknown>` | JSON-LD object |