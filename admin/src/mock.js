import { Sandwich, Hamburger, Beef, Package, CupSoda, Popcorn, LayoutGrid } from 'lucide-react'

export const catIcons = { all: LayoutGrid, kebab: Sandwich, burger: Hamburger, hotdog: Beef, paket: Package, minum: CupSoda, camilan: Popcorn }
export const categories = [
  { id: 'kebab', name: 'Kebab', active: true },
  { id: 'burger', name: 'Burger', active: true },
  { id: 'hotdog', name: 'Hotdog', active: true },
  { id: 'paket', name: 'Paket Hemat', active: true },
  { id: 'minum', name: 'Minuman', active: true },
  { id: 'camilan', name: 'Camilan', active: true },
]

export const optionGroups = [
  { id: 'size', name: 'Ukuran', required: true, multi: false, items: [{ n: 'Regular', add: 0 }, { n: 'Jumbo', add: 8000 }] },
  { id: 'spicy', name: 'Level pedas', required: true, multi: false, items: [{ n: 'Nggak Pedas', add: 0 }, { n: 'Sedang', add: 0 }, { n: 'Pedas', add: 0 }] },
  { id: 'extra', name: 'Tambahan', required: false, multi: true, items: [{ n: 'Extra Keju', add: 4000 }, { n: 'Extra Daging', add: 6000 }, { n: 'Telur', add: 3000 }] },
]

export const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const week = (open, close) => Object.fromEntries(DAYS.map((d) => [d, { open, close, closed: false }]))
export const outlets = [
  { id: 1, name: 'Kebab N Me – Pusat', address: 'Jl. Merdeka No. 12', phone: '0812-1111-2222', lat: '-7.7956', lng: '110.3695', hours: week('10:00', '22:00'), tempClosed: false, holidays: [{ date: '2026-12-25', note: 'Libur Natal' }], radiusKm: 6, feeBase: 5000, feePerKm: 2000, prepMin: 10, active: true },
  { id: 2, name: 'Kebab N Me – Kampus', address: 'Jl. Kaliurang Km 5', phone: '0812-3333-4444', lat: '-7.7597', lng: '110.3779', hours: week('11:00', '23:00'), tempClosed: false, holidays: [], radiusKm: 4, feeBase: 4000, feePerKm: 2500, prepMin: 15, active: true },
  { id: 3, name: 'Kebab N Me – Condongcatur', address: 'Jl. Affandi No. 21', phone: '0812-5555-6666', lat: '-7.7612', lng: '110.3935', hours: week('10:00', '22:00'), tempClosed: false, holidays: [], radiusKm: 5, feeBase: 5000, feePerKm: 2000, prepMin: 12, active: true },
  { id: 4, name: 'Kebab N Me – Godean', address: 'Jl. Godean Km 6', phone: '0812-7777-8888', lat: '-7.7721', lng: '110.3302', hours: week('11:00', '22:00'), tempClosed: false, holidays: [], radiusKm: 6, feeBase: 5000, feePerKm: 2500, prepMin: 15, active: true },
]

// per-product menu variants, entered in Menu > Produk and shown in the cashier's product detail
const V = {
  isi: [{ id: 'v-isi', name: 'Isi daging', required: true, multi: false, items: [{ n: 'Sapi', add: 0 }, { n: 'Ayam', add: 0 }, { n: 'Campur', add: 3000 }] }],
  minum: [
    { id: 'v-suhu', name: 'Suhu', required: true, multi: false, items: [{ n: 'Dingin', add: 0 }, { n: 'Hangat', add: 0 }] },
    { id: 'v-gula', name: 'Gula', required: false, multi: false, items: [{ n: 'Normal', add: 0 }, { n: 'Kurang manis', add: 0 }, { n: 'Tanpa gula', add: 0 }] },
  ],
}

