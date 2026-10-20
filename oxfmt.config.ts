import { defineConfig } from 'oxfmt'

export default defineConfig({
  tabWidth: 2,
  printWidth: 100,
  singleQuote: true,
  semi: false,
  ignorePatterns: ['lerna.json', 'docs/next-env.d.ts'],
  sortImports: {
    groups: [
      ['builtin', 'external'],
      ['internal', 'subpath'],
      ['parent', 'sibling', 'index'],
    ],
    internalPattern: ['@uplo/'],
    newlinesBetween: true,
  },
})
