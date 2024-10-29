import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['src/index.ts', 'src/route-handler/index.ts'],
  format: ['cjs', 'esm'],
  minify: true,
  sourcemap: true,
});
