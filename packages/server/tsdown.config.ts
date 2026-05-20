import { defineConfig } from 'tsdown'

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['src/index.ts', 'src/route-handler/index.ts'],
  format: ['cjs', 'esm'],
  sourcemap: true,
})
