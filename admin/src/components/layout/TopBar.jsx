import { WifiIcon, WifiOffIcon, StoreIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { usePos } from '@/context/pos'

export default function TopBar() {
  const { shift, outlet, tenant, user, offline, setOffline, orders, apiOnline } = usePos()
  const pending = orders.filter((o) => o.pendingSync).length
  const isOwner = user?.role === 'Owner'
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-white px-4">
      <div className="flex min-w-0 items-center gap-2 text-sm font-medium">
        <StoreIcon className="size-4 shrink-0 text-primary" aria-hidden />
        <span className="truncate">{tenant?.name}{!isOwner && outlet ? ` · ${outlet.name.split('– ').pop()}` : ''}</span>
        <Badge variant="secondary" className="hidden sm:inline-flex">{user?.name} · {user?.role}</Badge>
        {user?.role === 'Kasir' && (shift ? <Badge>Shift buka</Badge> : <Badge variant="secondary">Shift belum dibuka</Badge>)}
      </div>
      <span title={apiOnline ? 'Terhubung ke server: member, poin, dan pesanan aplikasi tersinkron' : 'Server tidak aktif. Jalankan `npm run api` agar tersambung ke aplikasi pelanggan.'} className={`mr-auto ml-3 hidden shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-medium md:flex ${apiOnline ? 'bg-accent/40' : 'bg-secondary text-primary'}`}><span aria-hidden className={`size-2 rounded-full ${apiOnline ? 'bg-green-600' : 'bg-primary'}`} />{apiOnline ? 'Terhubung ke aplikasi' : 'Server mati (mode lokal)'}</span>
      {!isOwner && (
        <label className="flex shrink-0 items-center gap-2 text-sm">
          {offline ? <WifiOffIcon className="size-4 text-primary" aria-hidden /> : <WifiIcon className="size-4 text-primary" aria-hidden />}
          <span className="hidden sm:inline">{offline ? `Offline${pending ? ` (${pending} antre)` : ''}` : 'Online'}</span>
          <Switch checked={!offline} onCheckedChange={(on) => setOffline(!on)} aria-label="Simulasi koneksi internet" />
        </label>
      )}
    </header>
  )
}
