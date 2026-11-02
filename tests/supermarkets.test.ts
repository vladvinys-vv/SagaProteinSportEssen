import { describe, expect, it } from 'vitest';
import {
  classifyGermanFoodSection,
  estimateProteinPer100g,
  parsePackageWeightG,
  calculateAthleticProteinCost,
  enrichBrochureDeal,
  STATIC_MARKTGURU_KEYS,
  type BrochureDeal,
} from '@/lib/supermarkets';

describe('German Supermarket Scraper & Taxonomy', () => {
  it('classifies grocery products into athletic food sections', () => {
    expect(classifyGermanFoodSection(undefined, 'Milsani Magerquark')).toBe('dairy_quark');
    expect(classifyGermanFoodSection(undefined, 'Hähnchenbrustfilet frisch')).toBe('meat_poultry');
    expect(classifyGermanFoodSection(undefined, 'Wildlachsfilet')).toBe('fish_seafood');
    expect(classifyGermanFoodSection(undefined, 'Bio Tofu Natur')).toBe('vegan_protein');
    expect(classifyGermanFoodSection(undefined, 'Haferflocken zart')).toBe('pantry_grains');
    expect(classifyGermanFoodSection(undefined, 'Eiweißbrot')).toBe('bakery');
    expect(classifyGermanFoodSection(undefined, 'Mineralwasser')).toBe('beverages');
    expect(classifyGermanFoodSection([{ parentId: 107, name: 'Käse' }])).toBe('dairy_quark');
    expect(classifyGermanFoodSection([{ parentId: 103, name: 'Fleisch' }])).toBe('meat_poultry');
  });

  it('estimates protein per 100g for German athletic staples', () => {
    expect(estimateProteinPer100g('Magerquark', 'dairy_quark')).toBe(12.0);
    expect(estimateProteinPer100g('Skyr', 'dairy_quark')).toBe(11.0);
    expect(estimateProteinPer100g('Hähnchenbrust', 'meat_poultry')).toBe(23.5);
    expect(estimateProteinPer100g('Thunfisch', 'fish_seafood')).toBe(25.0);
    expect(estimateProteinPer100g('Bio Tofu', 'vegan_protein')).toBe(14.5);
  });

  it('parses packaging weights in grams and kg', () => {
    expect(parsePackageWeightG('500g Packung')).toBe(500);
    expect(parsePackageWeightG('1kg Beutel')).toBe(1000);
    expect(parsePackageWeightG('1.5 kg')).toBe(1500);
  });

  it('calculates cost per 100g protein and assigns tiers', () => {
    const calc = calculateAthleticProteinCost(1.39, 500, 12.0);
    expect(calc.totalProteinG).toBe(60);
    expect(calc.costPer100gProtein).toBe(2.32);
    expect(calc.proteinTier).toBe('moderate');

    const bargain = calculateAthleticProteinCost(0.69, 500, 12.0);
    expect(bargain.costPer100gProtein).toBe(1.15);
    expect(bargain.proteinTier).toBe('exceptional');
  });

  it('enriches brochure deal with nutritional metrics', () => {
    const deal: BrochureDeal = {
      id: 'deal-1',
      supermarket: 'Rewe',
      name: 'Ja! Magerquark',
      price: 1.35,
      detail: '500g Becher',
      section: 'dairy_quark',
    };

    const enriched = enrichBrochureDeal(deal);
    expect(enriched.packageWeightG).toBe(500);
    expect(enriched.estimatedProteinPer100g).toBe(12.0);
    expect(enriched.costPer100gProtein).toBeDefined();
    expect(enriched.proteinTier).toBeDefined();
  });

  it('provides non-empty static API keys for fail-safe syndication', () => {
    expect(STATIC_MARKTGURU_KEYS.apiKey.length).toBeGreaterThan(20);
    expect(STATIC_MARKTGURU_KEYS.clientKey.length).toBeGreaterThan(20);
    expect(STATIC_MARKTGURU_KEYS.apiVersion).toBe('1');
  });
});
