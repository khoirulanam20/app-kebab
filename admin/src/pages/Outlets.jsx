import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRightIcon, MapPinIcon, PlusIcon, UserRoundIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import OutletForm, { blankOutlet } from '@/components/outlets/OutletForm'
import PageHeader from '@/components/common/PageHeader'
import { rupiah } from '@/lib/format'
import { usePos } from '@/context/pos'
import { DAYS, TODAY } from '@/mock'

export const todayStatus = (o) => { const h = o.hours[DAYS[(new Date(TODAY).getDay() + 6) % 7]]; return o.tempClosed ? 'Tutup sementara' : h.closed ? 'Libur hari ini' : `Buka ${h.open}–${h.close}` }
export const outletStats = (orders, id) => {
  const mine = orders.filter((o) => o.outletId === id)
  const today = mine.filter((o) => o.createdAt.slice(0, 10) === TODAY)
  const done = today.filter((o) => o.status === 'Selesai')
  return { sales: done.reduce((s, o) => s + o.total, 0), orders: done.length, active: mine.filter((o) => ['Menunggu', 'Diproses', 'Siap', 'Dikirim'].includes(o.status)).length, waiting: mine.filter((o) => o.status === 'Menunggu').length }
}

export default function Outlets() {
  const { outlets, setOutlets, orders, staff, logAction, notify } = usePos()
  const [adding, setAdding] = useState(false)
  const create = (o) => { setOutlets((c) => [...c, { ...o, id: Date.now() }]); logAction(`Menambah cabang ${o.name}`); setAdding(false); notify('Cabang ditambahkan. Tambahkan Head Kitchen di Pengaturan › Staf.') }
  return (
    <>
      <PageHeader title="Cabang" description="Pilih cabang untuk melihat penjualan, pesanan, laporan, tim, dan pengaturannya."><Button onClick={() => setAdding(true)}><PlusIcon /> Cabang baru</Button></PageHeader>
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {outlets.map((o) => {
          const st = outletStats(orders, o.id)
          const head = staff.find((s) => s.role === 'Head Kitchen' && s.outletId === o.id)
          return (
            <Link key={o.id} to={`/cabang/${o.id}`} aria-label={`Detail ${o.name}`} className="group block">
              <Card className="gap-3 p-5 transition group-hover:ring-2 group-hover:ring-primary">
                <div className="flex items-start justify-between gap-2"><h2 className="font-semibold">{o.name}</h2>{o.tempClosed ? <Badge variant="secondary">Tutup sementara</Badge> : o.active ? <Badge>Aktif</Badge> : <Badge variant="secondary">Nonaktif</Badge>}</div>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><MapPinIcon className="size-4 shrink-0" aria-hidden />{o.address}</p>
                <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted p-3 text-center">
                  <div><p className="text-[13px] text-muted-foreground">Penjualan hari ini</p><p className="font-semibold tabular-nums">{rupiah(st.sales)}</p></div>
                  <div><p className="text-[13px] text-muted-foreground">Pesanan</p><p className="font-semibold tabular-nums">{st.orders}</p></div>
                  <div><p className="text-[13px] text-muted-foreground">Berjalan</p><p className={`font-semibold tabular-nums ${st.waiting ? 'text-primary' : ''}`}>{st.active}{st.waiting ? ` (${st.waiting} baru)` : ''}</p></div>
                </div>
                <div className="flex items-center justify-between text-sm"><span className="flex items-center gap-1.5 text-muted-foreground"><UserRoundIcon className="size-4" aria-hidden />Head Kitchen: <b className="font-medium text-foreground">{head?.name ?? '—'}</b></span><span className="flex items-center font-medium text-primary">Lihat detail <ChevronRightIcon className="size-4" /></span></div>
                <p className="text-[13px] text-muted-foreground">{todayStatus(o)} · {staff.filter((s) => s.outletId === o.id).length} staf</p>
              </Card>
            </Link>
          )
        })}
      </div>
      <Sheet open={adding} onOpenChange={setAdding}>
        <SheetContent side="right" className="w-full max-w-xl overflow-y-auto p-6">
          <SheetTitle className="font-display text-xl">Cabang baru</SheetTitle><SheetDescription className="mb-4">Atur data, jam buka, dan antar. Setelah dibuat, tambahkan Head Kitchen.</SheetDescription>
          {adding && <OutletForm initial={blankOutlet()} onSave={create} onCancel={() => setAdding(false)} />}
        </SheetContent>
      </Sheet>
    </>
  )
}
