# Title

Renders the `<title>` tag. The component replaces `%s` in the template with the title.

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

A template without `%s` gives the title unchanged.

## Props

| Prop       | Type     | Description                                 |
| ---------- | -------- | ------------------------------------------- |
| `value`    | `string` | The page title. Required.                   |
| `template` | `string` | The title template, e.g. `"%s \| My Site"`  |
