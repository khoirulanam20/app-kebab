export const NOW = new Date('2026-10-18T12:00:00')
const DAY = 86400000
const MONTHS_HIST = [5200000, 5900000, 6100000, 6800000, 7300000]

// scale shrinks the sample history that pads days without real orders (use <1 for a single outlet)
export function series(kind, done, scale = 1) {
  const sum = (from, to) => done.filter((o) => { const t = new Date(o.createdAt).getTime(); return t >= from && t < to }).reduce((s, o) => s + o.total, 0)
  const end = new Date(NOW).setHours(23, 59, 59, 999) + 1
  if (kind === 'day') return Array.from({ length: 7 }, (_, i) => { const from = end - (7 - i) * DAY; return { label: new Date(from).toLocaleDateString('id-ID', { weekday: 'short' }), total: sum(from, from + DAY) + Math.round((180000 + i * 23000) * scale) } })
  if (kind === 'week') return Array.from({ length: 4 }, (_, i) => { const from = end - (4 - i) * 7 * DAY; return { label: `M-${4 - i}`, total: sum(from, from + 7 * DAY) + Math.round((1400000 + i * 210000) * scale) } })
  return [...MONTHS_HIST.map((t, i) => ({ label: new Date(2026, 4 + i, 1).toLocaleDateString('id-ID', { month: 'short' }), total: Math.round(t * scale) })), { label: 'Okt', total: sum(new Date(2026, 9, 1).getTime(), end) + Math.round(3600000 * scale) }]
}

