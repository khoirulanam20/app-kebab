import { PlusIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { usePos } from '@/context/pos'

export default function OptionsTab() {
  const { optionGroups, setOptionGroups, logAction } = usePos()
  const upd = (id, fn) => setOptionGroups((cur) => cur.map((g) => (g.id === id ? fn(g) : g)))
  const addGroup = () => setOptionGroups((cur) => [...cur, { id: 'g' + Date.now(), name: 'Grup baru', multi: false, items: [] }])
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Opsi bersama berlaku untuk produk yang mengaktifkan "Pakai opsi bersama". Varian khusus satu produk diisi di form produk. Harga tambahan ditambahkan ke harga produk.</p>
      <div className="grid gap-4 lg:grid-cols-2">
        {optionGroups.map((g) => (
          <Card key={g.id} className="gap-3 p-4">
            <div className="flex items-center gap-2"><Input aria-label="Nama grup" value={g.name} onChange={(e) => upd(g.id, (x) => ({ ...x, name: e.target.value }))} className="h-10 rounded-lg border-0 bg-muted font-medium" />
              <label className="flex shrink-0 items-center gap-2 text-sm">Wajib<Switch checked={!!g.required} onCheckedChange={(v) => upd(g.id, (x) => ({ ...x, required: v }))} aria-label={`Wajib dipilih untuk ${g.name}`} /></label>
              <label className="flex shrink-0 items-center gap-2 text-sm">Banyak<Switch checked={g.multi} onCheckedChange={(v) => upd(g.id, (x) => ({ ...x, multi: v }))} aria-label={`Pilih banyak untuk ${g.name}`} /></label></div>
            {g.items.map((it, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input aria-label="Nama pilihan" value={it.n} onChange={(e) => upd(g.id, (x) => ({ ...x, items: x.items.map((y, j) => (j === i ? { ...y, n: e.target.value } : y)) }))} className="h-10 rounded-lg border-0 bg-muted" />
                <Input aria-label="Harga tambahan" inputMode="numeric" value={it.add} onChange={(e) => upd(g.id, (x) => ({ ...x, items: x.items.map((y, j) => (j === i ? { ...y, add: Number(e.target.value.replace(/\D/g, '')) || 0 } : y)) }))} className="h-10 w-28 rounded-lg border-0 bg-muted text-right" />
                <Button variant="ghost" size="icon" aria-label={`Hapus ${it.n}`} onClick={() => upd(g.id, (x) => ({ ...x, items: x.items.filter((_, j) => j !== i) }))}><Trash2Icon /></Button>
              </div>
            ))}
            <div className="flex justify-between"><Button variant="outline" size="sm" onClick={() => upd(g.id, (x) => ({ ...x, items: [...x.items, { n: 'Pilihan baru', add: 0 }] }))}><PlusIcon /> Pilihan</Button>
              <Button variant="ghost" size="sm" className="text-primary" onClick={() => { setOptionGroups((cur) => cur.filter((x) => x.id !== g.id)); logAction(`Menghapus grup opsi ${g.name}`) }}>Hapus grup</Button></div>
          </Card>
        ))}
      </div>
      <Button variant="outline" onClick={addGroup}><PlusIcon /> Grup opsi</Button>
    </div>
  )
}
