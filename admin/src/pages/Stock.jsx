import { useState } from 'react'
import { AlertTriangleIcon, PlusIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import DataTable from '@/components/common/DataTable'
import PageHeader from '@/components/common/PageHeader'
import { fmtDateTime, rupiah } from '@/lib/format'
import { usePos } from '@/context/pos'

const TABS = [['ingredients', 'Bahan baku'], ['recipes', 'Resep'], ['movements', 'Pergerakan'], ['opname', 'Opname']]
const field = 'h-11 rounded-xl border-0 bg-muted'

export default function Stock() {
  const { ingredients, setIngredients, recipes, setRecipes, movements, setMovements, products, notify, logAction } = usePos()
  const [tab, setTab] = useState('ingredients')
  const [dialog, setDialog] = useState(null) // {kind:'new'|'in'|'out', ing?}
  const [form, setForm] = useState({ name: '', unit: 'kg', min: '', cost: '', qty: '', note: '' })
  const [counted, setCounted] = useState({})
  const [recipeFor, setRecipeFor] = useState(products[0]?.id)
  const low = ingredients.filter((g) => g.stock <= g.min)
  const log = (ingredient, type, qty, note) => setMovements((m) => [{ id: Date.now() + Math.random(), at: new Date().toISOString(), ingredient, type, qty, note }, ...m])

  const submit = (e) => {
    e.preventDefault()
    const qty = Number(form.qty)
    if (dialog.kind === 'new') {
      if (!form.name.trim()) return
      setIngredients((c) => [...c, { id: Date.now(), name: form.name.trim(), unit: form.unit, stock: qty || 0, min: Number(form.min) || 0, cost: Number(form.cost) || 0 }])
      if (qty) log(form.name.trim(), 'Masuk', qty, 'Stok awal'); logAction(`Menambah bahan ${form.name.trim()}`)
    } else {
      if (!qty) return notify('Isi jumlah')
      const delta = dialog.kind === 'in' ? qty : -qty
      setIngredients((c) => c.map((g) => (g.id === dialog.ing.id ? { ...g, stock: Math.max(0, +(g.stock + delta).toFixed(3)) } : g)))
      log(dialog.ing.name, dialog.kind === 'in' ? 'Masuk' : 'Keluar', delta, form.note); logAction(`Stok ${dialog.ing.name} ${delta > 0 ? '+' : ''}${delta} ${dialog.ing.unit}`)
    }
    notify('Stok diperbarui'); setDialog(null); setForm({ name: '', unit: 'kg', min: '', cost: '', qty: '', note: '' })
  }
  const applyOpname = () => {
    let changed = 0
    ingredients.forEach((g) => {
      const c = counted[g.id]; if (c === undefined || c === '') return
      const diff = +(Number(c) - g.stock).toFixed(3); if (!diff) return
      changed++; log(g.name, 'Opname', diff, `Hitung fisik ${c} ${g.unit}`)
    })
    setIngredients((cur) => cur.map((g) => (counted[g.id] !== undefined && counted[g.id] !== '' ? { ...g, stock: Number(counted[g.id]) } : g)))
    setCounted({}); logAction(`Opname stok (${changed} bahan berubah)`); notify(changed ? `${changed} bahan disesuaikan` : 'Tidak ada selisih')
  }
  const recipe = recipes[recipeFor] ?? []
  const setRecipe = (r) => setRecipes((cur) => ({ ...cur, [recipeFor]: r }))
  const hpp = (r) => r.reduce((s, [id, q]) => s + (ingredients.find((g) => g.id === id)?.cost ?? 0) * q, 0)
  const prod = products.find((p) => p.id === Number(recipeFor))

  return (
    <>
      <PageHeader title="Stok" description="Bahan baku, resep, pergerakan stok, dan opname. Stok berkurang otomatis tiap penjualan.">
        {tab === 'ingredients' && <Button onClick={() => setDialog({ kind: 'new' })}><PlusIcon /> Bahan baru</Button>}
      </PageHeader>
      {low.length > 0 && <p role="status" className="mb-4 flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-medium text-primary"><AlertTriangleIcon className="size-4" aria-hidden />{low.length} bahan di bawah batas minimum: {low.map((g) => g.name).join(', ')}</p>}
      <div role="tablist" aria-label="Stok" className="no-scrollbar mb-4 flex gap-6 overflow-x-auto border-b border-border">{TABS.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`relative h-11 shrink-0 text-sm font-medium ${tab === k ? 'text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:rounded-t after:bg-primary' : 'text-muted-foreground'}`}>{l}</button>)}</div>

      {tab === 'ingredients' && <DataTable rows={ingredients} columns={[
        { key: 'name', header: 'Bahan', render: (g) => <b className="font-medium">{g.name}</b> },
        { key: 'stock', header: 'Stok', align: 'right', render: (g) => <span className={g.stock <= g.min ? 'font-semibold text-primary' : ''}>{g.stock} {g.unit}{g.stock <= g.min && <Badge className="ml-2">Menipis</Badge>}</span> },
        { key: 'min', header: 'Minimum', align: 'right', render: (g) => `${g.min} ${g.unit}` },
        { key: 'cost', header: 'Harga / satuan', align: 'right', render: (g) => rupiah(g.cost) },
        { key: 'act', header: '', align: 'right', render: (g) => <span className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => setDialog({ kind: 'in', ing: g })}>Masuk</Button><Button size="sm" variant="outline" onClick={() => setDialog({ kind: 'out', ing: g })}>Keluar</Button></span> },
      ]} />}

      {tab === 'recipes' && (
        <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
          <Card className="max-h-[480px] divide-y divide-border overflow-y-auto">{products.map((p) => <button key={p.id} onClick={() => setRecipeFor(p.id)} aria-pressed={recipeFor === p.id} className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm ${recipeFor === p.id ? 'bg-accent/40 font-medium' : ''}`}>{p.name}<span className="text-[13px] text-muted-foreground">{(recipes[p.id] ?? []).length} bahan</span></button>)}</Card>
          <Card className="gap-3 p-5">
            <h2 className="font-semibold">Resep {prod?.name}</h2>
            {recipe.map(([id, q], i) => (
              <div key={i} className="flex items-center gap-2">
                <NativeSelect aria-label="Bahan" value={id} onChange={(e) => setRecipe(recipe.map((r, j) => (j === i ? [Number(e.target.value), r[1]] : r)))}>{ingredients.map((g) => <option key={g.id} value={g.id}>{g.name} ({g.unit})</option>)}</NativeSelect>
                <Input aria-label="Jumlah per porsi" inputMode="decimal" value={q} onChange={(e) => setRecipe(recipe.map((r, j) => (j === i ? [r[0], Number(e.target.value.replace(',', '.')) || 0] : r)))} className="h-11 w-24 rounded-xl border-0 bg-muted text-right" />
                <Button variant="ghost" size="sm" onClick={() => setRecipe(recipe.filter((_, j) => j !== i))}>Hapus</Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="self-start" onClick={() => setRecipe([...recipe, [ingredients[0].id, 1]])}><PlusIcon /> Bahan</Button>
            <div className="mt-2 flex justify-between border-t border-dashed border-border pt-3 text-sm"><span>HPP per porsi</span><b className="tabular-nums">{rupiah(hpp(recipe))}</b></div>
            {prod && <div className="flex justify-between text-sm"><span>Harga jual {rupiah(prod.price)}</span><b className="tabular-nums">Margin {prod.price ? Math.round(((prod.price - hpp(recipe)) / prod.price) * 100) : 0}%</b></div>}
            <Button onClick={() => { logAction(`Menyimpan resep ${prod?.name}`); notify('Resep disimpan') }}>Simpan resep</Button>
          </Card>
        </div>
      )}

      {tab === 'movements' && <DataTable rows={movements} empty="Belum ada pergerakan stok." columns={[
        { key: 'at', header: 'Waktu', render: (m) => fmtDateTime(m.at) }, { key: 'ingredient', header: 'Bahan' },
        { key: 'type', header: 'Jenis', render: (m) => <Badge variant={m.qty < 0 ? 'secondary' : 'default'}>{m.type}</Badge> },
        { key: 'qty', header: 'Jumlah', align: 'right', render: (m) => <span className={m.qty < 0 ? 'text-primary' : ''}>{m.qty > 0 ? '+' : ''}{m.qty}</span> }, { key: 'note', header: 'Catatan' },
      ]} />}

      {tab === 'opname' && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Isi hasil hitung fisik. Selisih dicatat sebagai pergerakan "Opname".</p>
          <DataTable rows={ingredients} columns={[
            { key: 'name', header: 'Bahan' }, { key: 'stock', header: 'Stok sistem', align: 'right', render: (g) => `${g.stock} ${g.unit}` },
            { key: 'c', header: 'Hitung fisik', align: 'right', render: (g) => <Input aria-label={`Hitung fisik ${g.name}`} inputMode="decimal" value={counted[g.id] ?? ''} onChange={(e) => setCounted({ ...counted, [g.id]: e.target.value.replace(',', '.') })} className="ml-auto h-9 w-28 rounded-lg border-0 bg-muted text-right" /> },
            { key: 'd', header: 'Selisih', align: 'right', render: (g) => { const c = counted[g.id]; if (c === undefined || c === '') return '-'; const d = +(Number(c) - g.stock).toFixed(3); return <span className={d ? 'font-semibold text-primary' : ''}>{d > 0 ? '+' : ''}{d}</span> } },
          ]} />
          <Button onClick={applyOpname} disabled={!Object.values(counted).some((v) => v !== '' && v !== undefined)}>Terapkan opname</Button>
        </div>
      )}

      <Dialog open={!!dialog} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent className="gap-4 p-6">
          <div><DialogTitle className="text-lg font-semibold">{dialog?.kind === 'new' ? 'Bahan baru' : `${dialog?.kind === 'in' ? 'Stok masuk' : 'Stok keluar'}: ${dialog?.ing?.name}`}</DialogTitle><DialogDescription>Perubahan dicatat di riwayat pergerakan.</DialogDescription></div>
          <form onSubmit={submit} className="space-y-3">
            {dialog?.kind === 'new' && <>
              <div className="space-y-1.5"><Label htmlFor="in">Nama bahan</Label><Input id="in" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} /></div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5"><Label htmlFor="iu">Satuan</Label><NativeSelect id="iu" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>{['kg', 'g', 'pcs', 'liter', 'ml'].map((u) => <option key={u}>{u}</option>)}</NativeSelect></div>
                <div className="space-y-1.5"><Label htmlFor="im">Minimum</Label><Input id="im" inputMode="decimal" value={form.min} onChange={(e) => setForm({ ...form, min: e.target.value })} className={field} /></div>
                <div className="space-y-1.5"><Label htmlFor="ic">Harga/satuan</Label><Input id="ic" inputMode="numeric" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} className={field} /></div>
              </div></>}
            <div className="space-y-1.5"><Label htmlFor="iq">{dialog?.kind === 'new' ? 'Stok awal' : 'Jumlah'}</Label><Input id="iq" inputMode="decimal" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value.replace(',', '.') })} className={field} /></div>
            {dialog?.kind !== 'new' && <div className="space-y-1.5"><Label htmlFor="inote">Catatan</Label><Input id="inote" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className={field} /></div>}
            <Button type="submit" className="w-full">Simpan</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
