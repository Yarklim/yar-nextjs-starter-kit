import type { Metadata, ResolvingMetadata } from 'next';

const nn = <T>(v: T | null | undefined): T | undefined =>
  v === null ? undefined : v;

// Current Twitter cards
export type TwitterCard = 'summary' | 'summary_large_image' | 'player' | 'app';

// I’m keeping it as a string for the universal builder.
export type OpenGraphType = string;

// I’m pulling image types directly from the metadata.
export type OgImages = NonNullable<Metadata['openGraph']>['images'];
export type TwitterImages = NonNullable<Metadata['twitter']>['images'];

export type MetaInput = {
  title: string;
  description?: string;
  pathname: string; // "/uk/...."

  openGraph?: {
    type?: OpenGraphType;
    images?: OgImages;
    publishedTime?: string;
    modifiedTime?: string;
    authors?: string[];
    section?: string;
  };

  twitter?: {
    card?: TwitterCard;
    images?: TwitterImages;
  };
};

export async function resolveParent(parent: ResolvingMetadata) {
  return await parent;
}

export function buildOpenGraph(
  base: Awaited<ResolvingMetadata>,
  input: MetaInput,
): Metadata['openGraph'] {
  const baseOG = (base.openGraph ?? {}) as Record<string, unknown>;

  return {
    ...baseOG,
    title: input.title,
    description:
      input.description ?? (baseOG.description as string | undefined),
    url: input.pathname,

    ...(input.openGraph?.type ? { type: input.openGraph.type } : null),
    ...(input.openGraph?.images ? { images: input.openGraph.images } : null),
    ...(input.openGraph?.publishedTime
      ? { publishedTime: input.openGraph.publishedTime }
      : null),
    ...(input.openGraph?.modifiedTime
      ? { modifiedTime: input.openGraph.modifiedTime }
      : null),
    ...(input.openGraph?.authors?.length
      ? { authors: input.openGraph.authors }
      : null),
    ...(input.openGraph?.section ? { section: input.openGraph.section } : null),
  } as Metadata['openGraph'];
}

export function buildTwitter(
  base: Awaited<ResolvingMetadata>,
  input: MetaInput,
): Metadata['twitter'] {
  const t = (base.twitter ?? {}) as Record<string, unknown>;

  return {
    ...t,

    card:
      input.twitter?.card ??
      (t.card as TwitterCard | undefined) ??
      'summary_large_image',

    title: input.title,
    description: input.description ?? undefined,
    images: input.twitter?.images ?? (t.images as TwitterImages | undefined),

    site: nn(t.site as string | null | undefined),
    siteId: nn(t.siteId as string | null | undefined),
    creator: nn(t.creator as string | null | undefined),
    creatorId: nn(t.creatorId as string | null | undefined),
  } as Metadata['twitter'];
}
