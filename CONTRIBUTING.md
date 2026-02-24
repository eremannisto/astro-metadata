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
pnpm test:all    # All tests
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
    components
    lib/
  tests/
    e2e/
      components/
      fixtures/
    unit/
      metadata.test.ts
  scripts/
    init.sh
  index.ts
  playwright.config.ts
  vitest.config.ts
  biome.json
  prettier.config.mjs
```

## Pull request guidelines

1. Create a feature branch from `main`
2. Make your changes
3. Run `pnpm check` and `pnpm test:all`
4. Submit a PR with a clear description

## Code style

- TypeScript for all source files
- Follow existing patterns
- Write tests for new features
- Keep components focused and composable