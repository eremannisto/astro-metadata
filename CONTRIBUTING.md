# Contributing

Thanks for your interest in contributing to `@mannisto/astro-metadata`!

## Getting started

Clone the repo and install dependencies:
```bash
git clone https://github.com/eremannisto/astro-metadata.git
cd astro-metadata
pnpm install
pnpm playwright install chromium
```

## Development workflow

### Running tests
```bash
pnpm test:unit   # Unit tests
pnpm test:e2e    # E2E tests
pnpm test        # All tests
```

### Linting and formatting
```bash
pnpm check    # Check for issues
pnpm format   # Auto-fix formatting
```

All PRs must pass `pnpm check` — enforced via GitHub Actions.

## Project structure
```
astro-metadata/
  src/
    assets/icons/     # The icons of the dev toolbar app
    components/       # The Metadata component (@mannisto/astro-metadata/components)
    lib/              # The Site, Favicon, Manifest, RobotsTxt and Schema namespaces, and the checks
    routes/           # The injected favicon, manifest and robots.txt endpoints
    toolbar/          # The dev toolbar app
    integration.js    # The integration (plain JavaScript, the default export)
    runtime.ts        # The namespaces (@mannisto/astro-metadata/runtime)
  scripts/            # The update script of the AI crawler list
  tests/
    e2e/
      basic/          # Tests for the basic fixture: no integration
      config/         # Tests for the config fixture: the site values and an SVG favicon
      favicon/        # Tests for the favicon fixture: a PNG source, a base and custom files
      fixtures/
    unit/
  playwright.config.ts
  vitest.config.ts
  prettier.config.mjs
```

The e2e tests run each fixture with `astro dev` and with `astro preview`. Astro 7 moves the servers into the background when it detects an agent. Set `ASTRO_DEV_BACKGROUND=0 ASTRO_PREVIEW_BACKGROUND=0` to prevent this.

### AI crawler list

`src/lib/ai-bots.json` has the AI crawler names of [ai.robots.txt](https://github.com/ai-robots-txt/ai.robots.txt). A GitHub Action updates the list each month and opens a PR. To update the list yourself, run:

```bash
pnpm bots:update
```

`src/lib/robots-txt.ts` has three short lists: the AI search crawlers, the training crawlers of the large companies, and the crawlers that `robots.txt` never blocks. Update them from the documentation of each company.

## Pull request guidelines

1. Create a feature branch from `main`
2. Make your changes
3. Run `pnpm check` and `pnpm test`
4. Submit a PR with a clear description

## Code style

- TypeScript for the source files. The integration loads some files in Node, which does not strip types in `node_modules`: these files are plain JavaScript with JSDoc, and a `.d.ts` file next to them.
- Add a check rule to `src/lib/rules.js`: `RULES` for the head of a page, `ASSET_RULES` for its files, and `SITE_RULES` for the rules that need the built pages, for example the same title on two pages.
- Follow existing patterns
- Write tests for new features
- Put new functions into the namespace of their feature