# Migration from 1.x

Version 2.0 has breaking changes. This guide shows each change with a diff.

## Requirements

- Astro 6.4.6 or later, or Astro 7.
- Set `site` in `astro.config.mjs`. The package uses it to make absolute URLs.

## The `Metadata` store is removed

The store could leak values between pages and requests. Give the values to `Head` as props. For values that are the same on all pages, use `src/metadata.config.ts`.

```diff
  ---
  // src/pages/about.astro
- import { Metadata } from "@mannisto/astro-metadata"
-
- Metadata.set({
-   title: "About",
-   description: "Learn more about us",
- })
+ import Layout from "../layouts/Layout.astro"
  ---
+
+ <Layout title="About" description="Learn more about us">
+   ...
+ </Layout>
```

```diff
  ---
  // src/layouts/Layout.astro
- import { Head, Metadata } from "@mannisto/astro-metadata"
-
- const meta = Metadata.resolve({
-   title: "My Site",
-   titleTemplate: "%s | My Site",
- })
+ import { Head, type HeadProps } from "@mannisto/astro-metadata"
+
+ type Props = HeadProps
  ---

  <html>
-   <Head {...meta} />
+   <Head titleTemplate="%s | My Site" {...Astro.props} />
```

## `Favicon` is now `Icons`

The `manifest` prop moved to `Head`. For a layout without `Head`, write the manifest link tag yourself.

```diff
- import { Favicon } from "@mannisto/astro-metadata"
+ import { Icons } from "@mannisto/astro-metadata"

- <Favicon icons={[{ path: "/favicon.ico" }]} manifest="/site.webmanifest" />
+ <Icons icons={[{ path: "/favicon.ico" }]} />
+ <link rel="manifest" href="/site.webmanifest" />
```

```diff
  <Head
    title="Home"
-   favicon={{
-     icons: [{ path: "/favicon.ico" }],
-     manifest: "/site.webmanifest",
-   }}
+   icons={{ icons: [{ path: "/favicon.ico" }] }}
+   manifest="/site.webmanifest"
  />
```

The type `FaviconFile` is now `IconFile`. You can also let the integration generate the icons. See [Favicons](favicons.md).

## `LanguageAlternates` is now `Alternates`

```diff
- import { LanguageAlternates } from "@mannisto/astro-metadata"
+ import { Alternates } from "@mannisto/astro-metadata"

- <LanguageAlternates alternates={languages} />
+ <Alternates languages={languages} />

- <Head title="Home" languageAlternates={languages} />
+ <Head title="Home" languages={languages} />
```

## `Schema` takes the data directly

```diff
- <Schema schema={{ "@context": "https://schema.org", "@type": "WebSite", name: "My Site" }} />
+ <Schema data={{ "@context": "https://schema.org", "@type": "WebSite", name: "My Site" }} />
```

The `schema` prop of `Head` takes the data directly. It also accepts a list:

```diff
- <Head title="Home" schema={{ schema: data }} />
+ <Head title="Home" schema={data} />
```

The new `schema` builders fill in the site name and the URLs for you. See [Schema](../components/schema.md).

## `Keywords` is removed

Search engines do not use the keywords meta tag. Remove the component and the `keywords` prop:

```diff
- <Keywords value={["astro", "seo"]} />
- <Head title="Home" keywords={["astro", "seo"]} />
+ <Head title="Home" />
```

## `twitter:url` is removed

X does not read `twitter:url`. Remove the `url` prop of `Twitter`.

## Other changes

- **Title:** The `title` prop of `Head` is optional. Without a title, `Head` uses `siteName` from the config. A template without `%s` gives the title unchanged.
- **Canonical URL:** `Head` renders a canonical tag on all pages. Without a `canonical` prop, the value is the absolute URL of the current page, without the query string. Before, `Head` rendered the tag only with the prop. Set `canonical={false}` to remove it.
- **Absolute URLs:** `og:image`, `twitter:image`, `og:url` and the `hreflang` links are absolute URLs. Before, a path such as `/og.jpg` stayed a path.
- **Base:** The icon and feed paths get the Astro `base`.
