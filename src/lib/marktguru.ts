import type { PriceEntry } from "@/types";

export interface MarktguruProduct {
  name: string;
  brand?: { name: string };
}

export interface MarktguruOffer {
  id: number;
  product: MarktguruProduct;
  description: string;
  price: number;
  unit?: string;
  unitPrice?: number;
  unitPriceUnit?: string;
  quantity?: string;
  validityDates: { from: string; to: string }[];
  advertisers: { name: string; id: number }[];
  imageUrl?: string;
  offerUrl?: string;
}

export interface MarktguruConfig {
  zipCode: string;
  stores: string[];
  limit: number;
}

export interface ImportedDeal {
  id: number;
  title: string;
  brand?: string;
  description: string;
  price: number;
  size: string;
  sizeLiters: number;
  sizeKg: number;
  pricePerLiter: number;
  pricePerKg: number;
  store: string;
  validFrom: string;
  validTo: string;
  url: string;
  score: number;
}

const MARKTGURU_BASE = "https://api.marktguru.de/api/v1";
const HOME_URL = "https://www.marktguru.de/";
const DEFAULT_ZIP = "10115";

let cachedKeys: { clientKey: string; apiKey: string; expiresAt: number } | null = null;

async function getApiKeys(): Promise<{ clientKey: string; apiKey: string }> {
  if (cachedKeys && cachedKeys.expiresAt > Date.now()) {
    return { clientKey: cachedKeys.clientKey, apiKey: cachedKeys.apiKey };
  }

  const resp = await fetch(HOME_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
  });

  const html = await resp.text();
  const clientKeyMatch = html.match(/"x-clientkey"\s*:\s*"([^"]+)"/) || html.match(/clientKey['":\s]+['"]([^'"]+)['"]/i);
  const apiKeyMatch = html.match(/"x-apikey"\s*:\s*"([^"]+)"/) || html.match(/apiKey['":\s]+['"]([^'"]+)['"]/i);

  const clientKey = clientKeyMatch?.[1];
  const apiKey = apiKeyMatch?.[1];

  if (clientKey && apiKey) {
    cachedKeys = { clientKey, apiKey, expiresAt: Date.now() + 6 * 60 * 60 * 1000 };
    return { clientKey, apiKey };
  }

  throw new Error("Could not extract Marktguru API keys");
}

function parseQuantity(text: string): { liters: number; kg: number; raw: string } {
  if (!text) return { liters: 0, kg: 0, raw: "1 Stück" };

  const normalized = text.toLowerCase().replace(/\s+/g, " ").trim();
  let liters = 0;
  let kg = 0;
  let raw = text;

  const literPattern = /(?:(\d+(?:[.,]\d+)?)\s*[x×]\s*)?(\d+(?:[.,]\d+)?)\s*(?:l|liter|litro)/i;
  const literMatch = normalized.match(literPattern);
  if (literMatch) {
    const count = literMatch[1] ? parseFloat(literMatch[1].replace(",", ".")) : 1;
    const size = parseFloat(literMatch[2].replace(",", "."));
    liters = count * size;
    raw = `${count}x${size}l`;
  }

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

  const mlPattern = /(?:(\d+(?:[.,]\d+)?)\s*[x×]\s*)?(\d+(?:[.,]\d+)?)\s*ml/i;
  const mlMatch = normalized.match(mlPattern);
  if (mlMatch && liters === 0) {
    const count = mlMatch[1] ? parseFloat(mlMatch[1].replace(",", ".")) : 1;
    const size = parseFloat(mlMatch[2].replace(",", "."));
    liters = (count * size) / 1000;
    raw = `${count}x${size}ml`;
  }

  const clPattern = /(?:(\d+(?:[.,]\d+)?)\s*[x×]\s*)?(\d+(?:[.,]\d+)?)\s*cl/i;
  const clMatch = normalized.match(clPattern);
  if (clMatch && liters === 0) {
    const count = clMatch[1] ? parseFloat(clMatch[1].replace(",", ".")) : 1;
    const size = parseFloat(clMatch[2].replace(",", "."));
    liters = (count * size) / 100;
    raw = `${count}x${size}cl`;
  }

  const piecePattern = /(\d+)\s*(?:stk|stück|er\s*pack|pieces?)/i;
  const pieceMatch = normalized.match(piecePattern);
  if (pieceMatch && liters === 0 && kg === 0) {
    raw = `${pieceMatch[1]} Stück`;
  }

  if (liters === 0 && kg === 0) {
    const unitMatch = normalized.match(/(\d+)\s*(beutel|packung|flasche|dose|glas|tetra\s*pack)/i);
    if (unitMatch) {
      raw = `${unitMatch[1]} ${unitMatch[2].toLowerCase()}`;
    }
  }

  return { liters, kg, raw };
}

