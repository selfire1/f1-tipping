import { createConfigForNuxt } from '@nuxt/eslint-config'

export default createConfigForNuxt({
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
  extends: ['@nuxt/eslint-config'],
  plugins: [],
  rules: {},
})
