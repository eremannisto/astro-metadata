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
    components/     # The Astro components
    lib/            # The config, URL, favicon, manifest, schema and check functions
    routes/         # The injected favicon and manifest endpoints
    toolbar/        # The dev toolbar app
    integration.js  # The Astro integration (plain JavaScript)
  tests/
    e2e/
      components/   # Tests for the basic fixture
      config/       # Tests for the config fixture
      favicon/      # Tests for the favicon fixture
      fixtures/
    unit/
  index.ts
  playwright.config.ts
  vitest.config.ts
  prettier.config.mjs
```

The e2e tests run each fixture with `astro dev` and with `astro preview`. Astro 7 moves the servers into the background when it detects an agent. Set `ASTRO_DEV_BACKGROUND=0 ASTRO_PREVIEW_BACKGROUND=0` to prevent this.

## Pull request guidelines

1. Create a feature branch from `main`
2. Make your changes
3. Run `pnpm check` and `pnpm test`
4. Submit a PR with a clear description

## Code style

- TypeScript for all source files
- Follow existing patterns
- Write tests for new features
- Keep components focused and composable