import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const isProd: boolean = process.env.NODE_ENV === 'production';
const imageStorageUrl: string | undefined = process.env.IMAGE_STORAGE_URL;
const imageStorageHost: string | undefined = process.env.IMAGE_STORAGE_HOST;
const imageStoragePath: string | undefined = process.env.IMAGE_STORAGE_PATH;
const isPermissionCamera: boolean = process.env.PERMISSION_CAMERA !== 'false';
const isPermissionMicrophone: boolean =
  process.env.PERMISSION_MICROPHONE !== 'false';
const isPermissionGeolocation: boolean =
  process.env.PERMISSION_GEOLOCATION !== 'false';
const isPermissionPayment: boolean = process.env.PERMISSION_PAYMENT !== 'false';
const isPermissionUsb: boolean = process.env.PERMISSION_USB !== 'false';
const isPermissionInterest: boolean =
  process.env.PERMISSION_INTEREST !== 'false';

const styleSrc = "style-src 'self' 'unsafe-inline'";

const scriptSrc = isProd
  ? styleSrc
  : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

const scriptImage = imageStorageUrl
  ? `img-src 'self' ${imageStorageUrl} data: blob:`
  : '';

// CSP v0: fairly strict, but without breaking things.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  // Scripts/styles
  scriptSrc,
  styleSrc,
  // Images: allow 'self' + cloud image storage + data: (required for inline/placeholder/icons)
  scriptImage,
  // Fonts: if they are local-only, I leave them as `self`.
  "font-src 'self' data:",
  // XHR/fetch: if forms are submitted to the same domain/API, `self` is sufficient.
  "connect-src 'self'",
  // next/image with optimization via Vercel
  "media-src 'self'",
  ...(isProd ? ['upgrade-insecure-requests'] : []),
].join('; ');

const securityHeaders: { key: string; value: string }[] = [
  // Basic
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // It is recommended to enable this, even if authorization is not required.
  { key: 'X-Frame-Options', value: 'DENY' }, // duplicates frame-ancestors, but is useful for older UAs
  // Permissions-Policy: disabling everything unnecessary
  {
    key: 'Permissions-Policy',
    value: `${isPermissionCamera && 'camera=()'}, ${isPermissionMicrophone && 'microphone=()'}, ${isPermissionGeolocation && 'geolocation=()'}, ${isPermissionPayment && 'payment=()'}, ${isPermissionUsb && 'usb=()'}, ${isPermissionInterest && 'interest-cohort=()'}`,
  },
  // Cross-origin policies – soft launch (non-breaking)
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },

  // HSTS: I enable it only in production
  // (If there are subdomains that are NOT on HTTPS, do NOT set includeSubDomains/preload)
  ...(isProd
    ? [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000',
        },
      ]
    : []),

  { key: 'Content-Security-Policy', value: csp },
];

const nextConfig: NextConfig = {
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

  // Disabling streaming metadata
  // so that metadata is always rendered in the <head> and cannot end up in the <body>.
  htmlLimitedBots: /.*/,

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
            // Saved URLs contain ?_a=…; we do not restrict search so that they continue to work.
          },
        ],
        deviceSizes: [320, 560, 768, 1280, 1440],
        imageSizes: [64, 96, 128, 256, 384, 500, 700],
        formats: ['image/webp', 'image/avif'],
        minimumCacheTTL: 60 * 60 * 24 * 31,
        contentDispositionType: 'inline',
      },
    }),
};

const withNextIntl = createNextIntlPlugin('./src/shared/lib/i18n/request.ts');
export default withNextIntl(nextConfig);
