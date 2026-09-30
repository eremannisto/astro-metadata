# Checks and the dev toolbar app

The integration checks the metadata of your pages. The dev toolbar app shows the results for the current page, and the build logs the results for all pages.

## Dev toolbar app

Start `astro dev`, and click the **Metadata** icon in the Astro dev toolbar. The app shows three parts:

1. **Checks:** The problems of the current page. The icon in the toolbar shows a badge when the page has an error or a warning.
2. **Previews:** The page as a Google result, as an X card and as a Facebook or LinkedIn card, with the real image.
3. **Head:** The metadata of the page in a table: the title, the description, the canonical URL, the robots directives, the Open Graph and Twitter values, the alternates, the feeds, the manifest, the theme color and the JSON-LD types.

The social images use the production URL. When the image is not on the production site yet, the app loads it from the dev server.

## Build checks

After `astro build`, the integration checks all HTML files and logs the problems:

```
[WARN] [@mannisto/astro-metadata] /about/index.html
  - The page has no description.
  - The og:image has no width and height. The first share can show no image.
[WARN] [@mannisto/astro-metadata] 1 page has metadata problems. Set `checks: false` to hide these warnings.
```

The build checks only the prerendered pages. To hide the warnings, set `checks: false`:

```js
metadata({ checks: false })
```

## The checks

| Level   | Problem                                                          |
| ------- | ---------------------------------------------------------------- |
| Error   | The page has no title, or more than one title tag.               |
| Error   | A JSON-LD script does not contain valid JSON.                    |
| Warning | The title is longer than 60 characters.                          |
| Warning | The html tag has no `lang` attribute.                            |
| Warning | The page has no description, or the description is longer than 160 characters. |
| Warning | The page has no canonical URL, or the canonical URL is not absolute. |
| Warning | The page has no `og:image`, the URL is not absolute, or the image has no width and height. |
| Info    | The robots tag contains `noindex`.                               |

A page with `noindex` gets only the title, JSON-LD and `lang` checks. Search engines do not show the page, so the other checks are not necessary.

The build ignores the redirect pages of Astro.
