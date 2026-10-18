import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { Switch } from '@/components/ui/switch'
import DataTable from '@/components/common/DataTable'
import { fmtDateTime, rupiah } from '@/lib/format'
import { usePos } from '@/context/pos'

const field = 'h-11 rounded-xl border-0 bg-muted'
export default function FlashTab() {
  const { flashSales, setFlashSales, products, notify, logAction } = usePos()
  const [f, setF] = useState({ pid: products[0]?.id, price: '', from: '2026-10-18T10:00', to: '2026-10-18T17:00' })
  const prod = (id) => products.find((p) => p.id === Number(id))
  const add = (e) => {
    e.preventDefault()
    const p = prod(f.pid); const price = Number(f.price)
    if (!price || price >= p.price) return notify(`Harga flash harus lebih murah dari ${rupiah(p.price)}`)
    if (f.to <= f.from) return notify('Waktu selesai harus setelah mulai')
    setFlashSales((c) => [{ id: Date.now(), pid: p.id, price, from: f.from, to: f.to, active: true }, ...c]); logAction(`Membuat flash sale ${p.name}`); notify('Flash sale dibuat'); setF({ ...f, price: '' })
  }
  const now = new Date().toISOString().slice(0, 16)
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <DataTable rows={flashSales} empty="Belum ada flash sale." columns={[
        { key: 'p', header: 'Produk', render: (s) => <b className="font-medium">{prod(s.pid)?.name}</b> },
        { key: 'price', header: 'Harga', align: 'right', render: (s) => <>{rupiah(s.price)} <s className="text-[13px] text-muted-foreground">{rupiah(prod(s.pid)?.price ?? 0)}</s></> },
        { key: 'w', header: 'Periode', render: (s) => `${fmtDateTime(s.from)} – ${fmtDateTime(s.to)}` },
        { key: 'st', header: 'Status', render: (s) => (s.active && s.from <= now && s.to >= now ? <Badge>Berjalan</Badge> : <Badge variant="secondary">{s.active ? 'Terjadwal/selesai' : 'Nonaktif'}</Badge>) },
        { key: 'on', header: 'Aktif', render: (s) => <Switch checked={s.active} onCheckedChange={(v) => setFlashSales((c) => c.map((x) => (x.id === s.id ? { ...x, active: v } : x)))} aria-label="Aktif" /> },
      ]} />
      <Card className="h-fit p-5"><form onSubmit={add} className="space-y-3"><h2 className="font-semibold">Flash sale baru</h2>
        <div className="space-y-1.5"><Label htmlFor="fp">Produk</Label><NativeSelect id="fp" value={f.pid} onChange={(e) => setF({ ...f, pid: e.target.value })}>{products.map((p) => <option key={p.id} value={p.id}>{p.name} ({rupiah(p.price)})</option>)}</NativeSelect></div>
        <div className="space-y-1.5"><Label htmlFor="fh">Harga flash (Rp)</Label><Input id="fh" inputMode="numeric" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value.replace(/\D/g, '') })} className={field} /></div>
        <div className="space-y-1.5"><Label htmlFor="ff">Mulai</Label><Input id="ff" type="datetime-local" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} className={field} /></div>
        <div className="space-y-1.5"><Label htmlFor="ft">Selesai</Label><Input id="ft" type="datetime-local" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} className={field} /></div>
        <Button type="submit" className="w-full">Buat flash sale</Button></form></Card>
    </div>
  )
}
