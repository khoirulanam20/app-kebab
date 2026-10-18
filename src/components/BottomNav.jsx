import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { HouseIcon, SandwichIcon, ReceiptTextIcon, UserRoundIcon, QrCodeIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

const tabs = [
  { to: '/', label: 'Beranda', icon: HouseIcon },
  { to: '/menu', label: 'Menu', icon: SandwichIcon },
  null,
  { to: '/orders', label: 'Pesanan', icon: ReceiptTextIcon },
  { to: '/me', label: 'Akun', icon: UserRoundIcon },
]

export default function BottomNav() {
  const nav = useNavigate()
  const { pathname } = useLocation()
  if (pathname === '/payment' || pathname === '/checkout') return null
  return (
    <nav aria-label="Utama" className="relative z-30 grid grid-cols-5 items-center bg-white px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-1px_8px_rgba(0,0,0,.08)]">
      {tabs.map((t, i) =>
        t ? (
          <NavLink key={t.to} to={t.to} className={({ isActive }) =>
            `flex h-14 flex-col items-center justify-center gap-0.5 rounded-full text-xs font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
            <t.icon aria-hidden className="size-6" />{t.label}
          </NavLink>
        ) : (
          <div key={i} className="flex flex-col items-center">
            <Button size="icon-lg" onClick={() => nav('/qr')} aria-label="QR" className="-mt-9 size-16 border-4 border-white shadow-md"><QrCodeIcon className="size-7" /></Button>
            <span className={`mt-0.5 text-xs font-medium ${pathname === '/qr' ? 'text-primary' : 'text-muted-foreground'}`}>QR</span>
          </div>
        )
      )}
    </nav>
  )
}
