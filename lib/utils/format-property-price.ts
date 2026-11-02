
import type { PropertyCurrency } from '@/lib/types'

// Formats a property price using its confirmed currency without converting the amount.
export function formatPropertyPrice(
  price: number,
  currency: PropertyCurrency | null,
): string {
  if (currency === null) {
    return `${price.toLocaleString('en-US')} — Currency unconfirmed`
  }

  const localeByCurrency: Record<PropertyCurrency, string> = {
    USD: 'en-US',
    NGN: 'en-NG',
    AED: 'en-AE',
  }

  return new Intl.NumberFormat(localeByCurrency[currency], {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(price)
}
