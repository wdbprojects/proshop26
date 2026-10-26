export type ProductFilters = {
  brands: string[];
  minPrice: number | null;
  maxPrice: number | null;
};

export const EMPTY_FILTERS: ProductFilters = {
  brands: [],
  minPrice: null,
  maxPrice: null,
};

/* The price range counts as one filter, even if both ends are set */
export const countActiveFilters = (filters: ProductFilters) => {
  const hasPrice = filters.minPrice !== null || filters.maxPrice !== null;
  return filters.brands.length + (hasPrice ? 1 : 0);
};

/* The inputs holds text in dollars, the API wants integer cents */
export const dollarsToCents = (value: string): number | null => {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const amount = Number(trimmed);
  if (Number.isNaN(amount) || amount < 0) return null;
  return Math.round(amount * 100);
};

export const centsToDollars = (cents: number | null) => {
  return cents === null ? "" : String(cents / 100);
};
