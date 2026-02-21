# Canonical

Renders a canonical link tag. Falls back to `Astro.url.href` when no value is provided.

## Import
```astro
---
import { Canonical } from "@mannisto/astro-metadata"
---
```

## Usage
```astro
<!-- Auto-detects current page URL -->
<Canonical />

<!-- Custom URL -->
<Canonical value="https://example.com/page" />

<!-- With Head -->
<Head title="My Page" canonical="https://example.com/page" />

<!-- Disabled -->
<Head title="My Page" canonical={false} />
```

## Props

| Prop    | Type     | Default          | Description   |
| ------- | -------- | ---------------- | ------------- |
| `value` | `string` | `Astro.url.href` | Canonical URL |