export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}

export function normalizePagination(
  pageInput?: string | number,
  limitInput?: string | number,
  defaultLimit = 10,
  maxLimit = 100,
): PaginationParams {
  const parsedPage = Number(pageInput);
  const parsedLimit = Number(limitInput);

  const page =
    Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1;
  const limit =
    Number.isFinite(parsedLimit) && parsedLimit > 0
      ? Math.min(Math.floor(parsedLimit), maxLimit)
      : defaultLimit;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

export function toPaginatedResponse<T>(
  items: T[],
  totalItems: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  return {
    items,
    page,
    limit,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / limit)),
  };
}
