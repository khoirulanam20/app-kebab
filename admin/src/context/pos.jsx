import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { api } from '@/lib/api'
import { earnFor, levelOf, nextLevel, redeemMax } from '@/lib/membership'
import { cartTotals } from '@/lib/pricing'
import { FEATURES } from '@/features'
import { getAccounts, getSeed, tenants } from '@/seeds'

const Ctx = createContext()
export const usePos = () => useContext(Ctx)

const DATA_KEYS = ['categories', 'products', 'optionGroups', 'outlets', 'ingredients', 'recipes', 'movements', 'vouchers', 'banners', 'flashSales', 'members', 'missions', 'broadcasts', 'customers', 'reviews', 'orders', 'holds', 'staff', 'perms', 'log', 'settings', 'backups', 'faq', 'paymentMethods', 'pastShifts']
const cap = (k) => k[0].toUpperCase() + k.slice(1)

const load = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback } }
const save = (key, v) => { try { v == null ? localStorage.removeItem(key) : localStorage.setItem(key, JSON.stringify(v)) } catch { /* storage unavailable */ } }

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const o = ctx.createOscillator(); const g = ctx.createGain()
    o.frequency.value = 880; g.gain.value = 0.15; o.connect(g); g.connect(ctx.destination)
    o.start(); o.stop(ctx.currentTime + 0.25)
  } catch { /* audio blocked */ }
}

