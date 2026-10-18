import { Sandwich, Hamburger, Beef, Package, CupSoda, Popcorn } from 'lucide-react'

export const rupiah = (n) => 'Rp ' + n.toLocaleString('id-ID')

export const categories = [
  { id: 'kebab', name: 'Kebab', icon: Sandwich },
  { id: 'burger', name: 'Burger', icon: Hamburger },
  { id: 'hotdog', name: 'Hotdog', icon: Beef },
  { id: 'paket', name: 'Paket Hemat', icon: Package },
  { id: 'minum', name: 'Minuman', icon: CupSoda },
  { id: 'tambahan', name: 'Camilan', icon: Popcorn },
]

export const products = [
  { id: 1, cat: 'kebab', name: 'Kebab Original', price: 18000, icon: Sandwich, image: '/images/products/kebab-original.jpg', badge: 'Terlaris', desc: 'Tortilla lembut isi daging sapi, selada, tomat, dan saus spesial Kebab N Me.' },
  { id: 2, cat: 'kebab', name: 'Kebab Jumbo Keju', price: 28000, icon: Sandwich, image: '/images/products/kebab-jumbo-keju.jpg', badge: 'Baru', desc: 'Ukuran jumbo dengan lelehan keju mozzarella dan daging ekstra.' },
  { id: 3, cat: 'kebab', name: 'Kebab Ayam Pedas', price: 20000, icon: Sandwich, image: '/images/products/kebab-ayam-pedas.jpg', desc: 'Ayam bumbu pedas manis, bawang bombay, dan mayo sambal.' },
  { id: 4, cat: 'burger', name: 'Burger Kebab Beef', price: 24000, icon: Hamburger, image: '/images/products/burger-kebab.jpg', desc: 'Roti burger isi daging kebab, keju, dan saus bawang putih.' },
  { id: 5, cat: 'hotdog', name: 'Hotdog Kebab', price: 16000, icon: Beef, image: '/images/products/hotdog-kebab.jpg', desc: 'Roti panjang dengan sosis sapi dan irisan daging kebab.' },
  { id: 6, cat: 'paket', name: 'Paket Kenyang', price: 32000, was: 38000, icon: Package, image: '/images/products/paket-kenyang.jpg', badge: 'Hemat', desc: 'Kebab Original + kentang goreng + es teh.' },
  { id: 7, cat: 'paket', name: 'Paket Berdua', price: 55000, was: 64000, icon: Package, image: '/images/products/paket-berdua.jpg', desc: '2 Kebab Original + 2 minuman + 1 kentang goreng.' },
  { id: 8, cat: 'minum', name: 'Es Teh Manis', price: 6000, icon: CupSoda, image: '/images/products/es-teh-manis.jpg', desc: 'Teh segar dingin, manisnya pas.' },
  { id: 9, cat: 'minum', name: 'Lemon Tea', price: 9000, icon: CupSoda, image: '/images/products/lemon-tea.jpg', desc: 'Teh dengan perasan lemon segar.' },
  { id: 10, cat: 'tambahan', name: 'Kentang Goreng', price: 12000, icon: Popcorn, image: '/images/products/kentang-goreng.jpg', desc: 'Kentang renyah dengan bumbu tabur.' },
]

export const sizes = [{ n: 'Regular', add: 0 }, { n: 'Jumbo', add: 8000 }]
export const spicy = ['Nggak Pedas', 'Sedang', 'Pedas']
export const extras = [{ n: 'Extra Keju', add: 4000 }, { n: 'Extra Daging', add: 6000 }, { n: 'Telur', add: 3000 }]

export const outlets = [
  { id: 1, name: 'Kebab N Me – Pusat', addr: 'Jl. Merdeka No. 12', km: 1.2 },
  { id: 2, name: 'Kebab N Me – Kampus', addr: 'Jl. Kaliurang Km 5', km: 3.2 },
  { id: 3, name: 'Kebab N Me – Condongcatur', addr: 'Jl. Affandi No. 21', km: 4.1 },
  { id: 4, name: 'Kebab N Me – Godean', addr: 'Jl. Godean Km 6', km: 5.8 },
]

export const payments = [
  { id: 'qris', name: 'QRIS', note: 'Semua e-wallet & m-banking', color: '#1f1a17', logo: '/images/payments/qris.svg' },
  { id: 'shopee', name: 'ShopeePay', note: 'Diskon 5K min. transaksi 40K', color: '#ee4d2d', logo: '/images/payments/shopeepay.svg' },
  { id: 'gopay', name: 'GoPay', note: '', color: '#00aed6', logo: '/images/payments/gopay.svg' },
  { id: 'ovo', name: 'OVO', note: '', color: '#4c2a86', logo: '/images/payments/ovo.svg' },
  { id: 'dana', name: 'DANA', note: '', color: '#118eea', logo: '/images/payments/dana.svg' },
  { id: 'cash', name: 'Bayar di Toko', note: 'Tunai saat ambil pesanan', color: '#d9242b', logo: '/images/payments/cash.svg' },
]

export const pastOrders = [
  { id: 'KNM-1210', outlet: 'Kebab N Me – Pusat', date: '12/10/2026 12:24', status: 'Selesai', items: 'Kebab Original ×2', lines: [{ pid: 1, qty: 2 }], total: 36000, rate: true },
  { id: 'KNM-0928', outlet: 'Kebab N Me – Kampus', date: '28/09/2026 19:13', status: 'Selesai', items: 'Paket Kenyang ×1', lines: [{ pid: 6, qty: 1 }], total: 32000 },
  { id: 'KNM-0915', outlet: 'Kebab N Me – Pusat', date: '15/09/2026 13:02', status: 'Selesai', items: 'Kebab Jumbo Keju ×1', lines: [{ pid: 2, qty: 1 }], total: 28000 },
]

export const POINTS = 948
export const MIN_DELIVERY = 25000
export const MEMBER_CODE = 'KNM-MEMBER-948221'
export const GOLD_AT = 1000
