/**
 * Supermarket Deals Scraper & Processor for German Supermarkets
 * (Rewe, Lidl, Aldi, Edeka, Penny, Kaufland, Netto)
 * Inspired by fitapp-ofertas and Marktguru flyer syndication.
 */

export const STATIC_MARKTGURU_KEYS = {
  apiKey: '8Kk+pmbf7TgJ9nVj2cXeA7P5zBGv8iuutVVMRfOfvNE=',
  clientKey: 'WU/RH+PMGDi+gkZer3WbMelt6zcYHSTytNB7VpTia90=',
  apiVersion: '1',
};

export const SUPERMARKET_CHAINS: Record<string, string> = {
  REWE: 'Rewe',
  'REWE Center': 'Rewe',
  Lidl: 'Lidl',
  EDEKA: 'Edeka',
  'EDEKA Frischemarkt': 'Edeka',
  PENNY: 'Penny',
  'ALDI SÜD': 'Aldi Süd',
  'ALDI Nord': 'Aldi Nord',
  Aldi: 'Aldi',
  Kaufland: 'Kaufland',
  'Netto Marken-Discount': 'Netto',
};

export type GermanFoodSection =
  | 'dairy_quark'
  | 'meat_poultry'
  | 'fish_seafood'
  | 'vegan_protein'
  | 'produce'
  | 'pantry_grains'
  | 'bakery'
  | 'beverages'
  | 'other';

export interface BrochureDeal {
  id: string;
  supermarket: string;
  name: string;
  brand?: string;
  price: number;
  oldPrice?: number;
  unitPrice?: number;
  unit?: string;
  detail?: string;
  section: GermanFoodSection;
  categoryDE?: string;
  validFrom?: string;
  validTo?: string;
  url?: string;
  packageWeightG?: number;
  estimatedProteinPer100g?: number;
  costPer100gProtein?: number;
  proteinTier?: 'exceptional' | 'great' | 'moderate' | 'low_efficiency';
}

/** Parent category ID mapping from Marktguru taxonomy to GermanFoodSection */
export const MARKTGURU_PARENT_CATEGORY_MAP: Record<number, GermanFoodSection> = {
  107: 'dairy_quark',
  103: 'meat_poultry',
  104: 'meat_poultry',
  106: 'fish_seafood',
  101: 'produce',
  147: 'produce',
  149: 'produce',
  191: 'bakery',
  23: 'bakery',
  116: 'pantry_grains',
  110: 'pantry_grains',
  119: 'pantry_grains',
  113: 'pantry_grains',
  16: 'vegan_protein',
  69: 'beverages',
  70: 'beverages',
};

/** Keyword rules for categorizing items by name */
const SECTION_KEYWORD_RULES: [RegExp, GermanFoodSection][] = [
  [/lachs|thunfisch|garnelen|forelle|kabeljau|dorade|makrele|seelachs|meeresfr/i, 'fish_seafood'],
  [/tofu|tempeh|seitan|soja|vegane[sn]?\s*(hack|schnitzel|wurst)|planted/i, 'vegan_protein'],
  [/haehnchen|hähnchen|huehn|hühn|gefluegel|geflügel|pute|truthahn|rind|hackfleisch|steak|schnitzel|filet|gulasch|bratwurst|schwein/i, 'meat_poultry'],
  [/quark|magerquark|skyr|milch|joghurt|kaese|käse|hüttenkäse|huettenkaese|mozzarella|feta|gouda|edamer|butter|sahne/i, 'dairy_quark'],
  [/apfel|aepfel|banane|beere|himbeere|erdbeere|heidelbeere|brokkoli|spinat|salat|tomate|gurke|paprika|kartoffel|moehre|möhre|karotte|zucchini|avocado|pilz/i, 'produce'],
  [/haferflocken|muesli|müsli|reis\b|nudeln|pasta|spaghetti|linsen|kichererbsen|bohnen|mehl/i, 'pantry_grains'],
  [/vollkornbrot|eiweißbrot|eiweissbrot|brot\b|broetchen|brötchen|toast|baguette/i, 'bakery'],
  [/wasser|mineralwasser|saft\b|schorle|tee\b|kaffee/i, 'beverages'],
];

export function normalizeGermanText(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .trim();
}

export function classifyGermanFoodSection(
  categories?: { id?: number; parentId?: number; name?: string }[],
  productName?: string
): GermanFoodSection {
  if (categories && categories.length > 0) {
    for (const cat of categories) {
      if (cat.parentId && MARKTGURU_PARENT_CATEGORY_MAP[cat.parentId]) {
        return MARKTGURU_PARENT_CATEGORY_MAP[cat.parentId];
      }
    }
  }

  if (productName) {
    const norm = normalizeGermanText(productName);
    for (const [pattern, section] of SECTION_KEYWORD_RULES) {
      if (pattern.test(norm)) {
        return section;
      }
    }
  }

  return 'other';
}

