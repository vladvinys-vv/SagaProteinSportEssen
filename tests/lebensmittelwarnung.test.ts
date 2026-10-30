import { describe, expect, it } from 'vitest';
import {
  checkProductSafety,
  type FoodWarning,
  filterWarnings,
} from '../src/lib/lebensmittelwarnung';

describe('lebensmittelwarnung module', () => {
  const sampleWarnings: FoodWarning[] = [
    {
      id: 101,
      title: 'Whey Isolate Chocolate Recall',
      warning: 'Salmonella enterica detected in batch 2026-A',
      manufacturer: 'BioPower Nutrition GmbH',
      reason: 'Microbiological contamination',
    },
    {
      id: 102,
      title: 'Organic Peanut Butter Crunchy',
      warning: 'Aflatoxin levels exceed legal threshold',
      manufacturer: 'NaturPur Lebensmittellabor',
      reason: 'Mycotoxin contamination',
    },
    {
      id: 103,
      title: 'Creatine Monohydrate Pure',
      warning: 'Undeclared milk allergen present',
      manufacturer: 'AlphaSupps Germany',
      reason: 'Allergen labeling error',
    },
  ];

  it('filters warnings by keyword query', () => {
    const results = filterWarnings(sampleWarnings, { query: 'salmonella' });
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Whey Isolate Chocolate Recall');
  });

  it('filters warnings by manufacturer query', () => {
    const results = filterWarnings(sampleWarnings, { query: 'AlphaSupps' });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(103);
  });

  it('returns all warnings up to limit when query is empty', () => {
    const results = filterWarnings(sampleWarnings, { limit: 2 });
    expect(results).toHaveLength(2);
  });

  it('flags unsafe food products matching active recall warnings', () => {
    const assessment = checkProductSafety('Whey Isolate Chocolate', 'BioPower Nutrition', sampleWarnings);
    expect(assessment.isSafe).toBe(false);
    expect(assessment.matchingWarnings).toHaveLength(1);
  });

  it('confirms product safety when no recall matches', () => {
    const assessment = checkProductSafety('Micellar Casein Vanilla', 'CleanProtein AG', sampleWarnings);
    expect(assessment.isSafe).toBe(true);
    expect(assessment.matchingWarnings).toHaveLength(0);
  });
});
