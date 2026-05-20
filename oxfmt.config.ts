import { defineConfig } from 'oxfmt'

export default defineConfig({
  tabWidth: 2,
  printWidth: 100,
  singleQuote: true,
  semi: false,
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