export const products = [
  { id: 1, sku: 'KBB-001', variants: V.isi, cat: 'kebab', name: 'Kebab Original', desc: 'Tortilla lembut isi daging sapi, selada, tomat, dan saus spesial.', price: 18000, stock: 42, opts: true, active: true, badge: 'Terlaris', outlets: [1, 2, 3, 4], outletPrice: {}, schedule: null },
  { id: 2, sku: 'KBB-002', cat: 'kebab', name: 'Kebab Jumbo Keju', desc: 'Ukuran jumbo dengan lelehan keju mozzarella dan daging ekstra.', price: 28000, stock: 18, opts: true, active: true, badge: 'Baru', outlets: [1, 2, 3, 4], outletPrice: { 2: 29000 }, schedule: null },
  { id: 3, sku: 'KBB-003', cat: 'kebab', name: 'Kebab Ayam Pedas', desc: 'Ayam bumbu pedas manis, bawang bombay, dan mayo sambal.', price: 20000, stock: 7, opts: true, active: true, outlets: [1, 2, 3, 4], outletPrice: {}, schedule: null },
  { id: 4, sku: 'BRG-001', cat: 'burger', name: 'Burger Kebab Beef', desc: 'Roti burger isi daging kebab, keju, dan saus bawang putih.', price: 24000, stock: 15, opts: true, active: true, outlets: [1], outletPrice: {}, schedule: null },
  { id: 5, sku: 'HTD-001', cat: 'hotdog', name: 'Hotdog Kebab', desc: 'Roti panjang dengan sosis sapi dan irisan daging kebab.', price: 16000, stock: 0, opts: true, active: true, outlets: [1, 2, 3, 4], outletPrice: {}, schedule: null },
  { id: 6, sku: 'PKT-001', cat: 'paket', name: 'Paket Kenyang', desc: 'Kebab Original + kentang goreng + es teh.', price: 32000, was: 38000, stock: 25, active: true, badge: 'Hemat', outlets: [1, 2, 3, 4], outletPrice: {}, schedule: { from: '10:00', to: '17:00' }, bundle: [{ pid: 1, qty: 1 }, { pid: 10, qty: 1 }, { pid: 8, qty: 1 }] },
  { id: 7, sku: 'PKT-002', cat: 'paket', name: 'Paket Berdua', desc: '2 Kebab Original + 2 minuman + 1 kentang goreng.', price: 55000, was: 64000, stock: 12, active: true, outlets: [1, 2, 3, 4], outletPrice: {}, schedule: null, bundle: [{ pid: 1, qty: 2 }, { pid: 8, qty: 2 }, { pid: 10, qty: 1 }] },
  { id: 8, sku: 'MNM-001', variants: V.minum, cat: 'minum', name: 'Es Teh Manis', desc: 'Teh segar dingin, manisnya pas.', price: 6000, stock: 80, active: true, outlets: [1, 2, 3, 4], outletPrice: {}, schedule: null },
  { id: 9, sku: 'MNM-002', variants: V.minum, cat: 'minum', name: 'Lemon Tea', desc: 'Teh dengan perasan lemon segar.', price: 9000, stock: 55, active: true, outlets: [1, 2, 3, 4], outletPrice: {}, schedule: null },
  { id: 10, sku: 'CML-001', cat: 'camilan', name: 'Kentang Goreng', desc: 'Kentang renyah dengan bumbu tabur.', price: 12000, stock: 30, active: true, outlets: [1, 2, 3, 4], outletPrice: {}, schedule: null },
]