function extractSizeFromDescription(description: string): { liters: number; kg: number; raw: string } {
  const desc = description.toLowerCase();

  const volMatch = desc.match(/(\d+[.,]?\d*)\s*(l|liter|ml|cl)/i);
  if (volMatch) {
    const val = parseFloat(volMatch[1].replace(",", "."));
    if (volMatch[2].toLowerCase() === "l" || volMatch[2].toLowerCase() === "liter") return { liters: val, kg: 0, raw: `${val}l` };
    if (volMatch[2].toLowerCase() === "ml") return { liters: val / 1000, kg: 0, raw: `${val}ml` };
    if (volMatch[2].toLowerCase() === "cl") return { liters: val / 100, kg: 0, raw: `${val}cl` };
  }

  const weightMatch = desc.match(/(\d+[.,]?\d*)\s*(kg|g)\b/i);
  if (weightMatch) {
    const val = parseFloat(weightMatch[1].replace(",", "."));
    if (weightMatch[2].toLowerCase() === "kg") return { liters: 0, kg: val, raw: `${val}kg` };
    if (weightMatch[2].toLowerCase() === "g") return { liters: 0, kg: val / 1000, raw: `${val}g` };
  }

  return { liters: 0, kg: 0, raw: "1 Stück" };
}

export function normalizeMarktguruOffer(offer: MarktguruOffer): ImportedDeal {
  const title = offer.product.name;
  const brand = offer.product.brand?.name;
  const description = offer.description || "";

  const qty = parseQuantity(offer.quantity || "");

  let sizeLiters = qty.liters;
  let sizeKg = qty.kg;
  let sizeRaw = qty.raw;

  if (sizeLiters === 0 && sizeKg === 0) {
    const fromDesc = extractSizeFromDescription(description);
    sizeLiters = fromDesc.liters;
    sizeKg = fromDesc.kg;
    sizeRaw = fromDesc.raw;
  }

  if (sizeLiters === 0 && sizeKg === 0 && offer.unit) {
    const fromUnit = parseQuantity(offer.unit);
    sizeLiters = fromUnit.liters;
    sizeKg = fromUnit.kg;
    if (sizeLiters > 0 || sizeKg > 0) sizeRaw = fromUnit.raw;
  }

  let pricePerLiter = Infinity;
  let pricePerKg = Infinity;

  if (sizeLiters > 0) pricePerLiter = offer.price / sizeLiters;
  if (sizeKg > 0) pricePerKg = offer.price / sizeKg;

  if (pricePerLiter === Infinity && offer.unitPrice && offer.unitPriceUnit?.toLowerCase().includes("l")) {
    pricePerLiter = offer.unitPrice;
  }
  if (pricePerKg === Infinity && offer.unitPrice && offer.unitPriceUnit?.toLowerCase().includes("kg")) {
    pricePerKg = offer.unitPrice;
  }

  const validFrom = offer.validityDates[0]?.from || "";
  const validTo = offer.validityDates[0]?.to || "";
  const store = offer.advertisers[0]?.name || "Unknown";
  const url = offer.offerUrl || `https://www.marktguru.de/offers/${offer.id}`;

  const score = Math.min(pricePerLiter, pricePerKg);

  return {
    id: offer.id,
    title,
    brand,
    description,
    price: offer.price,
    size: sizeRaw,
    sizeLiters,
    sizeKg,
    pricePerLiter,
    pricePerKg,
    store,
    validFrom,
    validTo,
    url,
    score,
  };
}

export function dealToPriceEntry(deal: ImportedDeal, city = "Гамбург"): PriceEntry {
  const packageSizeG = deal.sizeKg > 0 ? deal.sizeKg * 1000 : undefined;
  const packageSizeMl = deal.sizeLiters > 0 ? deal.sizeLiters * 1000 : undefined;

  return {
    id: `marktguru-${deal.id}`,
    productId: undefined,
    productName: deal.title,
    store: deal.store,
    city,
    currency: "EUR",
    packagePrice: deal.price,
    packageSizeG,
    packageSizeMl,
    date: deal.validFrom || new Date().toISOString().slice(0, 10),
  };
}

export async function fetchMarktguruDeals(
  query: string,
  config: Partial<MarktguruConfig> = {}
): Promise<ImportedDeal[]> {
  const { zipCode = DEFAULT_ZIP, stores = [], limit = 50 } = config;

  const keys = await getApiKeys();

  const url = new URL(`${MARKTGURU_BASE}/offers/search`);
  url.searchParams.set("as", "web");
  url.searchParams.set("q", query);
  url.searchParams.set("zipCode", zipCode);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", "0");

  const resp = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "x-clientkey": keys.clientKey,
      "x-apikey": keys.apiKey,
      "User-Agent": "Mozilla/5.0 (compatible; Forma/1.0)",
      Accept: "application/json",
    },
  });

  if (!resp.ok) {
    throw new Error(`Marktguru API error: ${resp.status}`);
  }

  const data = await resp.json();
  const offers: MarktguruOffer[] = data.results || data.offers || [];

  let filtered = offers;
  if (stores.length > 0) {
    const storeSet = new Set(stores.map((s) => s.toLowerCase().trim()));
    filtered = offers.filter((o) => o.advertisers.some((a) => storeSet.has(a.name.toLowerCase().trim())));
  }

  return filtered.slice(0, limit).map(normalizeMarktguruOffer);
}

export async function searchMarktguruDeals(
  query: string,
  zipCode?: string,
  stores?: string[]
): Promise<ImportedDeal[]> {
  return fetchMarktguruDeals(query, { zipCode: zipCode || DEFAULT_ZIP, stores: stores || [], limit: 50 });
}
