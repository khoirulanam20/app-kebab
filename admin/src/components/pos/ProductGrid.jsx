import { Badge } from '@/components/ui/badge'
import { rupiah } from '@/lib/format'
import { catIcons } from '@/mock'
import { usePos } from '@/context/pos'

export default function ProductGrid({ products, onSelect }) {
  const { priceFor, flashFor, availability } = usePos()
  if (!products.length) return <p className="py-16 text-center text-sm text-muted-foreground">Produk tidak ditemukan.</p>
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => {
        const av = availability(p)
        const Icon = catIcons[p.cat] ?? catIcons.kebab
        const price = priceFor(p)
        const low = av.ok && p.stock <= 10
        const label = p.badge ?? (flashFor(p) ? 'Flash sale' : null)
        return (
          <button key={p.id} disabled={!av.ok} onClick={() => onSelect(p)} aria-label={`${p.name}, ${rupiah(price)}${av.ok ? '' : `, ${av.reason}`}`}
            className="relative rounded-2xl bg-white p-3 text-left shadow-[0_1px_8px_rgba(0,0,0,.06)] transition active:scale-[0.98] enabled:hover:ring-2 enabled:hover:ring-primary disabled:opacity-55">
            {label && av.ok && <Badge className="absolute left-4 top-4 z-10">{label}</Badge>}
            <span aria-hidden className={`flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-accent/30 text-primary ${av.ok ? '' : 'grayscale'}`}>
              {p.image ? <img src={p.image} alt="" className="h-full w-full object-cover" /> : <Icon className="size-14" strokeWidth={1.25} />}
            </span>
            <span className="mt-3 block min-h-10 text-sm font-medium leading-snug">{p.name}</span>
            <span className="mt-1 flex items-center justify-between gap-2">
              <span className="font-semibold">{rupiah(price)}</span>
              <span className={`text-[13px] ${av.ok ? (low ? 'text-gold' : 'text-muted-foreground') : 'font-medium text-primary'}`}>{av.ok ? `Stok ${p.stock}` : av.reason}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