export const ingredients = [
  { id: 1, name: 'Daging sapi', unit: 'kg', stock: 18, min: 5, cost: 120000 },
  { id: 2, name: 'Daging ayam', unit: 'kg', stock: 4, min: 5, cost: 45000 },
  { id: 3, name: 'Tortilla', unit: 'pcs', stock: 140, min: 50, cost: 2000 },
  { id: 4, name: 'Roti burger', unit: 'pcs', stock: 60, min: 30, cost: 3000 },
  { id: 5, name: 'Roti hotdog', unit: 'pcs', stock: 12, min: 20, cost: 2500 },
  { id: 6, name: 'Sosis sapi', unit: 'pcs', stock: 25, min: 20, cost: 3500 },
  { id: 7, name: 'Sayuran segar', unit: 'kg', stock: 6, min: 3, cost: 25000 },
  { id: 8, name: 'Keju slice', unit: 'pcs', stock: 90, min: 40, cost: 1500 },
  { id: 9, name: 'Kentang beku', unit: 'kg', stock: 12, min: 5, cost: 30000 },
  { id: 10, name: 'Teh', unit: 'g', stock: 2200, min: 500, cost: 100 },
  { id: 11, name: 'Lemon', unit: 'pcs', stock: 8, min: 10, cost: 2000 },
]
// productId -> [[ingredientId, qty per portion]]
export const recipes = {
  1: [[3, 1], [1, 0.06], [7, 0.03]], 2: [[3, 1], [1, 0.1], [7, 0.04], [8, 2]], 3: [[3, 1], [2, 0.08], [7, 0.03]],
  4: [[4, 1], [1, 0.08], [8, 1], [7, 0.02]], 5: [[5, 1], [6, 1], [1, 0.03]], 6: [[3, 1], [1, 0.06], [9, 0.1], [10, 10]],
  7: [[3, 2], [1, 0.12], [9, 0.1], [10, 20]], 8: [[10, 10]], 9: [[10, 10], [11, 1]], 10: [[9, 0.15]],
}
export const movements = [
  { id: 1, at: '2026-10-17T08:10:00', ingredient: 'Daging sapi', type: 'Masuk', qty: 20, note: 'Supplier Pak Joko' },
  { id: 2, at: '2026-10-17T21:30:00', ingredient: 'Lemon', type: 'Keluar', qty: -4, note: 'Rusak' },
  { id: 3, at: '2026-10-18T08:05:00', ingredient: 'Tortilla', type: 'Masuk', qty: 100, note: 'Restock' },
]

export const vouchers = [
  { id: 1, code: 'ABANG10', type: 'pct', value: 10, min: 20000, quota: 200, used: 34, until: '2026-12-31', active: true },
  { id: 2, code: 'HEMAT5K', type: 'flat', value: 5000, min: 30000, quota: 100, used: 61, until: '2026-11-30', active: true },
  { id: 3, code: 'KAMPUS15', type: 'pct', value: 15, min: 50000, quota: 50, used: 50, until: '2026-10-31', active: true },
]
export const banners = [
  { id: 1, title: 'Beli 5 Gratis 1', kind: 'Banner', from: '2026-10-01', to: '2026-10-31', active: true, image: null },
  { id: 2, title: 'Gratis Ongkir Minggu Ini', kind: 'Popup', from: '2026-10-14', to: '2026-10-20', active: true, image: null },
  { id: 3, title: 'Paket Kenyang Hemat 6K', kind: 'Banner', from: '2026-11-01', to: '2026-11-30', active: false, image: null },
]
export const flashSales = [{ id: 1, pid: 6, price: 29000, from: '2026-10-18T10:00', to: '2026-10-18T17:00', active: true }]
export const members = [
  { id: 1, name: 'Silver', min: 0, mult: 1, benefit: 'Poin 1× dan voucher ulang tahun' },
  { id: 2, name: 'Gold', min: 1000, mult: 1.5, benefit: 'Poin 1,5× dan gratis ongkir 2×/bulan' },
  { id: 3, name: 'Platinum', min: 3000, mult: 2, benefit: 'Poin 2× dan menu spesial pelanggan setia' },
]
export const missionsSeed = [
  { id: 1, title: 'Pesan 3× minggu ini', reward: '50 poin', active: true },
  { id: 2, title: 'Coba menu baru', reward: 'Voucher Rp 5.000', active: true },
]
export const broadcasts = [{ id: 1, at: '2026-10-12T10:00:00', channel: 'Push', segment: 'Semua pelanggan', text: 'Beli 5 gratis 1 sampai akhir Oktober!', sent: 5 }]

