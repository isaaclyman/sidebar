module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/strongly-recommended',
    'eslint:recommended'
  ],
  rules: {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'quotes': ['error', 'single', {'allowTemplateLiterals': true}],
    'semi': [2, 'never']
  },
  globals: {
    'test': 'readonly',
    'jest': 'readonly',
    'beforeAll': 'readonly',
    'beforeEach': 'readonly',
    'afterAll': 'readonly',
    'afterEach': 'readonly',
    'expect': 'readonly'
  },
  parserOptions: {
    parser: 'babel-eslint',
  }
}
