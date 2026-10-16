// import type { MetadataRoute } from 'next';

// import { routing } from '@/shared/i18n';

// import { getMainPageSitemapMeta } from '@/entities/main-page/queries/getMainPageSitemapMeta';
// import { getPublicServiceSlugs } from '@/entities/services/queries/getPublicServices';
// import { getPublicProjectSlugs } from '@/entities/projects/queries/getPublicProjects';

// import { getSiteUrl } from '@/shared/utils';

// const isProd = process.env.VERCEL_ENV === 'production';

// const SITE_URL = getSiteUrl();

// function withLocale(locale: string, path: string): string {
//   const normalizedPath =
//     path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;

//   return `${SITE_URL}/${locale}${normalizedPath}`;
// }

// function buildAlternates(path: string): Record<string, string> {
//   const normalizedPath =
//     path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;

//   return Object.fromEntries(
//     routing.locales.map((locale) => [
//       locale,
//       `${SITE_URL}/${locale}${normalizedPath}`,
//     ]),
//   );
// }

// function createEntry(
//   locale: string,
//   path: string,
//   opts?: Partial<MetadataRoute.Sitemap[number]>,
// ): MetadataRoute.Sitemap[number] {
//   return {
//     url: withLocale(locale, path),

//     ...(opts?.lastModified
//       ? {
//           lastModified: opts.lastModified,
//         }
//       : {}),

//     changeFrequency: opts?.changeFrequency ?? 'monthly',
//     priority: opts?.priority ?? 0.7,

//     alternates: {
//       languages: buildAlternates(path),
//     },
//   };
// }

// // Public pages without a dynamic slug
// const STATIC_PATHS = [
//   '/',
//   '/projects',
//   '/services',
//   '/privacy-policy',
// ] as const;

// export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
//   // We do not publish sitemaps on dev/preview
//   if (!isProd) {
//     return [];
//   }

//   const [services, projects, homeMeta] = await Promise.all([
//     getPublicServiceSlugs(),
//     getPublicProjectSlugs(),
//     getMainPageSitemapMeta(),
//   ]);

//   const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.flatMap((path) =>
//     routing.locales.map((locale) =>
//       createEntry(locale, path, {
//         lastModified: path === '/' ? homeMeta?.updatedAt : undefined,

//         changeFrequency: path === '/' ? 'weekly' : 'monthly',

//         priority: path === '/' ? 1 : 0.7,
//       }),
//     ),
//   );

//   const serviceEntries: MetadataRoute.Sitemap = services.flatMap(
//     ({ slug, updatedAt }) =>
//       routing.locales.map((locale) =>
//         createEntry(locale, `/services/${slug}`, {
//           lastModified: updatedAt,
//           changeFrequency: 'monthly',
//           priority: 0.6,
//         }),
//       ),
//   );

//   const projectEntries: MetadataRoute.Sitemap = projects.flatMap(
//     ({ slug, updatedAt }) =>
//       routing.locales.map((locale) =>
//         createEntry(locale, `/projects/${slug}`, {
//           lastModified: updatedAt,
//           changeFrequency: 'monthly',
//           priority: 0.6,
//         }),
//       ),
//   );

//   return [...staticEntries, ...projectEntries, ...serviceEntries];
// }
