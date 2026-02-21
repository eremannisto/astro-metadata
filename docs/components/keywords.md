# Keywords

Renders a `<meta name="keywords">` tag.

## Import
```astro
---
import { Keywords } from "@mannisto/astro-metadata"
---
```

## Usage
```astro
<Keywords value={["astro", "seo", "metadata"]} />

<!-- With Head -->
<Head title="My Page" keywords={["astro", "seo", "metadata"]} />

<!-- Disabled -->
<Head title="My Page" keywords={false} />
```

## Props

| Prop    | Type       | Description      |
| ------- | ---------- | ---------------- |
| `value` | `string[]` | List of keywords |