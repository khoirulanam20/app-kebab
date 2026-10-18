// Mock backend shared by the customer app (:5173) and the admin app (:5174).
// Zero dependencies; state persists to mock-api/db.json. Reset by deleting that file.
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const FILE = path.join(here, 'db.json')
const PORT = Number(process.env.PORT ?? 4000)
const ACTIVE = ['Menunggu', 'Diproses', 'Siap', 'Dikirim']

const seed = () => ({
  seq: 1,
  config: {
    points: { earnPerRp: 10000, earnPts: 1, redeemPts: 100, redeemValue: 5000, minSubtotal: 10000 },
    levels: [
      { id: 1, name: 'Silver', min: 0, mult: 1, benefit: 'Poin 1× dan voucher ulang tahun' },
      { id: 2, name: 'Gold', min: 1000, mult: 1.5, benefit: 'Poin 1,5× dan gratis ongkir 2×/bulan' },
      { id: 3, name: 'Platinum', min: 3000, mult: 2, benefit: 'Poin 2× dan menu spesial pelanggan setia' },
    ],
    referral: { reward: 15000, active: true },
    stamp: { buy: 5, free: 1, active: true },
  },
  vouchers: [
    { id: 1, code: 'ABANG10', type: 'pct', value: 10, min: 20000, quota: 200, used: 34, until: '2026-12-31', active: true },
    { id: 2, code: 'HEMAT5K', type: 'flat', value: 5000, min: 30000, quota: 100, used: 61, until: '2026-11-30', active: true },
    { id: 3, code: 'KAMPUS15', type: 'pct', value: 15, min: 50000, quota: 50, used: 50, until: '2026-10-31', active: true },
  ],
  members: [
    { id: 1, code: 'KNM-MEMBER-948221', name: 'Khoirul Anam', phone: '0812-3456-7890', points: 948, lifetime: 948, orders: 3, joined: '2026-01-05', last: '2026-10-12', blocked: false, vouchers: ['ABANG10'], referralCode: 'ANAM15', referredBy: null, refRewarded: false },
    { id: 2, code: 'KNM-M-000002', name: 'Dewi Lestari', phone: '0812-5555-0101', points: 320, lifetime: 520, orders: 14, joined: '2026-03-12', last: '2026-10-16', blocked: false, vouchers: ['ABANG10'], referralCode: 'DEWI15', referredBy: null, refRewarded: false },
    { id: 3, code: 'KNM-M-000003', name: 'Budi Santoso', phone: '0813-7777-0202', points: 1180, lifetime: 3150, orders: 41, joined: '2026-01-05', last: '2026-10-17', blocked: false, vouchers: [], referralCode: 'BUDI15', referredBy: null, refRewarded: false },
    { id: 4, code: 'KNM-M-000004', name: 'Rina Marlina', phone: '0857-8888-0303', points: 90, lifetime: 90, orders: 4, joined: '2026-09-21', last: '2026-10-02', blocked: false, vouchers: [], referralCode: 'RINA15', referredBy: null, refRewarded: false },
    { id: 5, code: 'KNM-M-000005', name: 'Andi Pratama', phone: '0821-9999-0404', points: 640, lifetime: 1240, orders: 22, joined: '2026-02-18', last: '2026-08-04', blocked: false, vouchers: [], referralCode: 'ANDI15', referredBy: null, refRewarded: false },
    { id: 6, code: 'KNM-M-000006', name: 'Siti Nurhaliza', phone: '0878-1212-0505', points: 15, lifetime: 15, orders: 1, joined: '2026-10-11', last: '2026-10-11', blocked: false, vouchers: [], referralCode: 'SITI15', referredBy: null, refRewarded: false },
  ],
  ledger: [
    { id: 1, code: 'KNM-MEMBER-948221', at: '2026-10-12T12:30:00', type: 'earn', pts: 3, note: 'Pesanan KNM-1210', ref: 'KNM-1210', by: 'sistem' },
    { id: 2, code: 'KNM-MEMBER-948221', at: '2026-09-28T19:20:00', type: 'earn', pts: 3, note: 'Pesanan KNM-0928', ref: 'KNM-0928', by: 'sistem' },
    { id: 3, code: 'KNM-MEMBER-948221', at: '2026-09-01T10:00:00', type: 'bonus', pts: 100, note: 'Bonus gabung member', ref: null, by: 'sistem' },
  ],
  orders: [],
})

let db = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : seed()
const save = () => fs.writeFileSync(FILE, JSON.stringify(db, null, 2))
const next = () => db.seq++
const now = () => new Date().toISOString()

