import { defineConfig } from 'oxlint'

export default defineConfig({
  categories: {
    correctness: 'error',
    perf: 'warn',
    suspicious: 'warn',
    // pedantic: 'warn',
    // nursery: 'warn',
    // restriction: 'warn',
  },
  env: {
    builtin: true,
  },
  ignorePatterns: ['**/next-env.d.ts'],
  plugins: ['typescript', 'unicorn', 'oxc', 'react', 'vitest', 'import', 'node'],
  rules: {
    curly: ['error', 'all'],
    'no-await-in-loop': 'off',
    'no-map-spread': 'off',
    'react/react-in-jsx-scope': 'off',
    'typescript/consistent-type-imports': 'error',
    'typescript/no-import-type-side-effects': 'error',
    'unicorn/prefer-node-protocol': 'error',
  },
})
