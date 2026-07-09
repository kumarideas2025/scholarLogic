import js from '@eslint/js';

/**
 * ESLint Flat Config
 *
 * Enforces modern ES2022 + Node best practices with a pragmatic rule set.
 * Relaxed where it conflicts with intentional patterns (e.g. console usage in
 * the logger module).
 */

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        setTimeout: 'readonly',
        Date: 'readonly',
        Math: 'readonly',
        JSON: 'readonly',
        Promise: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-duplicate-imports': 'error',
    },
  },
  {
    ignores: ['node_modules/**', 'dist/**', 'coverage/**', 'src/tests/setup.js'],
  },
];