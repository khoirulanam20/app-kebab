import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ShieldAlertIcon } from 'lucide-react'
import IconSidebar from './IconSidebar'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import { homeFor, permForPath } from './nav-items'
import EmptyState from '@/components/common/EmptyState'
import OpenShiftModal from '@/components/pos/OpenShiftModal'
import { usePos } from '@/context/pos'

export default function AdminShell() {
  const { shift, toast, can, user, offline } = usePos()
  const { pathname } = useLocation()
  const perm = permForPath(pathname)
  const allowed = !perm || can(perm)
  // land on the first page this role may open instead of a blocked page
  if (!allowed && (pathname === '/' || pathname === '/stock')) return <Navigate to={homeFor(user.role, can)} replace />
  const needShift = (pathname === '/' || pathname === '/payment') && allowed && can('pos')
  return (
    <div className="flex h-dvh overflow-hidden bg-muted">
      <IconSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        {offline && <p role="status" className="bg-accent px-4 py-1.5 text-center text-[13px] font-medium">Mode offline: transaksi disimpan di perangkat dan dikirim saat online lagi.</p>}
        <main className="relative min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">
          {allowed ? <Outlet /> : <EmptyState icon={ShieldAlertIcon} title="Akses ditolak" text={`Peran ${user?.role} tidak punya akses ke halaman ini. Hubungi Owner untuk mengubah hak akses.`} />}
        </main>
        <BottomNav />
      </div>
      {!shift && needShift && <OpenShiftModal />}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4">
        {toast && <p className="animate-in fade-in slide-in-from-top-4 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-white shadow-lg duration-200">{toast}</p>}
      </div>
    </div>
  )
}
