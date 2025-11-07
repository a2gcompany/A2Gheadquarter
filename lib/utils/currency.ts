export function formatCurrency(amount: number, currency: string = "EUR", locale: string = "es-ES"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
