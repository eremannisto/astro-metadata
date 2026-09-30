# Schema

Renders a `<script type="application/ld+json">` tag with structured data. Search engines use structured data to understand your content, and to show rich results.

## Import

```astro
---
import { Schema, schema } from "@mannisto/astro-metadata"
---
```

## Builders

The `schema` builders make the most common types. They fill in the site name from `src/metadata.config.ts`, and they make all URLs absolute.

```astro
---
import { Head, schema } from "@mannisto/astro-metadata"

const locale = Astro.currentLocale
---

<Head
  title="Home"
  schema={[
    schema.website({ locale }),
    schema.organization({ logo: "/logo.png", sameAs: ["https://x.com/mysite"], locale }),
  ]}
/>
```

### `schema.website()`

```ts
schema.website()
// {
//   "@context": "https://schema.org",
//   "@type": "WebSite",
//   "name": "My Site",                     // siteName in the config
//   "description": "The default description",
//   "url": "https://example.com/"
// }
```

| Option        | Type     | Default                     |
| ------------- | -------- | --------------------------- |
| `name`        | `string` | `siteName` in the config    |
| `description` | `string` | `description` in the config |
| `url`         | `string` | The site root               |
| `locale`      | `string` | —                           |

### `schema.organization()`

| Option   | Type       | Default                  |
| -------- | ---------- | ------------------------ |
| `name`   | `string`   | `siteName` in the config |
| `url`    | `string`   | The site root            |
| `logo`   | `string`   | —                        |
| `sameAs` | `string[]` | —                        |
| `locale` | `string`   | —                        |

### `schema.article()`

```astro
---
const { post } = Astro.props

const article = schema.article({
  type: "BlogPosting",
  title: post.title,
  description: post.description,
  image: post.image,
  published: post.date,
  author: { name: "Ere Männistö", url: "/about" },
  url: Astro.url.pathname,
})
---

<Head title={post.title} schema={article} />
```

The publisher is the site, with `siteName` from the config.

| Option        | Type                                        | Default     | Description                                 |
| ------------- | ------------------------------------------- | ----------- | ------------------------------------------- |
| `type`        | `"Article" \| "BlogPosting" \| "NewsArticle"` | `"Article"` | The type of the article                   |
| `title`       | `string`                                    | —           | The headline. Required.                     |
| `description` | `string`                                    | —           | The description                             |
| `image`       | `string \| string[]`                        | —           | The paths or URLs of the images             |
| `published`   | `Date \| string`                            | —           | The date of publication                     |
| `modified`    | `Date \| string`                            | —           | The date of the last change                 |
| `author`      | `SchemaAuthor \| SchemaAuthor[]`            | —           | A name, or `{ name, url }`                  |
| `url`         | `string`                                    | —           | The URL of the article page                 |
| `locale`      | `string`                                    | —           | The language of the article                 |

### `schema.breadcrumbs()`

```ts
schema.breadcrumbs([
  { name: "Home", url: "/" },
  { name: "Exhibitions", url: "/exhibitions" },
])
```

The builder numbers the items in their order.

## Your own data

Give any schema.org object to `data`. The types from [`schema-dts`](https://github.com/google/schema-dts) give your editor completion for all schema.org types:

```astro
<Schema
  data={{
    "@context": "https://schema.org",
    "@type": "Event",
    name: "Spring Exhibition",
    startDate: "2026-04-01",
  }}
/>
```

A list gives one script with a JSON array:

```astro
<Schema data={[schema.website(), schema.breadcrumbs(items)]} />
```

The component escapes the characters that can end the script tag, for example `</script>` in a value.

### With the Head component

```astro
<Head title="My Page" schema={schema.website()} />

<!-- Disabled -->
<Head title="My Page" schema={false} />
```

## Props

| Prop   | Type                         | Description         |
| ------ | ---------------------------- | ------------------- |
| `data` | `SchemaData \| SchemaData[]` | The JSON-LD data    |
