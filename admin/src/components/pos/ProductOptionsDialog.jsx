import { useMemo, useState } from 'react'
import { MinusIcon, PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { rupiah } from '@/lib/format'
import { groupsFor, initialSelection, summarize } from '@/lib/variants'
import { usePos } from '@/context/pos'
import { catIcons } from '@/mock'

const chip = 'h-11 rounded-xl border border-transparent bg-muted px-4 text-sm font-medium aria-pressed:border-accent aria-pressed:bg-accent/40 data-pressed:border-accent data-pressed:bg-accent/40'

// Product detail in the cashier: description, variant groups (required ones marked), quantity and note.
export default function ProductOptionsDialog({ product: p, onAdd, onClose }) {
  const { optionGroups, priceFor } = usePos()
  const groups = useMemo(() => groupsFor(p, optionGroups), [p, optionGroups])
  const [sel, setSel] = useState(() => initialSelection(groups))
  const [qty, setQty] = useState(1)
  const [note, setNote] = useState('')
  const { add, label, missing } = summarize(groups, sel)
  const unit = priceFor(p) + add
  const Icon = catIcons[p.cat] ?? catIcons.kebab
  const submit = () => { onAdd(p, [label, note.trim() && `“${note.trim()}”`].filter(Boolean).join(' · '), unit, qty); onClose() }
  const choose = (g, v) => setSel((cur) => ({ ...cur, [g.id]: g.multi ? v : v.length ? [v[0]] : g.required ? cur[g.id] : [] }))

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] gap-4 overflow-y-auto p-6 sm:max-w-md">
        <div className="flex items-start gap-4">
          <span aria-hidden className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-accent/30 text-primary">{p.image ? <img src={p.image} alt="" className="size-full object-cover" /> : <Icon className="size-9" strokeWidth={1.25} />}</span>
          <div className="min-w-0"><DialogTitle className="text-lg font-semibold">{p.name}</DialogTitle><DialogDescription className="line-clamp-3">{p.desc || 'Atur varian pesanan pelanggan.'}</DialogDescription><p className="mt-1 font-semibold">{rupiah(priceFor(p))}</p></div>
        </div>
        {groups.map((g) => (
          <fieldset key={g.id}>
            <legend className="mb-2 flex items-center gap-2 text-sm font-medium">{g.name}<span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{g.required ? 'Wajib' : g.multi ? 'Boleh lebih dari satu' : 'Opsional'}</span></legend>
            <ToggleGroup multiple={g.multi} value={sel[g.id] ?? []} spacing={2} onValueChange={(v) => choose(g, v)}>
              {g.items.map((i) => <ToggleGroupItem key={i.n} value={i.n} className={chip}>{i.n}{i.add ? ` +${rupiah(i.add)}` : ''}</ToggleGroupItem>)}
            </ToggleGroup>
          </fieldset>
        ))}
        <div className="space-y-1.5"><label htmlFor="line-note" className="text-sm font-medium">Catatan</label><Input id="line-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Mis. tanpa bawang" maxLength={60} className="h-11 rounded-xl border-0 bg-muted" /></div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Jumlah</span>
          <span className="flex items-center gap-3"><Button type="button" variant="outline" size="icon" aria-label="Kurangi" disabled={qty <= 1} onClick={() => setQty(qty - 1)} className="border-accent"><MinusIcon /></Button><span className="w-6 text-center font-medium tabular-nums">{qty}</span><Button type="button" variant="amber" size="icon" aria-label="Tambah" onClick={() => setQty(qty + 1)}><PlusIcon /></Button></span>
        </div>
        {missing.length > 0 && <p role="alert" className="text-[13px] text-primary">Pilih dulu: {missing.join(', ')}</p>}
        <Button onClick={submit} disabled={missing.length > 0} className="w-full">Tambah · {rupiah(unit * qty)}</Button>
      </DialogContent>
    </Dialog>
  )
}
