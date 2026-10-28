import type { PriceEntry } from "@/types";

export interface ParsedQuantity {
  liters: number;
  kg: number;
  raw: string;
}

function parseQuantity(text: string): ParsedQuantity {
  if (!text) return { liters: 0, kg: 0, raw: "1 Stück" };

  const normalized = text.toLowerCase().replace(/\s+/g, " ").trim();
  let liters = 0;
  let kg = 0;
  let raw = text;

  // Match patterns like "6x0,33l", "6 x 0,33 l", "1,5l", "2 l", "1,5 liter"
  const literPattern = /(?:(\d+(?:[.,]\d+)?)\s*[x×]\s*)?(\d+(?:[.,]\d+)?)\s*(?:l|liter|litro)/i;
  const literMatch = normalized.match(literPattern);
  if (literMatch) {
    const count = literMatch[1] ? parseFloat(literMatch[1].replace(",", ".")) : 1;
    const size = parseFloat(literMatch[2].replace(",", "."));
    liters = count * size;
    raw = `${count}x${size}l`;
  }

  // Match patterns like "2kg", "2 kg", "500g", "1,5 kg"
  const kgPattern = /(?:(\d+(?:[.,]\d+)?)\s*[x×]\s*)?(\d+(?:[.,]\d+)?)\s*(?:kg|g\b)/i;
  const kgMatch = normalized.match(kgPattern);
  if (kgMatch) {
    const count = kgMatch[1] ? parseFloat(kgMatch[1].replace(",", ".")) : 1;
    const size = parseFloat(kgMatch[2].replace(",", "."));
    if (normalized.includes("kg")) {
      kg = count * size;
    } else if (normalized.includes("g")) {
      kg = (count * size) / 1000;
    }
    raw = `${count}x${size}${normalized.includes("kg") ? "kg" : "g"}`;
  }

  // Match "ml" patterns
  const mlPattern = /(?:(\d+(?:[.,]\d+)?)\s*[x×]\s*)?(\d+(?:[.,]\d+)?)\s*ml/i;
  const mlMatch = normalized.match(mlPattern);
  if (mlMatch && liters === 0) {
    const count = mlMatch[1] ? parseFloat(mlMatch[1].replace(",", ".")) : 1;
    const size = parseFloat(mlMatch[2].replace(",", "."));
    liters = (count * size) / 1000;
    raw = `${count}x${size}ml`;
  }

  // Match "cl" patterns
  const clPattern = /(?:(\d+(?:[.,]\d+)?)\s*[x×]\s*)?(\d+(?:[.,]\d+)?)\s*cl/i;
  const clMatch = normalized.match(clPattern);
  if (clMatch && liters === 0) {
    const count = clMatch[1] ? parseFloat(clMatch[1].replace(",", ".")) : 1;
    const size = parseFloat(clMatch[2].replace(",", "."));
    liters = (count * size) / 100;
    raw = `${count}x${size}cl`;
  }

  // Match piece counts like "10er Pack", "10 stk", "6 stück"
  const piecePattern = /(\d+)\s*(?:stk|stück|er\s*pack|pieces?)/i;
  const pieceMatch = normalized.match(piecePattern);
  if (pieceMatch && liters === 0 && kg === 0) {
    raw = `${pieceMatch[1]} Stück`;
  }

  // Match "Beutel", "Packung", "Flasche", "Dose" without size
  if (liters === 0 && kg === 0) {
    const unitMatch = normalized.match(/(\d+)\s*(beutel|packung|flasche|dose|glas|tetra\s*pack)/i);
    if (unitMatch) {
      raw = `${unitMatch[1]} ${unitMatch[2].toLowerCase()}`;
    }
  }

  return { liters, kg, raw };
}

function extractSizeFromDescription(description: string): ParsedQuantity {
  const desc = description.toLowerCase();

  // Look for volume patterns
  const volMatch = desc.match(/(\d+[.,]?\d*)\s*(l|liter|ml|cl)/i);
  if (volMatch) {
    const val = parseFloat(volMatch[1].replace(",", "."));
    if (volMatch[2].toLowerCase() === "l") return { liters: val, kg: 0, raw: `${val}l` };
    if (volMatch[2].toLowerCase() === "liter") return { liters: val, kg: 0, raw: `${val}l` };
    if (volMatch[2].toLowerCase() === "ml") return { liters: val / 1000, kg: 0, raw: `${val}ml` };
    if (volMatch[2].toLowerCase() === "cl") return { liters: val / 100, kg: 0, raw: `${val}cl` };
  }

  // Look for weight patterns
  const weightMatch = desc.match(/(\d+[.,]?\d*)\s*(kg|g)\b/i);
  if (weightMatch) {
    const val = parseFloat(weightMatch[1].replace(",", "."));
    if (weightMatch[2].toLowerCase() === "kg") return { liters: 0, kg: val, raw: `${val}kg` };
    if (weightMatch[2].toLowerCase() === "g") return { liters: 0, kg: val / 1000, raw: `${val}g` };
  }

  return { liters: 0, kg: 0, raw: "1 Stück" };
}