const levels = () => [...db.config.levels].sort((a, b) => a.min - b.min)
const levelOf = (lifetime) => [...levels()].reverse().find((l) => lifetime >= l.min) ?? levels()[0]
const view = (m) => {
  const level = levelOf(m.lifetime)
  const nx = levels().find((l) => l.min > m.lifetime)
  return { ...m, level, next: nx ? { ...nx, toGo: nx.min - m.lifetime } : null }
}
const findMember = (ref) => db.members.find((m) => m.code === ref || m.phone.replace(/\D/g, '') === String(ref).replace(/\D/g, '') || String(m.id) === String(ref))
const ledger = (code, type, pts, note, ref = null, by = 'sistem') => { const e = { id: next(), code, at: now(), type, pts, note, ref, by }; db.ledger.push(e); return e }
const earnFor = (m, total) => {
  const { earnPerRp, earnPts } = db.config.points
  return Math.floor(Math.floor(total / (earnPerRp || 1)) * earnPts * (levelOf(m.lifetime).mult ?? 1))
}
// credit points for a finished order, once
function creditOrder(o) {
  const m = o.memberCode && findMember(o.memberCode)
  if (!m || m.blocked || o.earned != null) return
  const pts = earnFor(m, o.total)
  o.earned = pts
  if (pts > 0) { m.points += pts; m.lifetime += pts; ledger(m.code, 'earn', pts, `Pesanan ${o.id}`, o.id) }
  m.orders += 1; m.last = o.createdAt.slice(0, 10)
  // referral: the referrer gets a bonus after the new member's first finished order
  if (m.referredBy && !m.refRewarded && db.config.referral.active) {
    const r = db.members.find((x) => x.referralCode === m.referredBy)
    m.refRewarded = true
    if (r) { const bonus = Math.round((db.config.referral.reward / db.config.points.redeemValue) * db.config.points.redeemPts); r.points += bonus; r.lifetime += bonus; ledger(r.code, 'bonus', bonus, `Referral: ${m.name} pesan pertama`) }
  }
}
function refundOrder(o) {
  const m = o.memberCode && findMember(o.memberCode)
  if (!m || o.refunded) return
  o.refunded = true
  if (o.redeemPts > 0) { m.points += o.redeemPts; ledger(m.code, 'refund', o.redeemPts, `Pesanan ${o.id} dibatalkan`, o.id) }
  if (o.earned > 0) { m.points = Math.max(0, m.points - o.earned); m.lifetime = Math.max(0, m.lifetime - o.earned); ledger(m.code, 'refund', -o.earned, `Poin pesanan ${o.id} ditarik`, o.id) }
}

