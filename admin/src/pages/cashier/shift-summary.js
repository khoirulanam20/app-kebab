// Totals for the open shift, derived from sales recorded by completeSale.
export function shiftSummary(shift) {
  const sales = shift?.sales ?? []
  const sum = (k) => sales.reduce((s, x) => s + x[k], 0)
  const opening = shift?.openingCash ?? 0
  const cash = sum('cash')
  return { opening, cash, qris: sum('qris'), card: sum('card'), transfer: sum('transfer'), total: sum('total'), count: sales.length, expected: opening + cash }
}
