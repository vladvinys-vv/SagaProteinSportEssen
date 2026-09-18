export function formatCurrency(cents: number, locale = "de-DE") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function getCartItemKey(productId: string, variantId: string) {
  return `${productId}:${variantId}`;
}
