import { beforeEach, describe, expect, it } from 'vitest';
import { type CachedDealItem, OfflineDealCache } from '@/lib/offlineDealCache';

// In-memory Mock Storage for unit tests
class MockStorage implements Storage {
  private store: Map<string, string> = new Map();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

describe('OfflineDealCache', () => {
  let mockStorage: MockStorage;
  let cache: OfflineDealCache;

  const mockDeals: CachedDealItem[] = [
    {
      id: 'deal-1',
      supermarket: 'Rewe',
      name: 'Ja! Magerquark 500g',
      price: 1.35,
      section: 'dairy_quark',
      costPer100gProtein: 2.25,
      proteinTier: 'great',
    },
    {
      id: 'deal-2',
      supermarket: 'Lidl',
      name: 'Milbona Skyr 500g',
      price: 1.49,
      section: 'dairy_quark',
      costPer100gProtein: 2.71,
      proteinTier: 'moderate',
    },
  ];

  beforeEach(() => {
    mockStorage = new MockStorage();
    cache = new OfflineDealCache(mockStorage);
  });

  it('saves and retrieves deals for a German ZIP code', () => {
    cache.saveDeals('20095', mockDeals);

    const cached = cache.getDeals('20095');
    expect(cached).not.toBeNull();
    expect(cached?.deals.length).toBe(2);
    expect(cached?.deals[0].name).toBe('Ja! Magerquark 500g');
    expect(cached?.zipCode).toBe('20095');
  });

  it('handles expired deals based on allowExpired flag', () => {
    // Save with negative TTL to simulate past expiration
    cache.saveDeals('10115', mockDeals, -1000);

    // Stale deals are rejected if allowExpired is false
    expect(cache.getDeals('10115', false)).toBeNull();

    // Stale deals are returned as fallback when allowExpired is true
    expect(cache.getDeals('10115', true)).not.toBeNull();
  });

  it('fetchWithFallback returns fresh data when online and updates cache', async () => {
    const fetchFn = async () => mockDeals;

    const result = await cache.fetchWithFallback('20095', fetchFn, true);
    expect(result.isOfflineFallback).toBe(false);
    expect(result.deals.length).toBe(2);

    // Verify written to storage
    expect(cache.getDeals('20095')).not.toBeNull();
  });

  it('fetchWithFallback immediately serves cached copy when offline', async () => {
    cache.saveDeals('20095', mockDeals);

    let networkCalled = false;
    const fetchFn = async () => {
      networkCalled = true;
      return [];
    };

    const result = await cache.fetchWithFallback('20095', fetchFn, false);
    expect(networkCalled).toBe(false);
    expect(result.isOfflineFallback).toBe(true);
    expect(result.deals.length).toBe(2);
  });

  it('fetchWithFallback falls back to cached deals if network throws an error', async () => {
    cache.saveDeals('20095', mockDeals);

    const failingFetch = async () => {
      throw new Error('Network timeout in Aldi basement');
    };

    const result = await cache.fetchWithFallback('20095', failingFetch, true);
    expect(result.isOfflineFallback).toBe(true);
    expect(result.deals[0].supermarket).toBe('Rewe');
  });

  it('clears specific or all cached zip codes', () => {
    cache.saveDeals('20095', mockDeals);
    cache.saveDeals('10115', mockDeals);

    cache.clear('20095');
    expect(cache.getDeals('20095')).toBeNull();
    expect(cache.getDeals('10115')).not.toBeNull();

    cache.clear();
    expect(cache.getDeals('10115')).toBeNull();
  });
});
