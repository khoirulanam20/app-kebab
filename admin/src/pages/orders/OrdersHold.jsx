import { PauseCircleIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import EmptyState from '@/components/common/EmptyState'
import { fmtTime, rupiah } from '@/lib/format'
import { usePos } from '@/context/pos'

export default function OrdersHold() {
  const nav = useNavigate()
  const { holds, resumeHold, deleteHold, lines } = usePos()
  if (!holds.length) return <Card><EmptyState icon={PauseCircleIcon} title="Tidak ada keranjang di-hold" text="Tekan Hold di halaman kasir untuk menyimpan pesanan sementara." /></Card>
  const resume = (id) => { resumeHold(id); nav('/') }
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {holds.map((h) => (
        <Card key={h.id} className="gap-3 p-4">
          <div className="flex items-center justify-between"><h3 className="font-semibold">{h.label}</h3><span className="text-[13px] text-muted-foreground">{fmtTime(h.createdAt)}</span></div>
          <ul className="text-sm text-muted-foreground">{h.lines.map((l) => <li key={l.key}>{l.qty}× {l.name}</li>)}</ul>
          <p className="font-semibold tabular-nums">{rupiah(h.lines.reduce((s, l) => s + l.unit * l.qty, 0))}</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => deleteHold(h.id)}>Hapus</Button>
            <Button size="sm" disabled={lines.length > 0} onClick={() => resume(h.id)}>Lanjutkan</Button>
          </div>
          {lines.length > 0 && <p className="text-[13px] text-muted-foreground">Kosongkan keranjang aktif dulu untuk melanjutkan.</p>}
        </Card>
      ))}
    </div>
  )
}