export function estimateProteinPer100g(productName: string, section: GermanFoodSection): number {
  const norm = normalizeGermanText(productName);

  if (/magerquark/i.test(norm)) return 12.0;
  if (/skyr/i.test(norm)) return 11.0;
  if (/huettenkaese|hüttenkäse|koerniger/i.test(norm)) return 12.5;
  if (/haehnchenbrust|hähnchenbrust|putenbrust/i.test(norm)) return 23.5;
  if (/rinderhack|tatar/i.test(norm)) return 21.0;
  if (/lachs/i.test(norm)) return 20.0;
  if (/thunfisch/i.test(norm)) return 25.0;
  if (/garnelen/i.test(norm)) return 19.0;
  if (/tofu/i.test(norm)) return 14.5;
  if (/eiweissbrot|eiweißbrot/i.test(norm)) return 22.0;
  if (/eier|frische eier/i.test(norm)) return 13.0;
  if (/haferflocken/i.test(norm)) return 13.5;
  if (/linsen/i.test(norm)) return 24.0;
  if (/kichererbsen/i.test(norm)) return 19.0;
  if (/gouda|edamer|emmentaler/i.test(norm)) return 25.0;
  if (/mozzarella/i.test(norm)) return 18.0;
  if (/griechischer joghurt/i.test(norm)) return 9.0;
  if (/joghurt/i.test(norm)) return 4.0;
  if (/milch/i.test(norm)) return 3.4;

  switch (section) {
    case 'meat_poultry':
      return 20.0;
    case 'fish_seafood':
      return 19.0;
    case 'vegan_protein':
      return 14.0;
    case 'dairy_quark':
      return 8.0;
    case 'pantry_grains':
      return 10.0;
    case 'bakery':
      return 8.0;
    case 'produce':
      return 1.5;
    default:
      return 0.0;
  }
}

export function parsePackageWeightG(text?: string): number | undefined {
  if (!text) return undefined;
  const norm = text.toLowerCase().replace(/\s+/g, ' ');

  const kgMatch = norm.match(/(\d+(?:[.,]\d+)?)\s*kg\b/);
  if (kgMatch) {
    return Math.round(parseFloat(kgMatch[1].replace(',', '.')) * 1000);
  }

  const gMatch = norm.match(/(\d+(?:[.,]\d+)?)\s*g\b/);
  if (gMatch) {
    return Math.round(parseFloat(gMatch[1].replace(',', '.')));
  }

  return undefined;
}

export function calculateAthleticProteinCost(
  price: number,
  packageWeightG: number,
  proteinPer100g: number
): {
  costPer100gProtein: number;
  totalProteinG: number;
  proteinTier: 'exceptional' | 'great' | 'moderate' | 'low_efficiency';
} {
  if (price <= 0 || packageWeightG <= 0 || proteinPer100g <= 0) {
    return {
      costPer100gProtein: Infinity,
      totalProteinG: 0,
      proteinTier: 'low_efficiency',
    };
  }

  const totalProteinG = (packageWeightG / 100) * proteinPer100g;
  const costPer100gProtein = Math.round((price / totalProteinG) * 100 * 100) / 100;

  let proteinTier: 'exceptional' | 'great' | 'moderate' | 'low_efficiency' = 'low_efficiency';
  if (costPer100gProtein <= 1.20) {
    proteinTier = 'exceptional';
  } else if (costPer100gProtein <= 2.20) {
    proteinTier = 'great';
  } else if (costPer100gProtein <= 3.80) {
    proteinTier = 'moderate';
  }

  return {
    costPer100gProtein,
    totalProteinG,
    proteinTier,
  };
}

export function enrichBrochureDeal(deal: BrochureDeal): BrochureDeal {
  const section = deal.section || classifyGermanFoodSection(undefined, deal.name);
  const estimatedProtein = estimateProteinPer100g(deal.name, section);
  const weightG = deal.packageWeightG || parsePackageWeightG(deal.detail) || parsePackageWeightG(deal.unit);

  let costPer100gProtein: number | undefined;
  let proteinTier: BrochureDeal['proteinTier'];

  if (weightG && estimatedProtein > 0 && deal.price > 0) {
    const calc = calculateAthleticProteinCost(deal.price, weightG, estimatedProtein);
    costPer100gProtein = calc.costPer100gProtein;
    proteinTier = calc.proteinTier;
  }

  return {
    ...deal,
    section,
    packageWeightG: weightG,
    estimatedProteinPer100g: estimatedProtein,
    costPer100gProtein,
    proteinTier,
  };
}
