import { useState } from 'react'
import { ArrowDownIcon, ArrowUpIcon, PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { usePos } from '@/context/pos'

export default function CategoriesTab() {
  const { categories, setCategories, products, notify, logAction } = usePos()
  const [name, setName] = useState('')
  const move = (i, d) => setCategories((cur) => { const a = [...cur]; const j = i + d; if (j < 0 || j >= a.length) return cur; [a[i], a[j]] = [a[j], a[i]]; return a })
  const upd = (id, patch) => setCategories((cur) => cur.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  const add = (e) => {
    e.preventDefault()
    const n = name.trim(); if (!n) return
    const id = n.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    if (categories.some((c) => c.id === id)) return notify('Kategori sudah ada')
    setCategories((cur) => [...cur, { id, name: n, active: true }]); logAction(`Menambah kategori ${n}`); setName(''); notify('Kategori ditambahkan')
  }
  return (
    <div className="max-w-2xl space-y-4">
      <form onSubmit={add} className="flex gap-2"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama kategori baru" aria-label="Nama kategori baru" className="h-11 rounded-xl border-0 bg-white" /><Button type="submit"><PlusIcon /> Tambah</Button></form>
      <Card className="divide-y divide-border px-4">
        {categories.map((c, i) => (
          <div key={c.id} className="flex items-center gap-3 py-3">
            <div className="flex flex-col"><button aria-label={`Naikkan ${c.name}`} disabled={i === 0} onClick={() => move(i, -1)} className="disabled:opacity-30"><ArrowUpIcon className="size-4" /></button><button aria-label={`Turunkan ${c.name}`} disabled={i === categories.length - 1} onClick={() => move(i, 1)} className="disabled:opacity-30"><ArrowDownIcon className="size-4" /></button></div>
            <Input aria-label={`Nama ${c.name}`} value={c.name} onChange={(e) => upd(c.id, { name: e.target.value })} className="h-10 rounded-lg border-0 bg-muted" />
            <span className="w-24 shrink-0 text-right text-[13px] text-muted-foreground">{products.filter((p) => p.cat === c.id).length} produk</span>
            <Switch checked={c.active} onCheckedChange={(v) => upd(c.id, { active: v })} aria-label={`Aktifkan ${c.name}`} />
          </div>
        ))}
      </Card>
      <p className="text-[13px] text-muted-foreground">Urutan di sini adalah urutan kategori di kasir dan aplikasi pelanggan.</p>
    </div>
  )
}
