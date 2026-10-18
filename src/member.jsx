import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { api } from './api.js'
import { GOLD_AT, MEMBER_CODE, POINTS, outlets } from './data.js'
import { earnFor, levelOf, nextLevel, redeemMax, usableVouchers } from './lib/membership.js'

const Ctx = createContext()
export const useMember = () => useContext(Ctx)

const ACTIVE = ['Menunggu', 'Diproses', 'Siap', 'Dikirim']
export const STATUS_TEXT = (o) => ({ Menunggu: 'Menunggu konfirmasi', Diproses: 'Sedang dibuat', Siap: o.delivery ? 'Siap dikirim' : 'Siap diambil', Dikirim: 'Dalam perjalanan', Selesai: 'Selesai', Dibatalkan: 'Dibatalkan', Refund: 'Dibatalkan', Void: 'Dibatalkan', 'Tidak diambil': 'Tidak diambil' })[o.status] ?? o.status

// What the app shows when the API is not running, so the prototype still works standalone.
const DEMO_CONFIG = {
  points: { earnPerRp: 10000, earnPts: 1, redeemPts: 100, redeemValue: 5000, minSubtotal: 10000 },
  levels: [{ name: 'Silver', min: 0, mult: 1, benefit: 'Poin 1× dan voucher ulang tahun' }, { name: 'Gold', min: GOLD_AT, mult: 1.5, benefit: 'Poin 1,5× dan gratis ongkir 2×/bulan' }, { name: 'Platinum', min: 3000, mult: 2, benefit: 'Poin 2× dan menu spesial pelanggan setia' }],
  referral: { reward: 15000, active: true },
}
const DEMO = { member: { code: MEMBER_CODE, name: 'Khoirul Anam', points: POINTS, lifetime: POINTS, vouchers: [], referralCode: 'ANAM15' }, config: DEMO_CONFIG, vouchers: [], ledger: [], orders: [] }

const toCard = (o) => ({
  id: o.id, api: true, active: ACTIVE.includes(o.status), rawStatus: o.status, status: STATUS_TEXT(o), total: o.total, mode: o.mode, delivery: o.delivery,
  outlet: o.delivery ? 'Antar ke rumah' : outlets.find((x) => x.id === o.outletId)?.name ?? 'Kebab N Me',
  date: new Date(o.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
  items: o.items.map((i) => `${i.name} ×${i.qty}`).join(', '), lines: o.items.map((i) => ({ pid: i.pid, qty: i.qty })),
  pickupCode: o.pickupCode, earned: o.earned, redeemPts: o.redeemPts, seq: o.seq,
})

export function MemberProvider({ children }) {
  const code = MEMBER_CODE // single demo user; a login would set this
  const [state, setState] = useState({ ...DEMO, online: false, loading: true })
  const last = useRef('')

  const refresh = useCallback(async () => {
    try {
      const [member, config, vouchers, ledger, orders] = await Promise.all([api(`/api/members/${code}`), api('/api/membership/config'), api('/api/vouchers'), api(`/api/members/${code}/ledger`), api(`/api/orders?member=${code}`)])
      const next = { member, config, vouchers, ledger, orders, online: true, loading: false }
      const j = JSON.stringify(next)
      if (j !== last.current) { last.current = j; setState(next) } // skip re-render when nothing changed
    } catch {
      last.current = ''
      setState((s) => (s.online || s.loading ? { ...DEMO, online: false, loading: false } : s))
    }
  }, [code])

  useEffect(() => {
    refresh()
    const t = setInterval(refresh, 4000)
    window.addEventListener('focus', refresh)
    return () => { clearInterval(t); window.removeEventListener('focus', refresh) }
  }, [refresh])

  const value = useMemo(() => {
    const { member, config, vouchers, orders } = state
    return {
      ...state, refresh,
      level: levelOf(config.levels, member.lifetime), next: nextLevel(config.levels, member.lifetime),
      owned: usableVouchers(vouchers, member.vouchers ?? []),
      earnPreview: (total) => earnFor(total, config, member.lifetime),
      redeemMax: (payable) => redeemMax(member.points, config, payable),
      apiOrders: orders.map(toCard),
    }
  }, [state, refresh])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