export const customers = [
  { id: 1, code: 'KNM-MEMBER-948221', name: 'Khoirul Anam', phone: '0812-3456-7890', points: 948, lifetime: 948, orders: 3, joined: '2026-01-05', last: '2026-10-12', blocked: false, vouchers: ['ABANG10'], referralCode: 'ANAM15' },
  { id: 2, code: 'KNM-M-000002', name: 'Dewi Lestari', phone: '0812-5555-0101', points: 320, lifetime: 520, orders: 14, joined: '2026-03-12', last: '2026-10-16', blocked: false, vouchers: ['ABANG10'], referralCode: 'DEWI15' },
  { id: 3, code: 'KNM-M-000003', name: 'Budi Santoso', phone: '0813-7777-0202', points: 1180, lifetime: 3150, orders: 41, joined: '2026-01-05', last: '2026-10-17', blocked: false, vouchers: [], referralCode: 'BUDI15' },
  { id: 4, code: 'KNM-M-000004', name: 'Rina Marlina', phone: '0857-8888-0303', points: 90, lifetime: 90, orders: 4, joined: '2026-09-21', last: '2026-10-02', blocked: false, vouchers: [], referralCode: 'RINA15' },
  { id: 5, code: 'KNM-M-000005', name: 'Andi Pratama', phone: '0821-9999-0404', points: 640, lifetime: 1240, orders: 22, joined: '2026-02-18', last: '2026-08-04', blocked: false, vouchers: [], referralCode: 'ANDI15' },
  { id: 6, code: 'KNM-M-000006', name: 'Siti Nurhaliza', phone: '0878-1212-0505', points: 15, lifetime: 15, orders: 1, joined: '2026-10-11', last: '2026-10-11', blocked: false, vouchers: [], referralCode: 'SITI15' },
]
export const reviews = [
  { id: 1, customer: 'Dewi Lestari', product: 'Kebab Original', rating: 5, text: 'Dagingnya juicy, porsinya pas!', at: '2026-10-16', status: 'Tayang', reply: '' },
  { id: 2, customer: 'Andi Pratama', product: 'Kebab Ayam Pedas', rating: 3, text: 'Agak kurang pedas, tapi enak.', at: '2026-10-14', status: 'Tayang', reply: 'Makasih masukannya, Bang! Next bisa pilih level Pedas ya.' },
  { id: 3, customer: 'Rina Marlina', product: 'Paket Kenyang', rating: 1, text: 'Kentang dingin waktu sampai.', at: '2026-10-10', status: 'Tayang', reply: '' },
  { id: 4, customer: 'Budi Santoso', product: 'Burger Kebab Beef', rating: 5, text: 'Mantap, langganan terus.', at: '2026-10-09', status: 'Disembunyikan', reply: '' },
]