const send = (res, code, body) => { res.writeHead(code, { 'content-type': 'application/json', 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type', 'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS' }); res.end(body === undefined ? '' : JSON.stringify(body)) }
const readBody = (req) => new Promise((ok) => { let s = ''; req.on('data', (c) => (s += c)); req.on('end', () => { try { ok(s ? JSON.parse(s) : {}) } catch { ok({}) } }) })
const fail = (res, code, msg) => send(res, code, { error: msg })

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204)
  const url = new URL(req.url, 'http://x')
  const seg = url.pathname.split('/').filter(Boolean) // ['api', ...]
  if (seg[0] !== 'api') return fail(res, 404, 'not found')
  const [, a, b, c] = seg
  const body = ['POST', 'PUT', 'PATCH'].includes(req.method) ? await readBody(req) : {}

  if (a === 'health') return send(res, 200, { ok: true })
  if (a === 'reset' && req.method === 'POST') { db = seed(); save(); return send(res, 200, { ok: true }) }

  // everything the admin app needs in one poll
  if (a === 'state') return send(res, 200, { config: db.config, vouchers: db.vouchers, members: db.members.map(view), orders: db.orders })

  if (a === 'membership' && b === 'config') {
    if (req.method === 'PUT') { db.config = { ...db.config, ...body }; save() }
    return send(res, 200, db.config)
  }
  if (a === 'vouchers') {
    if (req.method === 'PUT') { if (!Array.isArray(body)) return fail(res, 400, 'array expected'); db.vouchers = body; save() }
    return send(res, 200, db.vouchers)
  }

  if (a === 'members') {
    if (!b) {
      if (req.method === 'POST') {
        if (!body.name?.trim() || !body.phone?.trim()) return fail(res, 400, 'name and phone required')
        if (findMember(body.phone)) return fail(res, 409, 'phone already registered')
        const id = db.members.length + 1
        const code = 'KNM-M-' + String(id).padStart(6, '0')
        const m = { id, code, name: body.name.trim(), phone: body.phone.trim(), points: 0, lifetime: 0, orders: 0, joined: now().slice(0, 10), last: null, blocked: false, vouchers: [], referralCode: (body.name.trim().split(' ')[0].slice(0, 4).toUpperCase() + '15'), referredBy: body.referredBy && db.members.some((x) => x.referralCode === body.referredBy) ? body.referredBy : null, refRewarded: false }
        db.members.push(m); ledger(code, 'bonus', 50, 'Bonus gabung member'); m.points = 50; m.lifetime = 50; save()
        return send(res, 201, view(m))
      }
      const q = (url.searchParams.get('q') ?? '').toLowerCase()
      return send(res, 200, db.members.filter((m) => (m.name + m.phone + m.code).toLowerCase().includes(q)).map(view))
    }
    const m = findMember(decodeURIComponent(b))
    if (!m) return fail(res, 404, 'member not found')
    if (!c) {
      if (req.method === 'PATCH') { Object.assign(m, Object.fromEntries(Object.entries(body).filter(([k]) => ['blocked', 'name', 'phone'].includes(k)))); save() }
      return send(res, 200, view(m))
    }
    if (c === 'ledger') return send(res, 200, db.ledger.filter((l) => l.code === m.code).sort((x, y) => y.at.localeCompare(x.at)))
    if (c === 'points' && req.method === 'POST') {
      const pts = Number(body.pts)
      if (!Number.isFinite(pts) || !pts) return fail(res, 400, 'pts required')
      if (m.points + pts < 0) return fail(res, 400, 'insufficient points')
      m.points += pts; if (pts > 0) m.lifetime += pts
      ledger(m.code, 'adjust', pts, body.note || 'Penyesuaian admin', null, body.by ?? 'admin'); save()
      return send(res, 200, view(m))
    }
    if (c === 'vouchers' && req.method === 'POST') {
      if (!db.vouchers.some((v) => v.code === body.code)) return fail(res, 404, 'voucher not found')
      if (!m.vouchers.includes(body.code)) m.vouchers.push(body.code)
      save(); return send(res, 200, view(m))
    }
  }

  if (a === 'orders') {
    if (!b) {
      if (req.method === 'POST') {
        const m = body.memberCode ? findMember(body.memberCode) : null
        if (body.memberCode && !m) return fail(res, 404, 'member not found')
        if (m?.blocked) return fail(res, 403, 'member blocked')
        const redeemPts = Number(body.redeemPts) || 0
        if (redeemPts && (!m || redeemPts > m.points || redeemPts % db.config.points.redeemPts)) return fail(res, 400, 'invalid points redemption')
        const id = 'KNM-' + (1300 + db.seq)
        const o = {
          id, seq: next(), createdAt: now(), source: body.source === 'POS' ? 'POS' : 'Online', outletId: body.outletId ?? 1, memberCode: m?.code ?? null,
          customer: m?.name ?? body.customer ?? 'Walk-in', mode: body.mode ?? 'pickup', delivery: body.mode === 'delivery', address: body.address ?? null,
          items: body.items ?? [], subtotal: body.subtotal ?? body.total, discount: body.discount ?? 0, total: body.total, method: body.method ?? 'QRIS', cashier: body.cashier ?? '-',
          redeemPts, voucher: body.voucher ?? null, status: body.status ?? (body.source === 'POS' ? 'Selesai' : 'Menunggu'), earned: null, refunded: false,
          pickupCode: body.mode === 'delivery' || body.source === 'POS' ? null : String(Math.floor(1000 + Math.random() * 9000)), readyAt: null, pickedUpAt: null,
        }
        if (m && redeemPts) { m.points -= redeemPts; ledger(m.code, 'redeem', -redeemPts, `Tukar poin di pesanan ${id}`, id) }
        if (o.voucher) { const v = db.vouchers.find((x) => x.code === o.voucher); if (v) v.used += 1; if (m) m.vouchers = m.vouchers.filter((x) => x !== o.voucher) }
        db.orders.push(o)
        if (o.status === 'Selesai') creditOrder(o)
        save()
        return send(res, 201, { order: o, member: m ? view(m) : null })
      }
      const mem = url.searchParams.get('member')
      return send(res, 200, db.orders.filter((o) => !mem || o.memberCode === mem).sort((x, y) => y.seq - x.seq))
    }
    const o = db.orders.find((x) => x.id === b)
    if (!o) return fail(res, 404, 'order not found')
    if (req.method === 'PATCH') {
      const patch = body
      if (patch.status && patch.status !== o.status) {
        o.status = patch.status
        if (o.status === 'Siap' && !o.readyAt) o.readyAt = now()
        if (o.status === 'Selesai') { o.pickedUpAt = o.pickupCode ? now() : null; creditOrder(o) }
        if (['Dibatalkan', 'Refund', 'Void'].includes(o.status)) refundOrder(o)
      }
      for (const k of ['courier', 'refundReason', 'voidReason', 'handedOverBy']) if (k in patch) o[k] = patch[k]
      save(); return send(res, 200, { order: o, member: o.memberCode ? view(findMember(o.memberCode)) : null })
    }
    return send(res, 200, o)
  }
  return fail(res, 404, 'not found')
})

server.listen(PORT, () => console.log(`Mock API on http://localhost:${PORT}  (data: ${path.relative(process.cwd(), FILE)})`))
