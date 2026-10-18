import { useEffect, useState } from 'react'
import { ChefHatIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import EmptyState from '@/components/common/EmptyState'
import PageHeader from '@/components/common/PageHeader'
import { fmtTime } from '@/lib/format'
import { usePos } from '@/context/pos'

const COLS = [['Menunggu', 'Baru masuk', 'Terima'], ['Diproses', 'Dimasak', 'Siap'], ['Siap', 'Siap diambil/kirim', 'Selesai']]

export default function Kitchen() {
  const { orders, updateOrder, outletId, user, settings, notify } = usePos()
  const cook = user?.role === 'Dapur'
  const [rejecting, setRejecting] = useState(null)
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(t) }, [])
  const mine = orders.filter((o) => o.outletId === outletId && ['Menunggu', 'Diproses', 'Siap'].includes(o.status))
  const nextStatus = (s) => (s === 'Menunggu' ? 'Diproses' : s === 'Diproses' ? 'Siap' : 'Selesai')
  const age = (o) => Math.max(0, Math.round((now - new Date(o.createdAt).getTime()) / 60000))
  return (
    <>
      <PageHeader title="Dapur (KDS)" description={cook ? 'Pesanan yang sedang dimasak. Tandai siap kalau selesai.' : 'Antrean pesanan cabang. Dapur bisa menerima dan memasak, Head Kitchen juga bisa menolak.'} />
      {!mine.length && <Card><EmptyState icon={ChefHatIcon} title="Antrean kosong" text="Pesanan baru akan muncul di sini." /></Card>}
      <div className="grid gap-4 lg:grid-cols-3">
        {COLS.map(([status, title, action]) => (
          <section key={status} aria-label={title}>
            <h2 className="mb-2 flex items-center gap-2 font-semibold">{title}<Badge variant="secondary">{mine.filter((o) => o.status === status).length}</Badge></h2>
            <div className="space-y-3">
              {mine.filter((o) => o.status === status).map((o) => (
                <Card key={o.id} className="gap-2 p-4">
                  <div className="flex items-center justify-between"><b>{o.id}</b><span className={`text-[13px] ${age(o) > 15 ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>{fmtTime(o.createdAt)} · {age(o)} mnt</span></div>
                  <p className="text-[13px] text-muted-foreground">{o.delivery ? 'Antar' : 'Ambil'} · {o.source}</p>
                  <ul className="text-sm font-medium">{o.items.map((i, n) => <li key={n}>{i.qty}× {i.name}{i.opts && <small className="block font-normal text-muted-foreground">{i.opts}</small>}</li>)}</ul>
                  {o.status === 'Siap' && (cook || o.pickupCode) ? <p className="rounded-lg bg-muted p-2 text-[13px] text-muted-foreground">{o.pickupCode ? 'Menunggu diambil pelanggan (kasir verifikasi kode)' : 'Diserahkan ke kasir/kurir'}</p> : (
                    <div className="flex gap-2">
                      {o.status === 'Menunggu' && !cook && <Button size="sm" variant="outline" onClick={() => setRejecting(o)}>Tolak</Button>}
                      <Button size="sm" className="flex-1" onClick={() => updateOrder(o.id, { status: nextStatus(o.status) }, `${action} pesanan ${o.id} (dapur)`)}>{action}</Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    <Dialog open={!!rejecting} onOpenChange={(o) => !o && setRejecting(null)}>
        <DialogContent className="gap-4 p-6">
          <div><DialogTitle className="text-lg font-semibold">Tolak {rejecting?.id}?</DialogTitle><DialogDescription>Pilih alasan. Pelanggan diberi tahu dan alasan dicatat.</DialogDescription></div>
          <div className="flex flex-wrap gap-2">{settings.orders.reasons.map((r) => <Button key={r} variant="outline" size="sm" onClick={() => { updateOrder(rejecting.id, { status: 'Dibatalkan', refundReason: r }, `Menolak pesanan ${rejecting.id}: ${r}`); notify('Pesanan ditolak'); setRejecting(null) }}>{r}</Button>)}</div>
        </DialogContent>
      </Dialog>
    </>
  )
}
