# Contributing

Thanks for your interest in contributing to `@mannisto/astro-metadata`!

## Getting started

Clone the repo and run the init script to install dependencies, link the local package to the fixture project, and set up Playwright:

```bash
git clone https://github.com/mannisto/astro-metadata.git
cd astro-metadata
pnpm run init
```

## Development workflow

### Running tests

```bash
# Unit tests
pnpm test:unit

# E2E tests
pnpm test:e2e

# All tests
pnpm test:all
```

### Linting and formatting

```bash
# Check for issues
pnpm check

# Auto-fix formatting
pnpm format
```

All PRs must pass `pnpm check` — this is enforced via GitHub Actions.

## Project structure

```
astro-metadata/
  src/
    components/       # Astro components (Title, Description, etc.)
    lib/              # Utilities (Metadata class, helpers)
  tests/
    e2e/
      components/     # E2E tests for each component
      fixtures/       # Astro test fixtures
    unit/
      metadata.test.ts
  scripts/
    init.sh           # Setup script
  index.ts            # Package exports
  playwright.config.ts
  vitest.config.ts
  biome.json
  prettier.config.mjs
```

## Pull request guidelines

1. Create a feature branch from `main`
2. Make your changes
3. Run `pnpm check` and `pnpm test:all` to ensure everything passes
4. Submit a PR with a clear description of the changes

## Code style

- Use TypeScript for all source files
- Follow the existing code patterns
- Write tests for new features
- Keep components focused and composable
