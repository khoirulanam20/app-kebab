import { useState } from 'react'
import { XIcon } from 'lucide-react'
import { Sheet, SheetContent, SheetClose, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import OptionGroup from './OptionGroup.jsx'
import QtyStepper from './QtyStepper.jsx'
import { useCart } from '../cart.jsx'
import { rupiah, sizes, spicy, extras } from '../data.js'

export default function ProductSheet({ product: p, onClose }) {
  const { add } = useCart()
  const Icon = p.icon
  const hasOpts = ['kebab', 'burger', 'hotdog'].includes(p.cat)
  const [size, setSize] = useState(sizes[0].n)
  const [hot, setHot] = useState(spicy[1])
  const [ex, setEx] = useState([])
  const [qty, setQty] = useState(1)

  const unit = p.price + (hasOpts ? sizes.find((s) => s.n === size).add + extras.filter((e) => ex.includes(e.n)).reduce((s, e) => s + e.add, 0) : 0)
  const submit = () => {
    add(p, hasOpts ? { size, pedas: hot, extra: ex } : {}, unit, qty)
    onClose()
  }

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" showCloseButton={false}>
        <SheetClose render={<Button size="icon" aria-label="Tutup" className="absolute right-4 top-4 z-10 bg-black/30 text-white hover:bg-black/40" />}><XIcon /></SheetClose>
        <div className="flex h-72 shrink-0 items-center justify-center bg-muted text-primary" aria-hidden><Icon className="size-36" strokeWidth={1} /></div>
        <div className="px-5 pb-4">
          <SheetTitle className="text-xl font-semibold">{p.name}</SheetTitle>
          <SheetDescription className="mt-2 leading-relaxed">{p.desc}</SheetDescription>
        </div>
        {hasOpts && (
          <>
            <Separator />
            <div className="space-y-5 px-5 py-5">
              <OptionGroup legend="Ukuran" value={size} onChange={setSize} options={sizes.map((s) => ({ value: s.n, label: s.add ? `${s.n} +${rupiah(s.add)}` : s.n }))} />
              <OptionGroup legend="Level Pedas" value={hot} onChange={setHot} options={spicy.map((s) => ({ value: s, label: s }))} />
              <OptionGroup legend="Tambahan" multiple value={ex} onChange={setEx} options={extras.map((e) => ({ value: e.n, label: `${e.n} +${rupiah(e.add)}` }))} />
            </div>
          </>
        )}
        <Separator />
        <div className="px-5 pb-5 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">{rupiah(unit * qty)}</span>
            <QtyStepper qty={qty} onChange={setQty} />
          </div>
          <Button onClick={submit} className="mt-4 h-12 w-full text-lg">Masukkan Keranjang</Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
