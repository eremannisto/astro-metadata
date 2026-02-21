# Description

Renders a `<meta name="description">` tag.

## Import
```astro
---
import { Description } from "@mannisto/astro-metadata"
---
```

## Usage
```astro
<Description value="Welcome to my site" />

<!-- With Head -->
<Head title="My Page" description="Welcome to my site" />

<!-- Disabled -->
<Head title="My Page" description={false} />
```

## Props

| Prop    | Type     | Description      |
| ------- | -------- | ---------------- |
| `value` | `string` | Page description |