import type { Metadata } from 'next';

const isProd = process.env.NODE_ENV === 'production';

export function getRobotsMetadata(): Metadata['robots'] {
  return isProd
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-snippet': -1,
          'max-image-preview': 'large',
          'max-video-preview': -1,
        },
      }
    : {
        index: false,
        follow: false,
        googleBot: {
          index: false,
          follow: false,
          noimageindex: true,
        },
      };
}
