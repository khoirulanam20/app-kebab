import { Card } from '@/components/ui/card'
import MetricCard from '@/components/common/MetricCard'
import DataTable from '@/components/common/DataTable'
import { WalletIcon, ReceiptTextIcon, BanknoteIcon } from 'lucide-react'
import { rupiah, fmtTime } from '@/lib/format'
import { usePos } from '@/context/pos'
import { shiftSummary } from './shift-summary'

export default function TodaySales() {
  const { shift, orders } = usePos()
  const s = shiftSummary(shift)
  const mine = orders.filter((o) => shift && o.createdAt >= shift.openedAt)
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <MetricCard label="Penjualan shift ini" value={rupiah(s.total)} icon={WalletIcon} />
        <MetricCard label="Jumlah transaksi" value={s.count} icon={ReceiptTextIcon} />
        <MetricCard label="Tunai di laci" value={rupiah(s.expected)} hint="Termasuk saldo awal" icon={BanknoteIcon} />
      </div>
      <Card className="p-4"><h2 className="font-semibold">Transaksi shift ini</h2></Card>
      <DataTable columns={[{ key: 'id', header: 'No. Pesanan' }, { key: 't', header: 'Jam', render: (o) => fmtTime(o.createdAt) }, { key: 'method', header: 'Metode' }, { key: 'total', header: 'Total', align: 'right', render: (o) => rupiah(o.total) }]} rows={mine} empty="Belum ada transaksi di shift ini." />
    </div>
  )
}
