
#!/bin/bash
set -e

echo "Installing root dependencies..."
pnpm install

echo "Installing fixture dependencies..."
cd tests/e2e/fixtures
pnpm add @mannisto/astro-metadata@file:../../..
cd ../../..

echo "Installing Playwright browsers..."
pnpm playwright install chromium

echo "Done! Run 'pnpm test:all' to run all tests."