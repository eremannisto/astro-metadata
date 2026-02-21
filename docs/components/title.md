# Title

Renders the `<title>` tag. The template must contain `%s` — TypeScript enforces this at the type level.

## Import
```astro
---
import { Title } from "@mannisto/astro-metadata"
---
```

## Usage
```astro
<Title value="My Page" />
<!-- Output: <title>My Page</title> -->

<Title value="My Page" template="%s | My Site" />
<!-- Output: <title>My Page | My Site</title> -->

<!-- With Head -->
<Head title="My Page" titleTemplate="%s | My Site" />
```

## Props

| Prop       | Type                         | Description                         |
| ---------- | ---------------------------- | ----------------------------------- |
| `value`    | `string`                     | Page title. Required.               |
| `template` | `` `${string}%s${string}` `` | Template string. Must contain `%s`. |