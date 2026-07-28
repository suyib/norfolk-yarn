export function formatPrice(pricePennies: number) {
  return `£${(pricePennies / 100).toFixed(2)}`;
}