export interface NormalizedPriceEntry extends PriceEntry {
  /** Size in liters (for liquids) */
  sizeLiters: number;
  /** Size in kg (for solids) */
  sizeKg: number;
  /** Raw parsed size string */
  sizeRaw: string;
  /** Price per liter (EUR) */
  pricePerLiter: number;
  /** Price per kg (EUR) */
  pricePerKg: number;
  /** Normalized score for sorting (lower = better value) */
  priceScore: number;
}

export interface StoreComparison {
  productName: string;
  offers: NormalizedPriceEntry[];
  cheapest: NormalizedPriceEntry;
  priciest: NormalizedPriceEntry;
  averagePrice: number;
  spreadPercent: number;
  savings: number;
  unit: "g" | "ml";
}

/**
 * Parse quantity string into liters/kg (e.g., "6x0.33l", "1.5kg", "500g", "6x330ml")
 */
export function parseQuantityString(text: string): ParsedQuantity {
  return parseQuantity(text);
}

/**
 * Extract size from product description
 */
export function extractSizeFromText(description: string): ParsedQuantity {
  return extractSizeFromDescription(description);
}

/**
 * Normalize a price entry with parsed size and price per unit calculations
 */
export function normalizePriceEntry(entry: PriceEntry): NormalizedPriceEntry {
  const qty = parseQuantityString(entry.packageSizeG ? `${entry.packageSizeG}g` : entry.packageSizeMl ? `${entry.packageSizeMl}ml` : "");
  
  let sizeLiters = qty.liters;
  let sizeKg = qty.kg;
  let sizeRaw = qty.raw;

  // If quantity parsing didn't work, try to infer from product name
  if (sizeLiters === 0 && sizeKg === 0 && entry.productName) {
    const fromDesc = extractSizeFromText(entry.productName);
    sizeLiters = fromDesc.liters;
    sizeKg = fromDesc.kg;
    sizeRaw = fromDesc.raw;
  }

  // Calculate price per unit
  let pricePerLiter = Infinity;
  let pricePerKg = Infinity;

  if (sizeLiters > 0) {
    pricePerLiter = entry.packagePrice / sizeLiters;
  }
  if (sizeKg > 0) {
    pricePerKg = entry.packagePrice / sizeKg;
  }

  // Score: lower is better (minimum of price per liter and price per kg)
  const priceScore = Math.min(pricePerLiter, pricePerKg);

  return {
    ...entry,
    sizeLiters,
    sizeKg,
    sizeRaw,
    pricePerLiter,
    pricePerKg,
    priceScore,
  };
}

/**
 * Normalize multiple price entries
 */
export function normalizePriceEntries(entries: PriceEntry[]): NormalizedPriceEntry[] {
  return entries.map(normalizePriceEntry);
}

/**
 * Group price entries by product and find best prices per store
 */
export function compareStorePrices(entries: NormalizedPriceEntry[]): StoreComparison[] {
  const grouped = new Map<string, NormalizedPriceEntry[]>();
  
  for (const entry of entries) {
    const key = entry.productName.toLowerCase().trim();
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(entry);
  }

  const comparisons: StoreComparison[] = [];

  for (const [, offers] of grouped) {
    if (offers.length < 2) continue;

    const sorted = [...offers].sort((a, b) => a.priceScore - b.priceScore);
    const cheapest = sorted[0];
    const priciest = sorted[sorted.length - 1];
    const averagePrice = offers.reduce((sum, o) => sum + o.priceScore, 0) / offers.length;
    const spreadPercent = ((priciest.priceScore - cheapest.priceScore) / cheapest.priceScore) * 100;

    comparisons.push({
      productName: offers[0].productName,
      offers,
      cheapest,
      priciest,
      averagePrice,
      spreadPercent,
      savings: priciest.packagePrice - cheapest.packagePrice,
      unit: cheapest.sizeLiters > 0 ? "ml" : "g",
    });
  }

  return comparisons.sort((a, b) => b.spreadPercent - a.spreadPercent);
}

/**
 * Format currency in German locale
 */
export function formatCurrency(value: number, currency: "EUR" | "RUB" | "USD" = "EUR"): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("de-DE", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
}

/**
 * Format price per unit
 */
export function formatUnitPrice(entry: NormalizedPriceEntry): string {
  if (entry.sizeLiters > 0 && entry.pricePerLiter < Infinity) {
    return `${formatCurrency(entry.pricePerLiter)}/L`;
  }
  if (entry.sizeKg > 0 && entry.pricePerKg < Infinity) {
    return `${formatCurrency(entry.pricePerKg)}/kg`;
  }
  return "—";
}

/**
 * Export price entries to CSV
 */
export function exportPricesToCSV(entries: NormalizedPriceEntry[]): string {
  const headers = ["Produkt", "Shop", "Größe", "Preis", "€/L", "€/kg", "Gültig von", "Gültig bis", "Kategorie"];
  const rows = entries.map((entry) => [
    entry.productName,
    entry.store,
    entry.sizeRaw,
    entry.packagePrice.toFixed(2),
    entry.pricePerLiter < Infinity ? entry.pricePerLiter.toFixed(2) : "",
    entry.pricePerKg < Infinity ? entry.pricePerKg.toFixed(2) : "",
    entry.date,
    "",
    entry.productId ? "Produkt-DB" : "Manuell",
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
    .join("\n");

  return `\ufeff${csvContent}`;
}

/**
 * Download CSV file
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}