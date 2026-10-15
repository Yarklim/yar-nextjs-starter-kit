import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

/**
 * Feature-Sliced Design layer hierarchy used by this project:
 *
 * app
 * ↓
 * views (canonical FSD `pages`)
 * ↓
 * widgets
 * ↓
 * features
 * ↓
 * entities
 * ↓
 * shared
 *
 * `views` is the project-specific equivalent of the canonical FSD `pages`
 * layer. The name avoids confusion with the legacy Next.js Pages Router.
 *
 * Import rules:
 * - A layer may depend only on layers below it.
 * - Slices on the same layer must not depend on each other.
 * - Cross-slice imports must use the slice public API.
 * - Internal imports inside the same slice should use relative paths.
 * - Shared segments expose their public API from the segment root.
 */

const tsFiles = ['**/*.{ts,tsx}'];

/**
 * Return import patterns that completely forbid access to the specified
 * layers through project aliases.
 *
 * Both alias styles are covered:
 * - @/features/...
 * - @features/...
 *
 * The second form is kept to prevent bypassing FSD boundaries if legacy
 * aliases are still configured in tsconfig.
 */
const forbidLayers = (layers) =>
  layers.flatMap((layer) => [`@/${layer}/**`, `@${layer}/**`]);

/**
 * Enforce public APIs for FSD slices and Shared segments.
 *
 * Sliced layers:
 *   Allowed:
 *     @/features/auth
 *     @/entities/user
 *
 *   Forbidden:
 *     @/features/auth/ui/LoginForm
 *     @/entities/user/model/user
 *
 * Shared:
 *   Most segments expose their public API from the segment root:
 *     @/shared/i18n
 *     @/shared/router
 *
 *   Shared UI is intentionally more granular so every UI component can
 *   expose its own public API without creating one large shared/ui barrel:
 *     @/shared/ui/button
 *     @/shared/ui/dialog
 *
 *   Implementation details remain private:
 *     @/shared/i18n/routing
 *     @/shared/router/navigation
 *     @/shared/ui/button/Button
 *     @/shared/ui/dialog/DialogContent
 */
const forbidDeepImports = (layers) =>
  layers.flatMap((layer) => {
    if (layer !== 'shared') {
      return [`@/${layer}/*/**`, `@${layer}/*/**`];
    }

    return [
      // Restrict deep imports into all Shared segments.
      '@/shared/*/**',

      // Re-allow component-level public APIs inside shared/ui.
      '!@/shared/ui',
      '!@/shared/ui/*',

      // But keep implementation details of UI components private.
      '@/shared/ui/*/**',

      // Same rules for the legacy alias form.
      '@shared/*/**',
      '!@shared/ui',
      '!@shared/ui/*',
      '@shared/ui/*/**',
    ];
  });

/**
 * Creates an ESLint no-restricted-imports rule for an FSD layer.
 */
const fsdImports = ({ forbidden = [], publicApiOnly = [] }) => [
  'error',
  {
    patterns: [
      {
        group: [
          ...forbidLayers(forbidden),
          ...forbidDeepImports(publicApiOnly),
        ],
        message:
          'Import through the public API and respect Feature-Sliced Design layer boundaries.',
      },
    ],
  },
];