const digits = (v) => String(v ?? '').replace(/\D/g, '')
const toCustomer = (m) => ({ id: m.id, code: m.code, name: m.name, phone: m.phone, points: m.points, lifetime: m.lifetime, orders: m.orders, joined: m.joined, last: m.last, blocked: m.blocked, vouchers: m.vouchers, referralCode: m.referralCode })
const toLocalOrder = (o) => ({
  id: o.id, api: true, createdAt: o.createdAt, source: o.source, status: o.status, outletId: o.outletId, cashier: o.cashier, customer: o.customer, memberCode: o.memberCode,
  method: o.method, delivery: o.delivery, mode: o.mode, address: o.address, courier: o.courier ?? null, items: o.items, subtotal: o.subtotal, discount: o.discount, total: o.total,
  redeemPts: o.redeemPts, voucher: o.voucher, earned: o.earned, pickupCode: o.pickupCode, readyAt: o.readyAt, pickedUpAt: o.pickedUpAt,
})
const mergeOrders = (cur, fromApi) => {
  const map = new Map(cur.map((o) => [o.id, o]))
  fromApi.forEach((o) => map.set(o.id, { ...(map.get(o.id) ?? {}), ...toLocalOrder(o) }))
  return [...map.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

// Outer provider owns the session; the inner provider is re-mounted per tenant so each tenant gets its own data.
export function PosProvider({ children }) {
  const [user, setUser] = useState(() => { const u = load('knm-admin-user', null); return u?.id ? u : null })
  useEffect(() => save('knm-admin-user', user), [user])
  // returns an error message, or null on success
  const login = ({ email, password }) => {
    const acc = getAccounts().find((a) => a.email.toLowerCase() === email.trim().toLowerCase())
    if (!acc || acc.password !== password || !acc.active) return 'Email atau kata sandi salah.'
    setUser({ id: acc.id, tenantId: acc.tenantId, role: acc.role, email: acc.email, name: acc.name, outletId: acc.outletId })
    return null
  }
  const logout = () => setUser(null)
  return <Inner key={user?.tenantId ?? 'none'} user={user} login={login} logout={logout}>{children}</Inner>
}

function Inner({ user, login, logout, children }) {
  const baseTenant = tenants.find((t) => t.id === user?.tenantId) ?? null
  const seed = useMemo(() => getSeed(user?.tenantId ?? 'kebabnme'), [user?.tenantId])
  const data = {}
  const setters = {}
  DATA_KEYS.forEach((k) => { const [v, s] = useState(seed[k]); data[k] = v; setters['set' + cap(k)] = s }) // eslint-disable-line react-hooks/rules-of-hooks

  const shiftKey = `knm-admin-shift-${user?.tenantId}-${user?.id}`
  const [shift, setShift] = useState(() => load(shiftKey, null))
  const [lines, setLines] = useState([])
  const [pickedCustomer, setCustomer] = useState(null)
  const [couponCode, setCouponCode] = useState('')
  const [manualDiscount, setManualDiscount] = useState(0)
  const [note, setNote] = useState('')
  const [toast, setToast] = useState(null)
  const [offline, setOffline] = useState(false)
  const [soundOn, setSoundOn] = useState(true)
  const incoming = useRef(0)
  const [apiOnline, setApiOnline] = useState(false)
  const [redeemBlocks, setRedeemBlocks] = useState(0)
  const lastSrv = useRef({ pushAt: 0 }) // JSON of the last server value per resource, so our own pushes are not echoed back
  const seenOrders = useRef(null)

  useEffect(() => save(shiftKey, shift), [shift, shiftKey])
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2200); return () => clearTimeout(t) }, [toast])

  const notify = useCallback((m) => setToast(m), [])
  const { setLog, setOrders, setProducts, setIngredients, setMovements, setVouchers, setHolds, setCustomers } = setters
  const logAction = useCallback((text) => setLog((l) => [{ id: Date.now() + Math.random(), at: new Date().toISOString(), who: user?.name ?? '-', text }, ...l]), [setLog, user?.name])

  // tenant name and logo follow the business profile so edits show everywhere
  const tenant = baseTenant && { ...baseTenant, name: data.settings.business.name || baseTenant.name, logo: data.settings.business.logo ?? baseTenant.logo }
  const can = (key) => (key === 'stock' && !FEATURES.stock ? false : !!data.perms[user?.role]?.[key])
  // staff below Owner work inside their own outlet; Owner looks at outlets via the Outlet menu
  const outletId = user?.role === 'Owner' ? (shift?.outletId ?? data.outlets[0]?.id) : (user?.outletId ?? data.outlets[0]?.id)
  const outlet = data.outlets.find((o) => o.id === outletId)

  // ---- catalog helpers (price per outlet, flash sale, availability) ----
  const flashFor = (p) => {
    const now = Date.now()
    return data.flashSales.find((f) => f.active && f.pid === p.id && now >= new Date(f.from).getTime() && now <= new Date(f.to).getTime())
  }
  const priceFor = (p) => flashFor(p)?.price ?? p.outletPrice?.[outletId] ?? p.price
  const availability = (p) => {
    if (!p.active) return { ok: false, reason: 'Nonaktif' }
    if (p.stock <= 0) return { ok: false, reason: 'Habis' }
    if (p.outlets && !p.outlets.includes(outletId)) return { ok: false, reason: 'Tidak di cabang ini' }
    if (p.schedule) {
      const hm = new Date().toTimeString().slice(0, 5)
      if (hm < p.schedule.from || hm > p.schedule.to) return { ok: false, reason: `Jam ${p.schedule.from}–${p.schedule.to}` }
    }
    return { ok: true }
  }

  // ---- cart ----
  const coupon = data.vouchers.find((v) => v.code === couponCode && v.active && v.used < v.quota && v.until >= new Date().toISOString().slice(0, 10)) ?? null
  const fees = data.settings.fees
  // the picked member always reflects the latest synced points/level
  const customer = pickedCustomer && (data.customers.find((c) => c.id === pickedCustomer.id) ?? pickedCustomer)
  const loyalty = { points: data.settings.points, levels: data.members }
  const baseTotals = useMemo(() => cartTotals(lines, coupon, fees, manualDiscount), [lines, coupon, fees, manualDiscount])
  const maxBlocks = customer && !customer.blocked ? redeemMax(customer.points, loyalty, baseTotals.total) : 0
  const useBlocks = Math.min(redeemBlocks, maxBlocks)
  const pointsDiscount = useBlocks * data.settings.points.redeemValue
  const redeem = { blocks: useBlocks, max: maxBlocks, pts: useBlocks * data.settings.points.redeemPts, value: pointsDiscount }
  const totals = useMemo(() => cartTotals(lines, coupon, fees, manualDiscount + pointsDiscount), [lines, coupon, fees, manualDiscount, pointsDiscount])
  const levelFor = (c) => levelOf(data.members, c?.lifetime ?? c?.points ?? 0)
  const nextFor = (c) => nextLevel(data.members, c?.lifetime ?? c?.points ?? 0)
  const count = lines.reduce((s, l) => s + l.qty, 0)

  const addLine = (p, opts = '', unit = priceFor(p), qty = 1) => setLines((cur) => {
    const key = `${p.id}|${opts}`
    const hit = cur.find((l) => l.key === key)
    if (hit) return cur.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l))
    return [...cur, { key, pid: p.id, name: p.name, unit, qty, opts, cat: p.cat }]
  })
  const setQty = (key, qty) => setLines((cur) => (qty < 1 ? cur.filter((l) => l.key !== key) : cur.map((l) => (l.key === key ? { ...l, qty } : l))))
  const clearCart = () => { setLines([]); setCustomer(null); setCouponCode(''); setManualDiscount(0); setNote(''); setRedeemBlocks(0) }

  const holdCart = () => {
    if (!lines.length) return
    setHolds((h) => [{ id: `H-${String(h.length + 1).padStart(2, '0')}`, label: customer?.name ?? `Hold ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`, createdAt: new Date().toISOString(), customer, lines }, ...h])
    clearCart(); notify('Keranjang di-hold')
  }
  const resumeHold = (id) => {
    const h = data.holds.find((x) => x.id === id)
    if (!h) return
    setLines(h.lines); setCustomer(h.customer); setHolds((cur) => cur.filter((x) => x.id !== id))
  }
  const deleteHold = (id) => setHolds((cur) => cur.filter((x) => x.id !== id))
  // registers a member on the server when it is reachable (the server issues the member code), otherwise locally
  const addCustomer = async (c) => {
    if (apiOnline) {
      try {
        const m = await api('/api/members', { method: 'POST', body: { name: c.name, phone: c.phone } })
        const created = toCustomer(m)
        setCustomers((cur) => [created, ...cur.filter((x) => x.id !== created.id)])
        return created
      } catch (e) { notify(e.status === 409 ? 'Nomor HP sudah terdaftar sebagai member' : `Gagal mendaftar: ${e.message}`); return null }
    }
    const id = Date.now()
    const created = { id, code: `KNM-M-L${String(id).slice(-5)}`, points: 0, lifetime: 0, orders: 0, joined: new Date().toISOString().slice(0, 10), last: null, blocked: false, vouchers: [], referralCode: '', ...c }
    setCustomers((cur) => [created, ...cur]); return created
  }
  const applyMember = (m) => setCustomers((cur) => cur.map((x) => (x.code === m.code ? toCustomer(m) : x)))
  const lookupMember = async (ref) => {
    const raw = String(ref ?? '').trim()
    if (!raw) return null
    const local = data.customers.find((c) => c.code.toLowerCase() === raw.toLowerCase() || (digits(raw).length >= 8 && digits(c.phone) === digits(raw)))
    if (local || !apiOnline) return local ?? null
    try { const m = toCustomer(await api(`/api/members/${encodeURIComponent(raw)}`)); setCustomers((cur) => (cur.some((x) => x.id === m.id) ? cur : [m, ...cur])); return m } catch { return null }
  }
  const adjustPoints = async (code, pts, note) => {
    if (apiOnline) {
      try { applyMember(await api(`/api/members/${code}/points`, { method: 'POST', body: { pts, note, by: user?.name } })); logAction(`${pts > 0 ? 'Menambah' : 'Mengurangi'} ${Math.abs(pts)} poin ${code}: ${note || '-'}`); return true } catch (e) { notify(e.message === 'insufficient points' ? 'Poin tidak cukup' : `Gagal: ${e.message}`); return false }
    }
    const c = data.customers.find((x) => x.code === code)
    if (c.points + pts < 0) { notify('Poin tidak cukup'); return false }
    setCustomers((cur) => cur.map((x) => (x.code === code ? { ...x, points: x.points + pts, lifetime: pts > 0 ? (x.lifetime ?? x.points) + pts : x.lifetime } : x)))
    logAction(`${pts > 0 ? 'Menambah' : 'Mengurangi'} ${Math.abs(pts)} poin ${code} (lokal)`); return true
  }
  const assignVoucher = async (code, voucher) => {
    if (apiOnline) { try { applyMember(await api(`/api/members/${code}/vouchers`, { method: 'POST', body: { code: voucher } })) } catch (e) { return notify(`Gagal: ${e.message}`) } }
    else setCustomers((cur) => cur.map((x) => (x.code === code && !x.vouchers.includes(voucher) ? { ...x, vouchers: [...x.vouchers, voucher] } : x)))
    logAction(`Memberi voucher ${voucher} ke ${code}`)
  }
  const setBlocked = async (code, blocked) => {
    if (apiOnline) { try { applyMember(await api(`/api/members/${code}`, { method: 'PATCH', body: { blocked } })) } catch (e) { return notify(`Gagal: ${e.message}`) } }
    else setCustomers((cur) => cur.map((x) => (x.code === code ? { ...x, blocked } : x)))
    logAction(`${blocked ? 'Memblokir' : 'Membuka blokir'} member ${code}`)
  }

  // ---- shift ----
  const openShift = (openingCash, outletIdArg) => { setShift({ openedAt: new Date().toISOString(), openingCash, outletId: outletIdArg, sales: [] }); logAction(`Membuka shift dengan saldo Rp ${openingCash.toLocaleString('id-ID')}`) }
  const closeShift = () => { logAction('Menutup shift'); setShift(null) }

  // ---- stock deduction by recipe ----
  const deductStock = (items, orderId) => {
    const used = {}
    items.forEach((i) => (data.recipes[i.pid] ?? []).forEach(([ing, q]) => { used[ing] = (used[ing] ?? 0) + q * i.qty }))
    setIngredients((cur) => cur.map((g) => (used[g.id] ? { ...g, stock: Math.max(0, +(g.stock - used[g.id]).toFixed(3)) } : g)))
    setMovements((m) => [...Object.entries(used).map(([ing, q]) => ({ id: Date.now() + Number(ing), at: new Date().toISOString(), ingredient: data.ingredients.find((g) => g.id === Number(ing))?.name, type: 'Penjualan', qty: -+q.toFixed(3), note: orderId })), ...m])
    setProducts((cur) => cur.map((p) => { const it = items.find((i) => i.pid === p.id); return it ? { ...p, stock: Math.max(0, p.stock - it.qty) } : p }))
  }

  // Member sales go through the server so points are credited once, in one place. Without the server the same rules run locally.
  const completeSale = async ({ cash = 0, qris = 0, card = 0, transfer = 0, change = 0 }) => {
    const used = [cash && 'Tunai', qris && 'QRIS', card && 'Kartu', transfer && 'Transfer'].filter(Boolean)
    const member = customer
    let order = {
      id: `KNM-${1100 + data.orders.length}`, createdAt: new Date().toISOString(), source: 'POS', status: 'Selesai', outletId: shift?.outletId ?? 1,
      cashier: user?.name ?? 'Kasir', customer: member?.name ?? 'Walk-in', memberCode: member?.code ?? null, method: used.length > 1 ? 'Split' : used[0] ?? 'Tunai', delivery: false, courier: null,
      items: lines.map((l) => ({ pid: l.pid, qty: l.qty, name: l.name, price: l.unit, opts: l.opts })), subtotal: totals.subtotal, discount: totals.discount, service: totals.service, tax: totals.tax, total: totals.total,
      paid: { cash, qris, card, transfer }, change, voucher: coupon?.code ?? null, redeemPts: redeem.pts, earned: null, pendingSync: offline,
    }
    if (member && apiOnline && !offline) {
      try {
        const { order: srv, member: m } = await api('/api/orders', { method: 'POST', body: { source: 'POS', memberCode: member.code, outletId: order.outletId, items: order.items, subtotal: order.subtotal, discount: order.discount, total: order.total, method: order.method, cashier: order.cashier, redeemPts: redeem.pts, voucher: order.voucher, status: 'Selesai' } })
        order = { ...order, id: srv.id, createdAt: srv.createdAt, earned: srv.earned, api: true }
        applyMember(m)
      } catch (e) { notify(`Server menolak (${e.message}). Disimpan lokal.`) }
    }
    if (!order.api && member) {
      const earned = earnFor(order.total, loyalty, member.lifetime ?? member.points)
      order.earned = earned
      setCustomers((cur) => cur.map((x) => (x.id === member.id ? { ...x, points: x.points - redeem.pts + earned, lifetime: (x.lifetime ?? x.points) + earned, orders: x.orders + 1, last: order.createdAt.slice(0, 10) } : x)))
    }
    setOrders((o) => [order, ...o])
    if (coupon && !order.api) setVouchers((v) => v.map((x) => (x.id === coupon.id ? { ...x, used: x.used + 1 } : x)))
    deductStock(order.items, order.id)
    setShift((s) => (s ? { ...s, sales: [...(s.sales ?? []), { id: order.id, total: order.total, cash: Math.max(0, cash - change), qris, card, transfer }] } : s))
    clearCart()
    return order
  }

  // ---- order management ----
  const updateOrder = (id, patch, text) => {
    const cur = data.orders.find((x) => x.id === id)
    const p = { ...patch }
    if (p.status === 'Siap' && !cur?.readyAt) p.readyAt = new Date().toISOString()
    if (p.status === 'Selesai' && cur?.pickupCode) p.pickedUpAt = new Date().toISOString()
    setOrders((o) => o.map((x) => (x.id === id ? { ...x, ...p } : x)))
    if (text) logAction(text)
    // orders that came from / belong to the shared backend: the customer app and points follow this status
    if (cur?.api && apiOnline) {
      const body = Object.fromEntries(['status', 'courier', 'refundReason', 'voidReason', 'handedOverBy'].filter((k) => k in p).map((k) => [k, p[k]]))
      api(`/api/orders/${id}`, { method: 'PATCH', body }).then(({ member }) => member && applyMember(member)).catch(() => notify('Gagal menyinkronkan ke server'))
    }
  }
  // Pickup handover: the customer shows a 4-digit code or the QR from the app. Returns an error message or null.
  const verifyPickup = (order, input) => {
    const raw = String(input ?? '').trim()
    const parts = raw.split('|')
    const isQr = parts[0] === 'KNM-PICKUP'
    if (isQr && parts[1] !== order.id) return 'QR ini untuk pesanan lain.'
    if (!order.pickupCode || (isQr ? parts[2] : raw) !== order.pickupCode) return 'Kode ambil tidak cocok.'
    return null
  }
  const handoverPickup = (order, input) => {
    const err = verifyPickup(order, input)
    if (err) return err
    updateOrder(order.id, { status: 'Selesai', handedOverBy: user?.name }, `Menyerahkan pesanan pickup ${order.id} (${order.customer})`)
    return null
  }
  const markNoShow = (order) => updateOrder(order.id, { status: 'Tidak diambil' }, `Pesanan pickup ${order.id} tidak diambil`)
  const voidOrder = (id, pin, reason) => {
    if (pin !== data.settings.ownerPin) return false
    updateOrder(id, { status: 'Void', voidReason: reason }, `Void pesanan ${id}: ${reason || 'tanpa alasan'}`)
    return true
  }
  const syncOffline = () => { const n = data.orders.filter((o) => o.pendingSync).length; setOrders((o) => o.map((x) => (x.pendingSync ? { ...x, pendingSync: false } : x))); return n }
  const simulateIncoming = () => {
    const pool = data.products.filter((p) => p.active && p.stock > 0)
    if (!pool.length) return
    const p = pool[incoming.current++ % pool.length]
    const prefix = 'KNM'
    const order = {
      id: `${prefix}-${1200 + data.orders.length}`, createdAt: new Date().toISOString(), source: 'Online', status: data.settings.orders.autoAccept ? 'Diproses' : 'Menunggu', outletId: outletId, cashier: '-',
      customer: data.customers[0]?.name ?? 'Pelanggan', method: 'QRIS', delivery: incoming.current % 2 === 0, address: 'Jl. Contoh No. 1', courier: null,
      items: [{ pid: p.id, qty: 1, name: p.name, price: p.price }], subtotal: p.price, discount: 0, total: p.price,
    }
    setOrders((o) => [order, ...o]); notify(`Pesanan baru ${order.id}${data.settings.orders.autoAccept ? ' (diterima otomatis)' : ''}`); if (soundOn) beep()
  }

  // ---- shared backend sync (members, points, vouchers, membership rules, online orders) ----
  useEffect(() => {
    if (!user) return
    let alive = true
    let first = true
    const pull = async () => {
      try {
        const st = await api('/api/state')
        if (!alive) return
        setApiOnline(true)
        const L = lastSrv.current
        const recentlyPushed = Date.now() - L.pushAt < 1500
        const cj = JSON.stringify(st.config)
        if (cj !== L.config && !recentlyPushed) { L.config = cj; setters.setSettings((x) => ({ ...x, points: st.config.points, referral: st.config.referral, stamp: st.config.stamp ?? x.stamp })); setters.setMembers(st.config.levels) }
        const vj = JSON.stringify(st.vouchers)
        if (vj !== L.vouchers && !recentlyPushed) { L.vouchers = vj; setVouchers(st.vouchers) }
        const mj = JSON.stringify(st.members)
        if (mj !== L.members) { L.members = mj; setCustomers(st.members.map(toCustomer)) }
        const oj = JSON.stringify(st.orders)
        if (oj !== L.orders) {
          L.orders = oj
          const fresh = st.orders.filter((o) => seenOrders.current && !seenOrders.current.has(o.id) && o.source === 'Online' && o.status === 'Menunggu')
          seenOrders.current = new Set(st.orders.map((o) => o.id))
          setOrders((cur) => mergeOrders(cur, st.orders))
          if (!first && fresh.length) { setToast(`Pesanan baru dari aplikasi: ${fresh.map((o) => o.id).join(', ')}`); beep() }
        } else if (!seenOrders.current) seenOrders.current = new Set(st.orders.map((o) => o.id))
        first = false
      } catch { if (alive) setApiOnline(false) }
    }
    pull()
    const t = setInterval(pull, 4000)
    return () => { alive = false; clearInterval(t) }
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // push local edits of membership rules and vouchers (debounced), skipping values that came from the server
  useEffect(() => {
    if (!apiOnline) return
    const cfg = { points: data.settings.points, levels: data.members, referral: data.settings.referral, stamp: data.settings.stamp }
    const j = JSON.stringify(cfg)
    if (j === lastSrv.current.config) return
    const t = setTimeout(() => { lastSrv.current.config = j; lastSrv.current.pushAt = Date.now(); api('/api/membership/config', { method: 'PUT', body: cfg }).catch(() => {}) }, 500)
    return () => clearTimeout(t)
  }, [apiOnline, data.settings.points, data.members, data.settings.referral, data.settings.stamp])
  useEffect(() => {
    if (!apiOnline) return
    const j = JSON.stringify(data.vouchers)
    if (j === lastSrv.current.vouchers) return
    const t = setTimeout(() => { lastSrv.current.vouchers = j; lastSrv.current.pushAt = Date.now(); api('/api/vouchers', { method: 'PUT', body: data.vouchers }).catch(() => {}) }, 500)
    return () => clearTimeout(t)
  }, [apiOnline, data.vouchers])

  const value = {
    apiOnline, redeem, setRedeemBlocks, levelFor, nextFor, lookupMember, adjustPoints, assignVoucher, setBlocked, verifyPickup, handoverPickup, markNoShow,
    user, tenant, login, logout, can, shift, outlet, outletId, openShift, closeShift, lines, addLine, setQty, clearCart, customer, setCustomer, couponCode, setCouponCode, coupon, manualDiscount, setManualDiscount, note, setNote, totals, count,
    holdCart, resumeHold, deleteHold, addCustomer, completeSale, updateOrder, voidOrder, syncOffline, simulateIncoming, offline, setOffline, soundOn, setSoundOn, priceFor, flashFor, availability, logAction, toast, notify,
    ...data, ...setters,
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
