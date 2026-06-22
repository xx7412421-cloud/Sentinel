module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    // Include root and application-level tsconfigs so ESLint can run type-aware rules
    project: ['tsconfig.json', 'apps/dashboard/tsconfig.json', 'apps/web/tsconfig.json'],
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  root: true,
  env: { node: true },
  // Exclude build artifacts and the dashboard runtime files
  ignorePatterns: ['.eslintrc.js', 'dist/**', 'apps/dashboard/**'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
  overrides: [
    {
      // Files that are intentionally outside any tsconfig — lint without type-aware rules
      files: ['observability/**/*.ts', 'prisma/**/*.ts', 'env.d.ts'],
      parserOptions: {
        project: null,
      },
      rules: {
        '@typescript-eslint/no-require-imports': 'off',
      },
    },
  ],
};
