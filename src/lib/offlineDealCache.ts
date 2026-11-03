/**
 * Offline Supermarket Deals Cache and Synchronization.
 *
 * Provides resilient stale-while-revalidate caching for German supermarket flyer deals
 * (Rewe, Lidl, Aldi, Edeka) so customers can check prices, protein metrics, and shopping lists
 * inside supermarket basements without network connectivity.
 */

export interface CachedDealItem {
  id: string | number;
  supermarket: string;
  name: string;
  brand?: string;
  price: number;
  oldPrice?: number;
  section?: string;
  packageWeightG?: number;
  costPer100gProtein?: number;
  proteinTier?: string;
}

export interface CachedDealsPayload<T = CachedDealItem> {
  zipCode: string;
  updatedAt: string;
  expiresAt: string;
  deals: T[];
  isOfflineFallback?: boolean;
}

const CACHE_KEY_PREFIX = 'forma-supermarket-deals:';
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export class OfflineDealCache<T = CachedDealItem> {
  private storage: Storage | null;

  constructor(customStorage?: Storage) {
    if (customStorage) {
      this.storage = customStorage;
    } else if (typeof window !== 'undefined' && window.localStorage) {
      this.storage = window.localStorage;
    } else {
      this.storage = null;
    }
  }

  private getKey(zipCode: string): string {
    return `${CACHE_KEY_PREFIX}${zipCode.trim()}`;
  }

  saveDeals(zipCode: string, deals: T[], ttlMs = DEFAULT_TTL_MS): void {
    if (!this.storage) return;

    const now = Date.now();
    const payload: CachedDealsPayload<T> = {
      zipCode: zipCode.trim(),
      updatedAt: new Date(now).toISOString(),
      expiresAt: new Date(now + ttlMs).toISOString(),
      deals,
    };

    try {
      this.storage.setItem(this.getKey(zipCode), JSON.stringify(payload));
    } catch {
      // Storage quota exceeded or disabled in private browsing
    }
  }

  getDeals(zipCode: string, allowExpired = true): CachedDealsPayload<T> | null {
    if (!this.storage) return null;

    try {
      const raw = this.storage.getItem(this.getKey(zipCode));
      if (!raw) return null;

      const parsed = JSON.parse(raw) as CachedDealsPayload<T>;
      if (!parsed || !Array.isArray(parsed.deals)) return null;

      const isExpired = new Date(parsed.expiresAt).getTime() < Date.now();
      if (isExpired && !allowExpired) {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }

  clear(zipCode?: string): void {
    if (!this.storage) return;

    if (zipCode) {
      this.storage.removeItem(this.getKey(zipCode));
    } else {
      const keysToRemove: string[] = [];
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key?.startsWith(CACHE_KEY_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      for (const k of keysToRemove) {
        this.storage.removeItem(k);
      }
    }
  }

  /**
   * Stale-while-revalidate execution:
   * 1. If offline, immediately returns cached deals without hanging network timeouts.
   * 2. If online, attempts network fetch; upon success updates cache.
   * 3. Upon network failure, falls back to cached copy with isOfflineFallback flag.
   */
  async fetchWithFallback(
    zipCode: string,
    networkFetch: () => Promise<T[]>,
    isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
  ): Promise<CachedDealsPayload<T>> {
    const cached = this.getDeals(zipCode, true);

    // 1. Instant offline return
    if (!isOnline && cached) {
      return {
        ...cached,
        isOfflineFallback: true,
      };
    }

    // 2. Online network fetch
    try {
      const freshDeals = await networkFetch();
      this.saveDeals(zipCode, freshDeals);
      return {
        zipCode,
        updatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + DEFAULT_TTL_MS).toISOString(),
        deals: freshDeals,
        isOfflineFallback: false,
      };
    } catch (networkError) {
      // 3. Fallback to cached copy if network fails
      if (cached) {
        return {
          ...cached,
          isOfflineFallback: true,
        };
      }
      throw networkError;
    }
  }
}

export const offlineDealCache = new OfflineDealCache();
