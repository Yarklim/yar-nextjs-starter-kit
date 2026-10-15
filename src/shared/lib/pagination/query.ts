export const DEFAULT_PER_PAGE = 7;
export const MAX_PER_PAGE = 20;

export type SearchParams = Record<string, string | string[] | undefined>;
export type ListPageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<SearchParams>;
};
export type ListQuery = { page: number; perPage: number; q?: string };

const pick = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

function positiveInteger(
  value: string | undefined,
  fallback: number,
  max = Number.MAX_SAFE_INTEGER,
) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 && number <= max
    ? number
    : fallback;
}

export function normalizeListQuery(params: SearchParams): ListQuery {
  const text = (pick(params.q) ?? '').trim();
  return {
    page: positiveInteger(pick(params.page), 1),
    perPage: positiveInteger(
      pick(params.perPage),
      DEFAULT_PER_PAGE,
      MAX_PER_PAGE,
    ),
    q: text.length >= 3 && text.length <= 80 ? text : undefined,
  };
}

export function toSearchParams(params: SearchParams): URLSearchParams {
  const result = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((item) => result.append(key, item));
    } else if (value !== undefined) {
      result.append(key, value);
    }
  }
  return result;
}

export function listSearchParams(
  query: ListQuery,
  existing = new URLSearchParams(),
): URLSearchParams {
  const result = new URLSearchParams(existing);
  for (const key of ['page', 'perPage', 'q']) {
    result.delete(key);
  }
  if (query.page > 1) {
    result.set('page', String(query.page));
  }
  if (query.perPage !== DEFAULT_PER_PAGE) {
    result.set('perPage', String(query.perPage));
  }
  if (query.q) {
    result.set('q', query.q);
  }
  return result;
}

export function listURL(
  pathname: string,
  query: ListQuery,
  existing?: URLSearchParams,
): string {
  const search = listSearchParams(query, existing).toString();
  return search ? `${pathname}?${search}` : pathname;
}

export function needsListRedirect(
  params: SearchParams,
  query: ListQuery,
): boolean {
  const expected = listSearchParams(query);
  return ['page', 'perPage', 'q'].some(
    (key) => params[key] !== (expected.get(key) ?? undefined),
  );
}
