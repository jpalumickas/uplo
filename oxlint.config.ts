import { defineConfig } from 'oxlint'

export default defineConfig({
  plugins: ['typescript', 'unicorn', 'oxc', 'react', 'vitest'],
  categories: {
    correctness: 'error',
  },
  rules: {
    curly: ['error', 'all'],
    'typescript/consistent-type-imports': 'error',
    'typescript/no-import-type-side-effects': 'error',
    'unicorn/prefer-node-protocol': 'error',
  },
  env: {
    builtin: true,
  },
})
