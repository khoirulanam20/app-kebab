import { NavLink, Outlet } from 'react-router-dom'
import { BuildingIcon, ReceiptIcon, PercentIcon, FileTextIcon, BellRingIcon, CreditCardIcon, BellIcon, UsersIcon, ShieldCheckIcon, LockKeyholeIcon, HistoryIcon, DatabaseBackupIcon, GlobeIcon } from 'lucide-react'

const groups = [
  ['Bisnis', [['profile', 'Profil bisnis', BuildingIcon], ['receipt', 'Struk & printer', ReceiptIcon], ['fees', 'Pajak & biaya', PercentIcon], ['content', 'Konten aplikasi', FileTextIcon]]],
  ['Operasional', [['orders', 'Pesanan online', BellRingIcon], ['payments', 'Pembayaran', CreditCardIcon], ['notifications', 'Notifikasi', BellIcon]]],
  ['Tim & akses', [['staff', 'Staf & peran', UsersIcon], ['access', 'Hak akses', ShieldCheckIcon], ['security', 'Keamanan', LockKeyholeIcon], ['log', 'Log aktivitas', HistoryIcon]]],
  ['Data & sistem', [['backup', 'Backup', DatabaseBackupIcon], ['tenant', 'Tenant', GlobeIcon]]],
]

// Vertical grouped sub-navigation on desktop; a scrollable chip row on small screens.
export default function SettingsLayout() {
  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <nav aria-label="Pengaturan" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:sticky lg:top-0 lg:mx-0 lg:block lg:self-start lg:overflow-visible lg:px-0">
        {groups.map(([title, items]) => (
          <div key={title} className="flex shrink-0 gap-2 lg:mb-4 lg:block lg:space-y-1">
            <p className="hidden px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:block">{title}</p>
            {items.map(([to, label, Icon]) => (
              <NavLink key={to} to={`/settings/${to}`} className={({ isActive }) => `flex h-10 shrink-0 items-center gap-2.5 rounded-full px-4 text-sm font-medium lg:w-full lg:rounded-xl lg:px-3 ${isActive ? 'bg-primary text-white' : 'bg-white text-foreground hover:bg-white/70 lg:bg-transparent lg:hover:bg-white'}`}>
                <Icon className="size-4 shrink-0" aria-hidden />{label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="min-w-0"><Outlet /></div>
    </div>
  )
}
