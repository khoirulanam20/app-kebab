export const lineTotal = (l) => l.unit * l.qty

// coupon: { type: 'pct'|'flat', value, min }  fees: { taxPct, serviceFeePct, taxIncluded }  manual: extra discount in Rp
export function voucherDiscount(subtotal, coupon) {
  if (!coupon || subtotal < (coupon.min ?? 0)) return 0
  return coupon.type === 'pct' ? Math.round((subtotal * coupon.value) / 100) : coupon.value
}

export function cartTotals(lines, coupon, fees = {}, manual = 0) {
  const subtotal = lines.reduce((s, l) => s + lineTotal(l), 0)
  const discount = Math.min(voucherDiscount(subtotal, coupon) + manual, subtotal)
  const base = subtotal - discount
  const service = Math.round((base * (fees.serviceFeePct ?? 0)) / 100)
  const gross = base + service
  const pct = fees.taxPct ?? 0
  // tax already included in prices: extract it; otherwise add it on top
  const tax = fees.taxIncluded ? Math.round((gross * pct) / (100 + pct)) : Math.round((gross * pct) / 100)
  return { subtotal, discount, service, tax, total: fees.taxIncluded ? gross : gross + tax }
}

// Only cash can give change; overpaying with non-cash methods is invalid.
export function settle(total, { cash = 0, qris = 0, card = 0, transfer = 0 }) {
  const paid = cash + qris + card + transfer
  const remaining = Math.max(0, total - paid)
  const over = Math.max(0, paid - total)
  const change = Math.min(cash, over)
  const invalidOver = over - change
  return { paid, remaining, change, invalidOver, ok: remaining === 0 && invalidOver === 0 && total > 0 }
}
