const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;

export type PaginationParams = {
  skip: number;
  take: number;
  page: number;
  limit: number;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

/** Parse ?page=&limit= with safe bounds. Page is 1-based. */
export function parsePagination(
  searchParams: URLSearchParams,
  defaults: { defaultLimit?: number; maxLimit?: number } = {},
): PaginationParams {
  const defaultLimit = defaults.defaultLimit ?? DEFAULT_LIMIT;
  const maxLimit = defaults.maxLimit ?? MAX_LIMIT;

  const rawPage = Number.parseInt(searchParams.get('page') ?? '1', 10);
  const rawLimit = Number.parseInt(searchParams.get('limit') ?? String(defaultLimit), 10);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, maxLimit) : defaultLimit;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
}

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasMore: page < totalPages,
  };
}

export const PRODUCT_LIST_MAX = MAX_LIMIT;
export const REVIEW_LIST_DEFAULT = 20;
export const REVIEW_LIST_MAX = 50;
