import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import EmptyState from '@/components/common/EmptyState'
import { WalletIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { rupiah } from '@/lib/format'
import { usePos } from '@/context/pos'
import { shiftSummary } from './shift-summary'

export default function CashDrawer() {
  const { shift, closeShift, notify } = usePos()
  const [counted, setCounted] = useState('')
  const [remark, setRemark] = useState('')
  if (!shift) return <Card><EmptyState icon={WalletIcon} title="Shift belum dibuka" text="Buka shift dari halaman kasir untuk mulai mencatat penjualan."><Button render={<Link to="/kasir" />} className="mt-2">Ke Kasir</Button></EmptyState></Card>
  const s = shiftSummary(shift)
  const diff = counted === '' ? null : Number(counted) - s.expected
  const rows = [['Saldo awal laci', s.opening], ['Penjualan tunai', s.cash], ['Penjualan QRIS', s.qris], ['Penjualan kartu', s.card], ['Penjualan transfer', s.transfer]]
  const submit = (e) => { e.preventDefault(); closeShift(); notify('Shift ditutup') }
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="gap-3 p-5">
        <h2 className="font-semibold">Ringkasan laci</h2>
        <dl className="space-y-2 text-sm">
          {rows.map(([l, v]) => <div key={l} className="flex justify-between"><dt className="text-muted-foreground">{l}</dt><dd className="tabular-nums">{rupiah(v)}</dd></div>)}
          <div className="flex justify-between border-t border-dashed border-border pt-3 text-base font-semibold"><dt>Uang yang seharusnya di laci</dt><dd className="tabular-nums">{rupiah(s.expected)}</dd></div>
        </dl>
      </Card>
      <Card className="p-5">
        <form onSubmit={submit} className="space-y-4">
          <h2 className="font-semibold">Tutup shift</h2>
          <div className="space-y-1.5"><Label htmlFor="counted">Uang hasil hitung (Rp)</Label><Input id="counted" inputMode="numeric" required value={counted} onChange={(e) => setCounted(e.target.value.replace(/\D/g, ''))} className="h-11 rounded-xl border-0 bg-muted" /></div>
          {diff !== null && <p className={`text-sm font-medium ${diff === 0 ? 'text-foreground' : 'text-primary'}`} aria-live="polite">{diff === 0 ? 'Pas, tidak ada selisih.' : `Selisih ${diff > 0 ? '+' : '−'}${rupiah(Math.abs(diff))}`}</p>}
          <div className="space-y-1.5"><Label htmlFor="remark">Catatan</Label><textarea id="remark" rows={3} value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Mis. selisih karena uang kembalian" className="w-full rounded-xl bg-muted p-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/40" /></div>
          <Button type="submit" className="w-full">Tutup shift</Button>
        </form>
      </Card>
    </div>
  )
}