export default defineConfig([
  /**
   * Next.js recommended rules:
   * - React
   * - React Hooks
   * - Core Web Vitals
   */
  ...nextVitals,

  /**
   * TypeScript rules provided by eslint-config-next.
   */
  ...nextTs,

  /**
   * Global project rules.
   */
  {
    linterOptions: {
      /**
       * Fail when eslint-disable comments are no longer necessary.
       */
      reportUnusedDisableDirectives: 'error',
    },

    rules: {
      /**
       * Prevent duplicate imports while allowing separate type-only imports.
       */
      'no-duplicate-imports': [
        'error',
        {
          allowSeparateTypeImports: true,
        },
      ],

      /**
       * Prevent unused variables in JavaScript files.
       *
       * Prefix intentionally unused variables/parameters with `_`.
       *
       * Example:
       *   const _unused = value;
       *   function handler(_request) {}
       */
      'no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'all',
          caughtErrors: 'all',
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      /**
       * Require strict equality comparisons.
       */
      eqeqeq: ['error', 'always'],

      /**
       * Always require braces around control-flow bodies.
       */
      curly: ['error', 'all'],

      /**
       * Disallow var.
       */
      'no-var': 'error',

      /**
       * Prefer const when a variable is never reassigned.
       */
      'prefer-const': 'error',
    },
  },

  /**
   * TypeScript-specific rules.
   */
  {
    files: tsFiles,

    rules: {
      /**
       * Disable the base rule because it does not understand TypeScript
       * semantics correctly.
       */
      'no-unused-vars': 'off',

      /**
       * Treat unused TypeScript variables, parameters and imports as errors.
       *
       * Imported bindings are variables as far as this rule is concerned,
       * therefore unused imports are reported as errors as well.
       *
       * Prefix an intentionally unused binding with `_`.
       */
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'all',
          caughtErrors: 'all',
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      /**
       * Keep type-only dependencies explicit.
       */
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],
    },
  },

  /**
   * --------------------------------------------------------------------------
   * FSD: App
   * --------------------------------------------------------------------------
   *
   * `app` is the highest layer.
   *
   * It may use all lower layers, but imports from sliced layers must go
   * through their public APIs.
   */
  {
    files: ['src/app/**/*.{ts,tsx}'],

    rules: {
      'no-restricted-imports': fsdImports({
        publicApiOnly: ['views', 'widgets', 'features', 'entities', 'shared'],
      }),
    },
  },

  /**
   * --------------------------------------------------------------------------
   * FSD: Views
   * --------------------------------------------------------------------------
   *
   * `views` is this project's equivalent of the canonical FSD `pages` layer.
   *
   * A view may depend on:
   * - widgets
   * - features
   * - entities
   * - shared
   *
   * It must not depend on:
   * - app
   * - another view slice
   */
  {
    files: ['src/views/**/*.{ts,tsx}'],

    rules: {
      'no-restricted-imports': fsdImports({
        forbidden: ['app', 'views'],
        publicApiOnly: ['widgets', 'features', 'entities', 'shared'],
      }),
    },
  },

  /**
   * --------------------------------------------------------------------------
   * FSD: Widgets
   * --------------------------------------------------------------------------
   *
   * A widget may depend on:
   * - features
   * - entities
   * - shared
   *
   * It must not depend on:
   * - app
   * - views
   * - another widget slice
   */
  {
    files: ['src/widgets/**/*.{ts,tsx}'],

    rules: {
      'no-restricted-imports': fsdImports({
        forbidden: ['app', 'views', 'widgets'],
        publicApiOnly: ['features', 'entities', 'shared'],
      }),
    },
  },

  /**
   * --------------------------------------------------------------------------
   * FSD: Features
   * --------------------------------------------------------------------------
   *
   * A feature may depend on:
   * - entities
   * - shared
   *
   * It must not depend on:
   * - app
   * - views
   * - widgets
   * - another feature slice
   */
  {
    files: ['src/features/**/*.{ts,tsx}'],

    rules: {
      'no-restricted-imports': fsdImports({
        forbidden: ['app', 'views', 'widgets', 'features'],
        publicApiOnly: ['entities', 'shared'],
      }),
    },
  },

  /**
   * --------------------------------------------------------------------------
   * FSD: Entities
   * --------------------------------------------------------------------------
   *
   * An entity may depend only on Shared.
   *
   * It must not depend on:
   * - app
   * - views
   * - widgets
   * - features
   * - another entity slice
   */
  {
    files: ['src/entities/**/*.{ts,tsx}'],

    rules: {
      'no-restricted-imports': fsdImports({
        forbidden: ['app', 'views', 'widgets', 'features', 'entities'],
        publicApiOnly: ['shared'],
      }),
    },
  },

  /**
   * --------------------------------------------------------------------------
   * FSD: Shared
   * --------------------------------------------------------------------------
   *
   * Shared is the lowest layer and must never depend on higher layers.
   *
   * Unlike sliced layers, Shared is organized into segments such as:
   * - ui
   * - api
   * - lib
   * - config
   *
   * Shared segments may depend on other Shared code when justified.
   */
  {
    files: ['src/shared/**/*.{ts,tsx}'],

    rules: {
      'no-restricted-imports': fsdImports({
        forbidden: ['app', 'views', 'widgets', 'features', 'entities'],
      }),
    },
  },

  /**
   * --------------------------------------------------------------------------
   * Explicit client modules
   * --------------------------------------------------------------------------
   *
   * These rules apply only when the project uses the `.client.ts` or
   * `.client.tsx` naming convention.
   *
   * Note:
   * Next.js itself determines the client boundary from the "use client"
   * directive, not from the filename.
   */
  {
    files: ['src/**/*.client.{ts,tsx}'],

    rules: {
      /**
       * Do not add another no-restricted-imports rule here.
       *
       * Flat config rules with the same key override each other instead of
       * merging their option arrays. Adding one here would therefore risk
       * overriding the FSD no-restricted-imports rule for matching files.
       *
       * Server-only modules should instead protect themselves with the
       * `server-only` package where appropriate.
       */
    },
  },

  /**
   * --------------------------------------------------------------------------
   * Explicit server modules
   * --------------------------------------------------------------------------
   *
   * Protect explicitly named server modules from accidental browser-global
   * usage.
   */
  {
    files: ['src/**/*.server.{ts,tsx}'],

    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'window',
          message: '`window` is not available in server-only modules.',
        },
        {
          name: 'document',
          message: '`document` is not available in server-only modules.',
        },
        {
          name: 'navigator',
          message: '`navigator` is not available in server-only modules.',
        },
        {
          name: 'localStorage',
          message: '`localStorage` is not available in server-only modules.',
        },
        {
          name: 'sessionStorage',
          message: '`sessionStorage` is not available in server-only modules.',
        },
      ],
    },
  },

  /**
   * Files and directories that ESLint should never inspect.
   */
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'dist/**',
    'coverage/**',

    // Test artifacts
    'playwright-report/**',
    'test-results/**',

    'next-env.d.ts',

    /**
     * Codex-generated working data.
     */
    '.codex/admin/runs/**',
    '.codex/admin/history/**',
  ]),
]);
