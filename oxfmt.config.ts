import { defineConfig } from 'oxfmt';

export default defineConfig({
  tabWidth: 2,
  printWidth: 80,
  singleQuote: true,
  jsxSingleQuote: false,
  arrowParens: 'always',
  trailingComma: 'es5',
  sortImports: {
    groups: [
      ['builtin', 'external'],
      ['internal', 'subpath'],
      ['parent', 'sibling', 'index'],
    ],
    newlinesBetween: true,
  },
});
