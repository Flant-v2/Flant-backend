module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  'prettier/prettier': [
    'error',
    {
      arrowSpacing: ['error', { before: true, after: true }],
      singleQuote: true,
      semi: false,
      useTabs: false,
      tabWidth: 2,
      trailingComma: 'none',
      printWidth: 80,
      bracketSpacing: true,
      arrowParens: 'always',
      endOfLine: 'auto', // 이 부분이 lf로 되어있다면 auto로 변경
    },
  ],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
  },
};
