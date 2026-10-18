import { useRef, useState } from 'react'
import { DownloadIcon, ImageIcon, PlusIcon, SearchIcon, Trash2Icon, UploadIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import DataTable from '@/components/common/DataTable'
import { rupiah } from '@/lib/format'
import { cleanVariants } from '@/lib/variants'
import { usePos } from '@/context/pos'
import { catIcons } from '@/mock'

const num = (v) => v.replace(/\D/g, '')
const field = 'h-11 rounded-xl border-0 bg-muted'

export default function ProductsTab() {
  const { products, setProducts, categories, outlets, notify, logAction } = usePos()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('all')
  const [edit, setEdit] = useState(null)
  const fileRef = useRef()

  const rows = products.filter((p) => (cat === 'all' || p.cat === cat) && (p.name + p.sku).toLowerCase().includes(q.toLowerCase()))
  const toggle = (p) => { setProducts((cur) => cur.map((x) => (x.id === p.id ? { ...x, active: !x.active } : x))); logAction(`${p.active ? 'Menonaktifkan' : 'Mengaktifkan'} ${p.name}`) }
  const blank = { name: '', desc: '', cat: categories[0]?.id, price: '', was: '', stock: '', sku: '', badge: '', opts: false, variants: [], active: true, outlets: outlets.map((o) => o.id), outletPrice: {}, schedule: null, image: null }

  const save = (e) => {
    e.preventDefault()
    const variants = cleanVariants(edit.variants ?? [])
    if ((edit.variants ?? []).length !== variants.length) return notify('Lengkapi nama grup dan minimal satu pilihan di setiap varian, atau hapus grup yang kosong')
    const data = { ...edit, variants, price: Number(edit.price), was: edit.was ? Number(edit.was) : undefined, stock: Number(edit.stock) || 0, badge: edit.badge || undefined }
    if (!data.name.trim() || !data.price) return notify('Nama dan harga wajib diisi')
    if (data.id) setProducts((cur) => cur.map((x) => (x.id === data.id ? { ...x, ...data } : x)))
    else setProducts((cur) => [{ ...data, id: Date.now() }, ...cur])
    logAction(`${data.id ? 'Mengubah' : 'Menambah'} produk ${data.name}`); setEdit(null); notify('Produk disimpan')
  }
  const pickImage = (e) => { const f = e.target.files?.[0]; if (f) setEdit({ ...edit, image: URL.createObjectURL(f) }) }
  const toggleOutlet = (id) => setEdit({ ...edit, outlets: edit.outlets.includes(id) ? edit.outlets.filter((x) => x !== id) : [...edit.outlets, id] })

  const exportCsv = () => {
    const esc = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`
    const csv = [['sku', 'nama', 'kategori', 'harga', 'stok'], ...products.map((p) => [p.sku, p.name, p.cat, p.price, p.stock])].map((r) => r.map(esc).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
    Object.assign(document.createElement('a'), { href: url, download: 'menu.csv' }).click(); URL.revokeObjectURL(url)
  }
  const importCsv = async (e) => {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    const lines = (await file.text()).replace(/^﻿/, '').split(/\r?\n/).filter(Boolean).slice(1)
    const added = lines.map((l, i) => {
      const [sku, name, c, price, stock] = l.split(',').map((x) => x.replace(/^"|"$/g, '').trim())
      return name && Number(price) ? { ...blank, id: Date.now() + i, sku, name, cat: categories.some((x) => x.id === c) ? c : categories[0].id, price: Number(price), stock: Number(stock) || 0 } : null
    }).filter(Boolean)
    if (!added.length) return notify('Format CSV tidak dikenali (kolom: sku,nama,kategori,harga,stok)')
    setProducts((cur) => [...added, ...cur]); logAction(`Impor ${added.length} produk dari CSV`); notify(`${added.length} produk diimpor`)
  }

  const cols = [
    { key: 'name', header: 'Produk', render: (p) => { const Icon = catIcons[p.cat] ?? ImageIcon; return <span className="flex items-center gap-3"><span aria-hidden className="flex size-10 items-center justify-center overflow-hidden rounded-lg bg-accent/30 text-primary">{p.image ? <img src={p.image} alt="" className="size-full object-cover" /> : <Icon className="size-5" />}</span><span><b className="font-medium">{p.name}</b><small className="block text-muted-foreground">{p.sku}</small></span></span> } },
    { key: 'cat', header: 'Kategori', render: (p) => categories.find((c) => c.id === p.cat)?.name },
    { key: 'variants', header: 'Varian', render: (p) => (p.variants?.length ? <span className="text-sm">{p.variants.map((g) => g.name).join(', ')}</span> : <span className="text-muted-foreground">—</span>) },
    { key: 'price', header: 'Harga', align: 'right', render: (p) => <>{p.was && <s className="mr-1 text-[13px] text-muted-foreground">{rupiah(p.was)}</s>}{rupiah(p.price)}</> },
    { key: 'outlets', header: 'Cabang', render: (p) => p.outlets?.length === outlets.length ? 'Semua' : p.outlets?.map((id) => outlets.find((o) => o.id === id)?.name.split('– ').pop()).join(', ') || '-' },
    { key: 'stock', header: 'Stok', align: 'right', render: (p) => p.stock <= 0 ? <Badge variant="secondary">Habis</Badge> : p.stock },
    { key: 'active', header: 'Tampil', render: (p) => <span onClick={(e) => e.stopPropagation()}><Switch checked={p.active} onCheckedChange={() => toggle(p)} aria-label={`Tampilkan ${p.name}`} /></span> },
  ]

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs"><SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari produk atau SKU" aria-label="Cari produk" className="h-10 rounded-full border-0 bg-white pl-10" /></div>
        <div role="group" aria-label="Kategori" className="no-scrollbar flex gap-2 overflow-x-auto">{[{ id: 'all', name: 'Semua' }, ...categories].map((c) => <button key={c.id} onClick={() => setCat(c.id)} aria-pressed={cat === c.id} className={`h-10 shrink-0 rounded-full px-4 text-sm font-medium ${cat === c.id ? 'bg-primary text-white' : 'bg-white'}`}>{c.name}</button>)}</div>
        <div className="ml-auto flex gap-2">
          <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={importCsv} className="hidden" aria-label="Impor CSV" />
          <Button variant="outline" size="sm" onClick={() => fileRef.current.click()}><UploadIcon /> Impor CSV</Button>
          <Button variant="outline" size="sm" onClick={exportCsv}><DownloadIcon /> Ekspor CSV</Button>
          <Button onClick={() => setEdit(blank)}><PlusIcon /> Tambah produk</Button>
        </div>
      </div>
      <DataTable columns={cols} rows={rows} onRowClick={(p) => setEdit(structuredClone(p))} empty="Produk tidak ditemukan." />

      <Sheet open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <SheetContent side="right" className="w-full max-w-lg overflow-y-auto p-6">
          {edit && (
            <form onSubmit={save} className="space-y-4">
              <div><SheetTitle className="font-display text-xl">{edit.id ? 'Ubah produk' : 'Produk baru'}</SheetTitle><SheetDescription>Perubahan tampil di kasir dan aplikasi pelanggan.</SheetDescription></div>
              <div className="flex items-center gap-4"><span className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-accent/30 text-primary">{edit.image ? <img src={edit.image} alt="Foto produk" className="size-full object-cover" /> : <ImageIcon className="size-8" aria-hidden />}</span>
                <div><Label htmlFor="photo" className="mb-1.5 block">Foto produk</Label><input id="photo" type="file" accept="image/*" onChange={pickImage} className="text-sm file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium" /></div></div>
              <div className="space-y-1.5"><Label htmlFor="pn">Nama produk</Label><Input id="pn" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} className={field} /></div>
              <div className="space-y-1.5"><Label htmlFor="pd">Deskripsi</Label><textarea id="pd" rows={3} value={edit.desc} onChange={(e) => setEdit({ ...edit, desc: e.target.value })} className="w-full rounded-xl bg-muted p-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/40" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label htmlFor="pc">Kategori</Label><NativeSelect id="pc" value={edit.cat} onChange={(e) => setEdit({ ...edit, cat: e.target.value })}>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</NativeSelect></div>
                <div className="space-y-1.5"><Label htmlFor="ps">SKU</Label><Input id="ps" value={edit.sku} onChange={(e) => setEdit({ ...edit, sku: e.target.value })} className={field} /></div>
                <div className="space-y-1.5"><Label htmlFor="pp">Harga (Rp)</Label><Input id="pp" inputMode="numeric" value={edit.price} onChange={(e) => setEdit({ ...edit, price: num(e.target.value) })} className={field} /></div>
                <div className="space-y-1.5"><Label htmlFor="pw">Harga coret (Rp)</Label><Input id="pw" inputMode="numeric" value={edit.was ?? ''} onChange={(e) => setEdit({ ...edit, was: num(e.target.value) })} className={field} /></div>
                <div className="space-y-1.5"><Label htmlFor="pk">Stok</Label><Input id="pk" inputMode="numeric" value={edit.stock} onChange={(e) => setEdit({ ...edit, stock: num(e.target.value) })} className={field} /></div>
                <div className="space-y-1.5"><Label htmlFor="pb">Label</Label><NativeSelect id="pb" value={edit.badge ?? ''} onChange={(e) => setEdit({ ...edit, badge: e.target.value })}><option value="">Tanpa label</option>{['Terlaris', 'Baru', 'Hemat'].map((b) => <option key={b}>{b}</option>)}</NativeSelect></div>
              </div>
              <fieldset className="space-y-2 rounded-xl bg-muted p-3"><legend className="px-1 text-sm font-medium">Ketersediaan dan harga per cabang</legend>
                {outlets.map((o) => (
                  <div key={o.id} className="flex items-center gap-3 text-sm">
                    <label className="flex flex-1 items-center gap-2"><Checkbox checked={edit.outlets?.includes(o.id)} onCheckedChange={() => toggleOutlet(o.id)} aria-label={`Tersedia di ${o.name}`} />{o.name.split('– ').pop()}</label>
                    <Input inputMode="numeric" aria-label={`Harga di ${o.name}`} placeholder={`Harga ${edit.price || 'default'}`} value={edit.outletPrice?.[o.id] ?? ''} onChange={(e) => setEdit({ ...edit, outletPrice: { ...edit.outletPrice, [o.id]: num(e.target.value) ? Number(num(e.target.value)) : undefined } })} className="h-9 w-32 rounded-lg border-0 bg-white text-right" />
                  </div>
                ))}
                <p className="text-[13px] text-muted-foreground">Kosongkan harga untuk memakai harga default.</p></fieldset>
              <fieldset className="space-y-2 rounded-xl bg-muted p-3"><legend className="px-1 text-sm font-medium">Jadwal menu</legend>
                <label className="flex items-center gap-2 text-sm"><Checkbox checked={!!edit.schedule} onCheckedChange={(v) => setEdit({ ...edit, schedule: v ? { from: '10:00', to: '17:00' } : null })} aria-label="Batasi jam tersedia" />Hanya tersedia pada jam tertentu</label>
                {edit.schedule && <div className="grid grid-cols-2 gap-3"><Input type="time" aria-label="Dari jam" value={edit.schedule.from} onChange={(e) => setEdit({ ...edit, schedule: { ...edit.schedule, from: e.target.value } })} className="h-10 rounded-lg border-0 bg-white" /><Input type="time" aria-label="Sampai jam" value={edit.schedule.to} onChange={(e) => setEdit({ ...edit, schedule: { ...edit.schedule, to: e.target.value } })} className="h-10 rounded-lg border-0 bg-white" /></div>}</fieldset>
              <fieldset className="space-y-3 rounded-xl bg-muted p-3"><legend className="px-1 text-sm font-medium">Varian menu</legend>
                <p className="text-[13px] text-muted-foreground">Pilihan khusus produk ini, mis. Isi: Sapi / Ayam. Tampil di detail produk saat kasir memilih menu.</p>
                {(edit.variants ?? []).map((g, gi) => {
                  const setG = (patch) => setEdit({ ...edit, variants: edit.variants.map((x, i) => (i === gi ? { ...x, ...patch } : x)) })
                  const setItem = (ii, patch) => setG({ items: g.items.map((x, i) => (i === ii ? { ...x, ...patch } : x)) })
                  return (
                    <div key={g.id} className="space-y-2 rounded-xl bg-white p-3">
                      <div className="flex items-center gap-2"><Input aria-label="Nama grup varian" placeholder="Nama grup, mis. Isi daging" value={g.name} onChange={(e) => setG({ name: e.target.value })} className="h-10 rounded-lg border-0 bg-muted font-medium" />
                        <Button type="button" variant="ghost" size="icon" aria-label={`Hapus grup ${g.name || 'varian'}`} onClick={() => setEdit({ ...edit, variants: edit.variants.filter((_, i) => i !== gi) })}><Trash2Icon /></Button></div>
                      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
                        <label className="flex items-center gap-2">Wajib dipilih<Switch checked={!!g.required} onCheckedChange={(v) => setG({ required: v })} aria-label={`Wajib dipilih ${g.name}`} /></label>
                        <label className="flex items-center gap-2">Boleh banyak<Switch checked={!!g.multi} onCheckedChange={(v) => setG({ multi: v })} aria-label={`Boleh pilih banyak ${g.name}`} /></label>
                      </div>
                      {g.items.map((it, ii) => (
                        <div key={ii} className="flex items-center gap-2">
                          <Input aria-label="Nama pilihan" placeholder="Pilihan, mis. Sapi" value={it.n} onChange={(e) => setItem(ii, { n: e.target.value })} className="h-10 rounded-lg border-0 bg-muted" />
                          <Input aria-label="Tambahan harga" inputMode="numeric" placeholder="+Rp" value={it.add || ''} onChange={(e) => setItem(ii, { add: Number(num(e.target.value)) || 0 })} className="h-10 w-28 rounded-lg border-0 bg-muted text-right" />
                          <Button type="button" variant="ghost" size="icon" aria-label={`Hapus pilihan ${it.n}`} onClick={() => setG({ items: g.items.filter((_, i) => i !== ii) })}><Trash2Icon /></Button>
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={() => setG({ items: [...g.items, { n: '', add: 0 }] })}><PlusIcon /> Pilihan</Button>
                    </div>
                  )
                })}
                <Button type="button" variant="outline" size="sm" onClick={() => setEdit({ ...edit, variants: [...(edit.variants ?? []), { id: `v-${Date.now()}`, name: '', required: false, multi: false, items: [{ n: '', add: 0 }] }] })}><PlusIcon /> Grup varian</Button>
              </fieldset>
              <label className="flex items-center justify-between text-sm"><span>Pakai opsi bersama (ukuran, level pedas, tambahan)</span><Switch checked={!!edit.opts} onCheckedChange={(v) => setEdit({ ...edit, opts: v })} aria-label="Pakai opsi" /></label>
              <label className="flex items-center justify-between text-sm"><span>Tampil di kasir dan aplikasi</span><Switch checked={edit.active} onCheckedChange={(v) => setEdit({ ...edit, active: v })} aria-label="Tampil" /></label>
              <div className="grid grid-cols-2 gap-2"><Button type="button" variant="outline" onClick={() => setEdit(null)}>Batal</Button><Button type="submit">Simpan</Button></div>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