const BASE = new Date('2026-10-18T12:00:00')
const find = (pid) => products.find((p) => p.id === pid)
const mk = (n, daysAgo, hour, lines, method, source, status = 'Selesai', extra = {}) => {
  const items = lines.map(([pid, qty]) => ({ pid, qty, name: find(pid).name, price: find(pid).price }))
  const d = new Date(BASE.getTime() - daysAgo * 86400000)
  d.setHours(hour, (n * 7) % 60)
  const total = items.reduce((s, i) => s + i.price * i.qty, 0)
  return { id: `KNM-${1000 + n}`, createdAt: d.toISOString(), items, subtotal: total, discount: 0, total, method, source, status, cashier: source === 'POS' ? (n % 2 ? 'Rudi' : 'Sari') : '-', customer: n % 3 === 0 ? customers[n % 5].name : 'Walk-in', outletId: n % 3 === 0 ? 2 : 1, delivery: false, courier: null, pickupCode: null, ...extra }
}
export const orders = [
  mk(34, 0, 11, [[1, 2], [8, 2]], 'QRIS', 'Online', 'Menunggu', { delivery: true, address: 'Jl. Melati No. 7', customer: 'Dewi Lestari' }),
  mk(33, 0, 11, [[6, 1]], 'QRIS', 'Online', 'Menunggu', { customer: 'Budi Santoso' }),
  mk(32, 0, 10, [[2, 1], [10, 1]], 'QRIS', 'Online', 'Diproses', { delivery: true, address: 'Jl. Kaliurang Km 7', customer: 'Rina Marlina', outletId: 2 }),
  mk(31, 0, 10, [[3, 2]], 'Transfer', 'Online', 'Siap', { customer: 'Andi Pratama' }),
  mk(30, 0, 9, [[1, 2], [8, 2]], 'Tunai', 'POS'),
  mk(28, 0, 11, [[2, 1], [10, 1]], 'QRIS', 'POS'),
  mk(27, 1, 12, [[4, 2]], 'Tunai', 'POS'),
  mk(26, 1, 13, [[1, 3]], 'Transfer', 'Online'),
  mk(25, 1, 19, [[7, 1]], 'QRIS', 'POS'),
  mk(24, 2, 12, [[3, 2], [9, 2]], 'Tunai', 'POS'),
  mk(23, 2, 18, [[6, 2]], 'QRIS', 'Online', 'Dibatalkan'),
  mk(22, 3, 13, [[1, 1], [10, 1], [8, 1]], 'Tunai', 'POS'),
  mk(21, 3, 20, [[5, 1]], 'Tunai', 'POS'),
  mk(20, 4, 12, [[2, 2]], 'QRIS', 'Online'),
  mk(19, 5, 14, [[1, 4], [8, 4]], 'Tunai', 'POS'),
  mk(18, 6, 19, [[7, 2]], 'Transfer', 'POS'),
  mk(17, 8, 12, [[1, 2]], 'Tunai', 'POS'),
  mk(16, 12, 13, [[2, 1], [9, 1]], 'QRIS', 'Online'),
  mk(15, 20, 18, [[7, 1]], 'QRIS', 'POS'),
  mk(40, 0, 11, [[1, 3], [8, 3]], 'Tunai', 'POS', 'Selesai', { outletId: 3, cashier: 'Eko' }),
  mk(41, 0, 10, [[2, 1], [9, 1]], 'QRIS', 'POS', 'Selesai', { outletId: 3, cashier: 'Eko' }),
  mk(42, 0, 11, [[3, 2]], 'QRIS', 'Online', 'Menunggu', { outletId: 3, delivery: true, address: 'Jl. Kaliurang Km 8', customer: 'Siti Nurhaliza' }),
  mk(43, 1, 19, [[7, 1]], 'QRIS', 'POS', 'Selesai', { outletId: 3, cashier: 'Eko' }),
  mk(44, 0, 9, [[1, 2], [10, 1]], 'Tunai', 'POS', 'Selesai', { outletId: 4, cashier: 'Hana' }),
  mk(45, 0, 11, [[6, 1]], 'QRIS', 'Online', 'Diproses', { outletId: 4, customer: 'Budi Santoso' }),
  mk(46, 2, 13, [[2, 2]], 'Tunai', 'POS', 'Selesai', { outletId: 4, cashier: 'Hana' }),
  mk(48, 0, 11, [[1, 1], [8, 1]], 'QRIS', 'Online', 'Siap', { outletId: 2, customer: 'Dewi Lestari', memberCode: 'KNM-M-000002' }),
  mk(49, 0, 11, [[3, 1]], 'QRIS', 'Online', 'Diproses', { outletId: 2, customer: 'Rina Marlina', memberCode: 'KNM-M-000004' }),
  mk(47, 3, 18, [[1, 4], [8, 4]], 'Transfer', 'POS', 'Selesai', { outletId: 4, cashier: 'Hana' }),
].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

export const holds = [
  { id: 'H-01', label: 'Meja 3 – Pak Hendra', createdAt: BASE.toISOString(), customer: null, lines: [{ key: '1a', pid: 1, name: 'Kebab Original', unit: 18000, qty: 2, opts: 'Regular · Sedang' }] },
]
export const pastShifts = [
  { id: 'S-0417', date: '2026-10-17', cashier: 'Rudi', outlet: 'Pusat', opening: 200000, sales: 1285000, cash: 740000, diff: 0 },
  { id: 'S-0416', date: '2026-10-16', cashier: 'Sari', outlet: 'Kampus', opening: 200000, sales: 964000, cash: 512000, diff: -5000 },
  { id: 'S-0415', date: '2026-10-15', cashier: 'Rudi', outlet: 'Pusat', opening: 200000, sales: 1102000, cash: 620000, diff: 0 },
  { id: 'S-0417B', date: '2026-10-17', cashier: 'Eko', outlet: 'Condongcatur', opening: 200000, sales: 842000, cash: 455000, diff: 0 },
  { id: 'S-0417C', date: '2026-10-17', cashier: 'Hana', outlet: 'Godean', opening: 200000, sales: 731000, cash: 398000, diff: -2000 },
]
export const paymentMethods = [
  { id: 'cash', fee: 0, name: 'Tunai', note: 'Dihitung di laci kasir', active: true },
  { id: 'qris', fee: 0.7, name: 'QRIS', note: 'Semua e-wallet dan m-banking', active: true },
  { id: 'card', fee: 1.8, name: 'Kartu debit/kredit', note: 'Mesin EDC cabang', active: true },
  { id: 'transfer', fee: 0, name: 'Transfer Bank', note: 'BCA 123-456-7890 a.n. Kebab N Me', active: true },
  { id: 'shopee', fee: 1.5, name: 'ShopeePay', note: 'Melalui payment gateway', active: false },
]
export const shortcuts = [['F2', 'Fokus ke pencarian produk'], ['F4', 'Hold keranjang'], ['F8', 'Buka pembayaran'], ['Esc', 'Tutup dialog']]

