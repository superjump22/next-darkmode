import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  sourcemap: false,
  minify: true,
  dts: true,
  clean: true,
  external: ['react'],
  format: ['esm', 'cjs'],
  splitting: false,
  bundle: true,
})
