import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    clean: true,
    dts: true,
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    sourcemap: true,
  },
  {
    clean: false,
    dts: true,
    entry: { browser: 'src/browser/index.ts' },
    format: ['esm'],
    sourcemap: true,
  },
]);
