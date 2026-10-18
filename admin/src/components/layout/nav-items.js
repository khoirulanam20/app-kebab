import { LayoutDashboardIcon, ShoppingCartIcon, ReceiptTextIcon, ChefHatIcon, SandwichIcon, BoxesIcon, TicketPercentIcon, UsersIcon, StoreIcon, BarChart3Icon, SettingsIcon, WalletIcon, UsersRoundIcon } from 'lucide-react'
import { FEATURES } from '@/features'

// perm = permission key per role; feature = hidden while its flag in features.js is false
export const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboardIcon, perm: 'dashboard' },
  { to: '/cabang', label: 'Cabang', icon: StoreIcon, perm: 'outlets' },
  { to: '/menu', label: 'Menu', icon: SandwichIcon, perm: 'menu' },
  { to: '/promo', label: 'Promo', icon: TicketPercentIcon, perm: 'promo' },
  { to: '/customers', label: 'Pelanggan', icon: UsersIcon, perm: 'customers' },
  { to: '/reports', label: 'Laporan', icon: BarChart3Icon, perm: 'reports' },
  { to: '/kasir', label: 'Kasir', icon: ShoppingCartIcon, perm: 'pos' },
  { to: '/cashier', label: 'Shift', icon: WalletIcon, perm: 'pos' },
  { to: '/orders', label: 'Pesanan', icon: ReceiptTextIcon, perm: 'orders' },
  { to: '/kitchen', label: 'Dapur', icon: ChefHatIcon, perm: 'kitchen' },
  { to: '/team', label: 'Tim', icon: UsersRoundIcon, perm: 'team' },
  { to: '/stock', label: 'Stok', icon: BoxesIcon, perm: 'stock', feature: 'stock' },
  { to: '/settings', label: 'Pengaturan', icon: SettingsIcon, perm: 'settings' },
].filter((n) => !n.feature || FEATURES[n.feature])

export const permForPath = (pathname) => {
  if (pathname === '/payment') return 'pos'
  if (pathname === '/stock' || pathname.startsWith('/stock/')) return 'stock'
  const hit = navItems.find((n) => (n.end ? pathname === n.to : pathname === n.to || pathname.startsWith(n.to + '/')))
  return hit?.perm
}

const HOME = { Owner: '/dashboard', 'Head Kitchen': '/kitchen', Kasir: '/kasir', Dapur: '/kitchen' }
// first page a role lands on after login
export const homeFor = (role, can) => (can(navItems.find((n) => n.to === HOME[role])?.perm) ? HOME[role] : navItems.find((n) => can(n.perm))?.to ?? '/login')
