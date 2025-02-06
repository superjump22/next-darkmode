import antfu from '@antfu/eslint-config'

export default antfu({
  lessOpinionated: true,
  react: true,
  vue: false,
  stylistic: true,
  typescript: true,
  formatters: true,
  ignores: [
    '**README.md',
  ],
})
