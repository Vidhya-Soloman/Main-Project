import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  // Ignore dist folder
  { ignores: ['dist'] },

  // Configuration for React (Frontend)
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,  // React-specific globals (browser environment)
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },

  // Configuration for Firebase Functions (Backend)
  {
    files: ['functions/**/*.js'],  // Target Firebase Functions files (backend)
    languageOptions: {
      ecmaVersion: 12,  // Support for ECMAScript 2021
      sourceType: 'module',  // Allow `import`/`export` syntax (ES6 modules)
      globals: {
        ...globals.node,  // Use Node.js globals (e.g., `require`, `module`)
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'no-console': 'warn',  // Optionally warn on console logs (for production)
      // Add any Firebase-specific rules you need here
    },
  },
];
