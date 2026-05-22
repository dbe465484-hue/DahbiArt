/** Tarifs livraison — garder alignés avec backend (SHIPPING_*_EUR). */
export type ShippingZone = "MA" | "EU" | "INTL";

const EU = new Set([
  "FR", "BE", "CH", "ES", "DE", "IT", "PT", "NL", "LU", "GB", "UK",
  "AT", "IE", "DK", "SE", "NO", "FI", "PL", "CZ", "GR",
]);

export function resolveShippingZone(countryCode: string): ShippingZone {
  const c = countryCode.trim().toUpperCase();
  if (c === "MA" || c === "MAR") return "MA";
  if (EU.has(c)) return "EU";
  return "INTL";
}

const MA_EUR = Number(process.env.NEXT_PUBLIC_SHIPPING_MA_EUR ?? "49") || 49;
const EU_EUR = Number(process.env.NEXT_PUBLIC_SHIPPING_EU_EUR ?? "89") || 89;
const INTL_EUR = Number(process.env.NEXT_PUBLIC_SHIPPING_INTL_EUR ?? "129") || 129;
const FLAT_LEGACY = Number(process.env.NEXT_PUBLIC_SHIPPING_FLAT_EUR ?? "");

export function shippingCostEur(countryCode: string): number {
  if (FLAT_LEGACY > 0) return FLAT_LEGACY;
  const zone = resolveShippingZone(countryCode);
  if (zone === "MA") return MA_EUR;
  if (zone === "EU") return EU_EUR;
  return INTL_EUR;
}

export function shippingZoneLabel(zone: ShippingZone): string {
  if (zone === "MA") return "Maroc";
  if (zone === "EU") return "Europe";
  return "International";
}

export function shippingDelayHint(zone: ShippingZone): string {
  if (zone === "MA") return "5 à 10 jours ouvrés";
  if (zone === "EU") return "10 à 20 jours ouvrés";
  return "15 à 30 jours ouvrés";
}
