/**
 * Lebensmittelwarnung API Integration (BVL / bund.dev)
 * Official German Consumer Protection & Food Recall warnings
 * https://lebensmittelwarnung.api.bund.dev/
 */

export interface FoodWarning {
  id: string | number;
  title: string;
  warning: string;
  affectedProducts?: string;
  reason?: string;
  publishedDate?: string;
  manufacturer?: string;
  link?: string;
}

export interface WarningFilterOptions {
  category?: 'food' | 'supplements' | 'dairy' | 'meat' | 'all';
  query?: string;
  limit?: number;
}

export const LEBENSMITTELWARNUNG_ENDPOINT =
  'https://megov.bayern.de/verbraucherschutz/baystmuv-verbraucherinfo/rest/api/warnings/merged';

export const LEBENSMITTELWARNUNG_AUTH_HEADER =
  'baystmuv-vi-1.0 os=ios, key=9d9e8972-ff15-4943-8fea-117b5a973c61';

/**
 * Filter and search recalled products from German authorities
 */
export function filterWarnings(
  warnings: FoodWarning[],
  options: WarningFilterOptions = {}
): FoodWarning[] {
  const { query, limit = 20 } = options;
  let results = [...warnings];

  if (query && query.trim().length > 0) {
    const q = query.toLowerCase().trim();
    results = results.filter(
      (w) =>
        w.title.toLowerCase().includes(q) ||
        (w.warning?.toLowerCase().includes(q)) ||
        (w.reason?.toLowerCase().includes(q)) ||
        (w.manufacturer?.toLowerCase().includes(q))
    );
  }

  return results.slice(0, limit);
}

/**
 * Assess safety of a protein/supplement food item against active recalls
 */
export function checkProductSafety(
  productName: string,
  brand: string | undefined,
  activeWarnings: FoodWarning[]
): { isSafe: boolean; matchingWarnings: FoodWarning[] } {
  const normProduct = productName.toLowerCase().trim();
  const normBrand = (brand || '').toLowerCase().trim();

  const matchingWarnings = activeWarnings.filter((w) => {
    const titleMatch = normProduct.length > 2 && w.title.toLowerCase().includes(normProduct);
    const brandMatch =
      normBrand.length > 2 &&
      ((w.manufacturer?.toLowerCase().includes(normBrand)) ||
        w.title.toLowerCase().includes(normBrand));
    return titleMatch || brandMatch;
  });

  return {
    isSafe: matchingWarnings.length === 0,
    matchingWarnings,
  };
}
