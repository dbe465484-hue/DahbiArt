export type ShippingZone = 'MA' | 'EU' | 'INTL';

const EU_COUNTRIES = new Set([
  'FR',
  'BE',
  'CH',
  'ES',
  'DE',
  'IT',
  'PT',
  'NL',
  'LU',
  'GB',
  'UK',
  'AT',
  'IE',
  'DK',
  'SE',
  'NO',
  'FI',
  'PL',
  'CZ',
  'GR',
]);

export function resolveShippingZone(countryCode: string): ShippingZone {
  const c = countryCode.trim().toUpperCase();
  if (c === 'MA' || c === 'MAR' || c === 'MOROCCO' || c === 'MAROC') {
    return 'MA';
  }
  if (EU_COUNTRIES.has(c)) return 'EU';
  return 'INTL';
}

export function shippingAmountForZone(
  zone: ShippingZone,
  env: {
    ma?: string;
    eu?: string;
    intl?: string;
    flatFallback?: string;
  },
): number {
  const parse = (v: string | undefined, fallback: number) => {
    const n = parseFloat(v ?? '');
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  switch (zone) {
    case 'MA':
      return parse(env.ma, parse(env.flatFallback, 49));
    case 'EU':
      return parse(env.eu, parse(env.flatFallback, 89));
    default:
      return parse(env.intl, parse(env.flatFallback, 129));
  }
}

export function shippingLabel(zone: ShippingZone): string {
  switch (zone) {
    case 'MA':
      return 'Maroc';
    case 'EU':
      return 'Europe';
    default:
      return 'International';
  }
}
