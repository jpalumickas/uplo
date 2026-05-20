import { defineConfig } from 'oxlint'

export default defineConfig({
  plugins: ['typescript', 'unicorn', 'oxc', 'react', 'vitest'],
  categories: {
    correctness: 'error',
  },
  env: {
    builtin: true,
  },
})
