const FX_RATES: Record<string, number> = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  AUD: 0.64,
  CAD: 0.74,
  AED: 0.27,
  CHF: 1.13,
}

export function toUSD(amount: number, currency: string): number {
  const rate = FX_RATES[currency.toUpperCase()] || 1
  return Math.round(amount * rate * 100) / 100
}

export function formatCurrency(amount: number, currency: string = "EUR", locale: string = "es-ES"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
