import SectionTabs from '@/components/common/SectionTabs'
import { usePos } from '@/context/pos'

export default function OrdersLayout() {
  const { orders, user } = usePos()
  const lock = user?.role === 'Owner' ? null : user?.outletId
  const ready = orders.filter((o) => o.source === 'Online' && !o.delivery && o.pickupCode && o.status === 'Siap' && (!lock || o.outletId === lock)).length
  return <SectionTabs title="Pesanan" description="Riwayat, pickup, keranjang yang di-hold, dan antrean offline." tabs={[{ to: '/orders/history', label: 'Riwayat' }, { to: '/orders/pickup', label: ready ? `Pickup (${ready})` : 'Pickup' }, { to: '/orders/hold', label: 'Hold' }, { to: '/orders/offline', label: 'Antrean offline' }]} />
}
