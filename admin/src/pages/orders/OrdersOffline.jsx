import { CloudOffIcon, RefreshCwIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import DataTable from '@/components/common/DataTable'
import EmptyState from '@/components/common/EmptyState'
import { fmtDateTime, rupiah } from '@/lib/format'
import { usePos } from '@/context/pos'

export default function OrdersOffline() {
  const { orders, syncOffline, offline, notify, logAction } = usePos()
  const queue = orders.filter((o) => o.pendingSync)
  const sync = () => {
    if (offline) return notify('Masih offline. Nyalakan koneksi dulu.')
    const n = syncOffline(); logAction(`Sinkron ${n} transaksi offline`); notify(`${n} transaksi tersinkron`)
  }
  if (!queue.length) return <Card><EmptyState icon={CloudOffIcon} title="Tidak ada transaksi offline" text="Matikan koneksi di pojok kanan atas lalu selesaikan penjualan di kasir. Transaksi akan antre di sini." /></Card>
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl bg-accent p-3 text-sm font-medium"><span>{queue.length} transaksi menunggu dikirim</span><Button size="sm" onClick={sync}><RefreshCwIcon /> Sinkron sekarang</Button></div>
      <DataTable rows={queue} columns={[{ key: 'id', header: 'No. Pesanan' }, { key: 't', header: 'Waktu', render: (o) => fmtDateTime(o.createdAt) }, { key: 'method', header: 'Metode' }, { key: 'total', header: 'Total', align: 'right', render: (o) => rupiah(o.total) }]} />
    </div>
  )
}
