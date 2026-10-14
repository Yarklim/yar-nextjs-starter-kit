import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

const imageStorageUrl = process.env.IMAGE_STORAGE_URL;
const imageStorageHost = process.env.IMAGE_STORAGE_HOST;
const imageStoragePath = process.env.IMAGE_STORAGE_PATH;

const permissionsPolicy = [
  `camera=${process.env.PERMISSION_CAMERA === 'true' ? '(self)' : '()'}`,
  `microphone=${process.env.PERMISSION_MICROPHONE === 'true' ? '(self)' : '()'}`,
  `geolocation=${process.env.PERMISSION_GEOLOCATION === 'true' ? '(self)' : '()'}`,
  `payment=${process.env.PERMISSION_PAYMENT === 'true' ? '(self)' : '()'}`,
  `usb=${process.env.PERMISSION_USB === 'true' ? '(self)' : '()'}`,
].join(', ');

const imageStorageOrigin =
  imageStorageUrl !== undefined ? new URL(imageStorageUrl).origin : undefined;

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",

  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",

  `img-src 'self' data: blob:${imageStorageOrigin ? ` ${imageStorageOrigin}` : ''}`,
  "font-src 'self'",
  "connect-src 'self'",
  "media-src 'self'",

  ...(isProd ? ['upgrade-insecure-requests'] : []),
].join('; ');

const securityHeaders: Array<{ key: string; value: string }> = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Permissions-Policy',
    value: permissionsPolicy,
  },

  ...(isProd
    ? [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000',
        },
      ]
    : []),

  {
    key: 'Content-Security-Policy',
    value: csp,
  },
];

const nextConfig = {
  poweredByHeader: false,

  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,

  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },

  ...(imageStorageUrl &&
    imageStorageHost &&
    imageStoragePath && {
      images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: imageStorageHost,
            port: '',
            pathname: imageStoragePath,
          },
        ],

        // Remote image storage should normally return the image directly.
        // Redirect destinations are not revalidated against remotePatterns.
        maximumRedirects: 0,
      },
    }),
} satisfies NextConfig;

const withNextIntl = createNextIntlPlugin('./src/shared/lib/i18n/request.ts');

export default withNextIntl(nextConfig);
