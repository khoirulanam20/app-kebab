import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { rupiah } from '../data.js'

export default function ProductCard({ p, onOpen }) {
  const Icon = p.icon
  return (
    <div className="flex items-center gap-3 py-3">
      <button onClick={() => onOpen(p)} className="flex flex-1 items-center gap-3 text-left" aria-label={`Atur ${p.name}`}>
        <span aria-hidden className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-muted text-primary"><Icon className="size-12" strokeWidth={1.5} /></span>
        <span className="flex h-24 flex-1 flex-col justify-between">
          <span className="font-medium leading-snug">{p.name}</span>
          <span className="text-sm">{rupiah(p.price)} {p.was && <s className="ml-1 text-xs text-muted-foreground">{rupiah(p.was)}</s>}</span>
        </span>
      </button>
      <Button variant="amber" size="icon" aria-label={`Tambah ${p.name}`} onClick={() => onOpen(p)} className="mt-auto size-8"><PlusIcon /></Button>
    </div>
  )
}
