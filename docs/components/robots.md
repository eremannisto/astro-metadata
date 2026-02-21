# Robots

Controls how search engines crawl and index your page. Defaults to `index, follow`.

## Import
```astro
---
import { Robots } from "@mannisto/astro-metadata"
---
```

## Usage
```astro
<!-- Defaults: index, follow -->
<Robots />

<!-- Prevent indexing -->
<Robots index={false} />

<!-- Prevent following links -->
<Robots follow={false} />

<!-- Prevent caching -->
<Robots archive={false} />

<!-- Extra directives -->
<Robots extra="max-snippet:-1, max-image-preview:large" />

<!-- With Head -->
<Head title="My Page" robots={{ index: false }} />

<!-- Disabled (removes tag entirely) -->
<Head title="My Page" robots={false} />
```

## Props

| Prop      | Type      | Default | Description                                              |
| --------- | --------- | ------- | -------------------------------------------------------- |
| `index`   | `boolean` | `true`  | Allow indexing                                           |
| `follow`  | `boolean` | `true`  | Allow following links                                    |
| `archive` | `boolean` | `true`  | Allow search engines to cache the page                   |
| `snippet` | `boolean` | `true`  | Allow text snippets in search results                    |
| `extra`   | `string`  | —       | Additional directives, e.g. `"max-image-preview:large"`  |