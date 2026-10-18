// Pure membership rules, shared in spirit with the admin app and the mock API (keep the three in sync).
export const todayStr = () => new Date().toISOString().slice(0, 10)

export const levelOf = (levels, lifetime) => {
  const s = [...levels].sort((a, b) => a.min - b.min)
  return [...s].reverse().find((l) => lifetime >= l.min) ?? s[0]
}
export const nextLevel = (levels, lifetime) => {
  const n = [...levels].sort((a, b) => a.min - b.min).find((l) => l.min > lifetime)
  return n ? { ...n, toGo: n.min - lifetime } : null
}
// Points earned for a paid total; the level multiplier applies (Gold 1.5x, Platinum 2x).
export const earnFor = (total, config, lifetime) => {
  const { earnPerRp, earnPts } = config.points
  const mult = levelOf(config.levels, lifetime)?.mult ?? 1
  return Math.floor(Math.floor(total / (earnPerRp || 1)) * earnPts * mult)
}
export const voucherDiscount = (subtotal, v) => (!v || subtotal < (v.min ?? 0) ? 0 : v.type === 'pct' ? Math.round((subtotal * v.value) / 100) : v.value)
export const usableVouchers = (all, codes, today = todayStr()) => all.filter((v) => codes.includes(v.code) && v.active && v.used < v.quota && v.until >= today)
// Whole blocks of points (e.g. 100 pts = Rp 5.000) a member may redeem against a payable amount.
export const redeemMax = (points, config, payable) => {
  const { redeemPts, redeemValue, minSubtotal } = config.points
  if (!redeemPts || payable < minSubtotal) return 0
  return Math.max(0, Math.min(Math.floor(points / redeemPts), Math.floor(payable / redeemValue)))
}
