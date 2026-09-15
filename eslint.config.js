import eslint from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import prettier from 'eslint-plugin-prettier'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'dist-worker/**',
      'node_modules/**',
      '.wrangler/**',
      'drizzle/**',
      'scripts/**',
      'data/**',
      'public/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    plugins: {
      prettier,
    },
    rules: {
      'prettier/prettier': 'warn',
      // TypeScript already checks undefined identifiers; no-undef fights browser/worker globals.
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
)