export const ROLES = ['Owner', 'Head Kitchen', 'Kasir', 'Dapur']
// Hierarchy: Owner > Head Kitchen > Kasir and Dapur
export const ROLE_PARENT = { 'Head Kitchen': 'Owner', Kasir: 'Head Kitchen', Dapur: 'Head Kitchen' }
export const PERM_KEYS = [
  ['dashboard', 'Dashboard'], ['outlets', 'Cabang'], ['menu', 'Menu'], ['promo', 'Promo'], ['customers', 'Pelanggan'], ['reports', 'Laporan'], ['settings', 'Pengaturan'],
  ['pos', 'Kasir (POS)'], ['orders', 'Pesanan'], ['kitchen', 'Dapur (KDS)'], ['team', 'Tim cabang'], ['stock', 'Stok'],
]
const perms = (...on) => Object.fromEntries(PERM_KEYS.map(([k]) => [k, on.includes(k)]))
export const defaultPerms = {
  Owner: perms('dashboard', 'outlets', 'menu', 'promo', 'customers', 'reports', 'settings'),
  'Head Kitchen': perms('orders', 'kitchen', 'menu', 'team'),
  Kasir: perms('pos', 'orders', 'customers'),
  Dapur: perms('kitchen'),
}
export const TODAY = '2026-10-18'
export const DEMO_PASSWORD = 'kebab123'
export const staff = [
  { id: 1, lastLogin: '2026-10-18T08:55:00', name: 'Khoirul Anam', email: 'owner@kebabnme.id', role: 'Owner', outletId: null, managerId: null, active: true },
  { id: 2, lastLogin: '2026-10-18T08:40:00', name: 'Joko', email: 'joko@kebabnme.id', role: 'Head Kitchen', outletId: 1, managerId: 1, active: true },
  { id: 3, lastLogin: '2026-10-18T09:02:00', name: 'Maya', email: 'maya@kebabnme.id', role: 'Head Kitchen', outletId: 2, managerId: 1, active: true },
  { id: 4, lastLogin: '2026-10-18T08:30:00', name: 'Rudi', email: 'rudi@kebabnme.id', role: 'Kasir', outletId: 1, managerId: 2, active: true },
  { id: 5, lastLogin: '2026-10-17T19:30:00', name: 'Sari', email: 'sari@kebabnme.id', role: 'Kasir', outletId: 2, managerId: 3, active: true },
  { id: 6, lastLogin: '2026-10-18T08:35:00', name: 'Bima', email: 'bima@kebabnme.id', role: 'Dapur', outletId: 1, managerId: 2, active: true },
  { id: 7, lastLogin: '2026-10-16T12:10:00', name: 'Lina', email: 'lina@kebabnme.id', role: 'Dapur', outletId: 2, managerId: 3, active: true },
  { id: 8, lastLogin: '2026-10-18T08:20:00', name: 'Dewi', email: 'dewi@kebabnme.id', role: 'Head Kitchen', outletId: 3, managerId: 1, active: true },
  { id: 9, lastLogin: '2026-10-18T08:25:00', name: 'Eko', email: 'eko@kebabnme.id', role: 'Kasir', outletId: 3, managerId: 8, active: true },
  { id: 10, lastLogin: '2026-10-18T08:28:00', name: 'Fajar', email: 'fajar@kebabnme.id', role: 'Dapur', outletId: 3, managerId: 8, active: true },
  { id: 11, lastLogin: '2026-10-17T20:00:00', name: 'Gilang', email: 'gilang@kebabnme.id', role: 'Head Kitchen', outletId: 4, managerId: 1, active: true },
  { id: 12, lastLogin: '2026-10-18T09:05:00', name: 'Hana', email: 'hana@kebabnme.id', role: 'Kasir', outletId: 4, managerId: 11, active: true },
  { id: 13, lastLogin: null, name: 'Imam', email: 'imam@kebabnme.id', role: 'Dapur', outletId: 4, managerId: 11, active: true },
]
export const activityLog = [
  { id: 1, at: '2026-10-18T09:12:00', who: 'Joko', text: 'Menandai Hotdog Kebab habis' },
  { id: 2, at: '2026-10-17T20:40:00', who: 'Khoirul Anam', text: 'Membuat voucher KAMPUS15' },
  { id: 3, at: '2026-10-17T08:00:00', who: 'Rudi', text: 'Membuka shift Pusat dengan saldo Rp 200.000' },
]
export const reconciliation = [
  { date: '2026-10-17', gateway: 'Midtrans', system: 486000, settled: 486000 },
  { date: '2026-10-16', gateway: 'Midtrans', system: 352000, settled: 346500 },
  { date: '2026-10-15', gateway: 'Midtrans', system: 421000, settled: 421000 },
]
export const faqSeed = [
  { id: 1, q: 'Berapa lama pesanan siap?', a: 'Pickup siap ±10 menit, antar 25–35 menit.' },
  { id: 2, q: 'Bagaimana kalau pesanan salah?', a: 'Hubungi kami lewat menu Bantuan, abang ganti.' },
]
export const settingsSeed = {
  business: { name: 'Kebab N Me', tagline: 'Always Kebab', phone: '0812-1111-2222', email: 'owner@kebabnme.id', address: 'Jl. Merdeka No. 12, Yogyakarta', timezone: 'WIB', logo: null },
  gateway: { provider: 'Midtrans', mode: 'sandbox', serverKey: 'SB-Mid-server-xxxxxxxxxxxxxxxx', clientKey: 'SB-Mid-client-xxxxxxxxxxxxxxxx' },
  fees: { taxPct: 0, serviceFeePct: 0, taxIncluded: false },
  points: { earnPerRp: 10000, earnPts: 1, redeemPts: 100, redeemValue: 5000, minSubtotal: 10000 },
  referral: { reward: 15000, active: true },
  stamp: { buy: 5, free: 1, active: true },
  notify: {
    push: { order: true, promo: true }, email: { order: false, promo: true }, wa: { order: true, promo: false },
    quiet: { on: true, from: '22:00', to: '07:00' },
    templates: { order: 'Halo {nama}, pesanan {no} {status}. Makasih, Bang!', promo: 'Halo {nama}! {promo}. Cek aplikasinya sekarang.' },
  },
  receipt: { width: '80', header: '', footer: 'Makasih, Bang! Datang lagi ya.', showLogo: true, showAddress: true, autoPrint: false, printer: 'Epson TM-T82 (USB)' },
  orders: { autoAccept: false, rejectMinutes: 10, pickupHoldMinutes: 30, reasons: ['Stok habis', 'Cabang sudah tutup', 'Di luar jangkauan antar', 'Permintaan pelanggan'] },
  ownerPin: '1234',
  backupCfg: { freq: 'daily', hour: '03:00', retain: 30 },
  content: { tos: 'Dengan memakai aplikasi Kebab N Me, Anda setuju pesanan dibuat sesuai ketersediaan stok cabang.', privacy: 'Kami menyimpan nama, nomor HP, dan alamat untuk memproses pesanan. Anda bisa menghapus akun kapan saja.', updated: '2026-10-01' },
  twoFactor: false,
}
export const backups = [{ id: 1, at: '2026-10-18T03:00:00', size: '2,4 MB', kind: 'Otomatis' }, { id: 2, at: '2026-10-17T03:00:00', size: '2,3 MB', kind: 'Otomatis' }]
