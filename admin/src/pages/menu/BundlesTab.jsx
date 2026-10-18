import { useState } from 'react'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { rupiah } from '@/lib/format'
import { usePos } from '@/context/pos'

export default function BundlesTab() {
  const { products, setProducts, outlets, notify, logAction } = usePos()
  const bundles = products.filter((p) => p.bundle)
  const singles = products.filter((p) => !p.bundle)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [items, setItems] = useState([{ pid: singles[0]?.id, qty: 1 }])
  const worth = items.reduce((s, i) => s + (singles.find((p) => p.id === Number(i.pid))?.price ?? 0) * i.qty, 0)
  const setItem = (i, patch) => setItems((cur) => cur.map((x, j) => (j === i ? { ...x, ...patch } : x)))

  const create = (e) => {
    e.preventDefault()
    if (!name.trim() || !Number(price) || !items.length) return notify('Isi nama, harga paket, dan minimal 1 item')
    setProducts((cur) => [{ id: Date.now(), sku: 'PKT-' + String(cur.length + 1).padStart(3, '0'), cat: 'paket', name: name.trim(), desc: items.map((i) => `${i.qty}× ${singles.find((p) => p.id === Number(i.pid))?.name}`).join(' + '), price: Number(price), was: worth > Number(price) ? worth : undefined, stock: 20, active: true, badge: 'Hemat', outlets: outlets.map((o) => o.id), outletPrice: {}, schedule: null, bundle: items.map((i) => ({ pid: Number(i.pid), qty: i.qty })) }, ...cur])
    logAction(`Membuat paket ${name.trim()}`); notify('Paket dibuat'); setName(''); setPrice(''); setItems([{ pid: singles[0]?.id, qty: 1 }])
  }
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
      <section className="space-y-3"><h2 className="font-semibold">Paket aktif</h2>
        {bundles.length ? bundles.map((b) => (
          <Card key={b.id} className="gap-1 p-4"><div className="flex items-center justify-between"><b>{b.name}</b>{b.was && <Badge>Hemat {rupiah(b.was - b.price)}</Badge>}</div>
            <p className="text-sm text-muted-foreground">{b.bundle.map((i) => `${i.qty}× ${products.find((p) => p.id === i.pid)?.name ?? '?'}`).join(' + ')}</p>
            <p className="font-semibold">{rupiah(b.price)} {b.was && <s className="text-[13px] font-normal text-muted-foreground">{rupiah(b.was)}</s>}</p></Card>
        )) : <p className="text-sm text-muted-foreground">Belum ada paket.</p>}
      </section>
      <Card className="h-fit p-5">
        <form onSubmit={create} className="space-y-3">
          <h2 className="font-semibold">Buat paket baru</h2>
          <div className="space-y-1.5"><Label htmlFor="bn">Nama paket</Label><Input id="bn" value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-xl border-0 bg-muted" /></div>
          {items.map((it, i) => (
            <div key={i} className="flex items-center gap-2">
              <NativeSelect aria-label="Produk" value={it.pid} onChange={(e) => setItem(i, { pid: e.target.value })}>{singles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</NativeSelect>
              <Input aria-label="Jumlah" inputMode="numeric" value={it.qty} onChange={(e) => setItem(i, { qty: Math.max(1, Number(e.target.value.replace(/\D/g, '')) || 1) })} className="h-11 w-16 rounded-xl border-0 bg-muted text-center" />
              <Button type="button" variant="ghost" size="icon" aria-label="Hapus item" disabled={items.length === 1} onClick={() => setItems((cur) => cur.filter((_, j) => j !== i))}><Trash2Icon /></Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => setItems((cur) => [...cur, { pid: singles[0]?.id, qty: 1 }])}><PlusIcon /> Item</Button>
          <p className="text-[13px] text-muted-foreground">Harga normal item: {rupiah(worth)}</p>
          <div className="space-y-1.5"><Label htmlFor="bp">Harga paket (Rp)</Label><Input id="bp" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))} className="h-11 rounded-xl border-0 bg-muted" />
            {Number(price) > 0 && <p className="text-[13px] text-muted-foreground">{worth > Number(price) ? `Pelanggan hemat ${rupiah(worth - Number(price))}` : 'Harga paket tidak lebih murah dari item satuan.'}</p>}</div>
          <Button type="submit" className="w-full">Simpan paket</Button>
        </form>
      </Card>
    </div>
  )
}
