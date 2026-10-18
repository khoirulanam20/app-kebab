import DataTable from '@/components/common/DataTable'
import { usePos } from '@/context/pos'
import { fmtDate, rupiah } from '@/lib/format'

export default function ShiftHistory() {
  const { pastShifts } = usePos()
  return (
    <DataTable columns={[
      { key: 'date', header: 'Tanggal', render: (r) => fmtDate(r.date) }, { key: 'cashier', header: 'Kasir' }, { key: 'outlet', header: 'Cabang' },
      { key: 'opening', header: 'Saldo awal', align: 'right', render: (r) => rupiah(r.opening) },
      { key: 'sales', header: 'Penjualan', align: 'right', render: (r) => rupiah(r.sales) },
      { key: 'diff', header: 'Selisih', align: 'right', render: (r) => <span className={r.diff ? 'text-primary' : ''}>{r.diff ? rupiah(r.diff) : 'Pas'}</span> },
    ]} rows={pastShifts} />
  )
}
