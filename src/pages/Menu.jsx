import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SearchIcon, ShoppingBagIcon, StoreIcon, ChevronRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ProductCard from '../components/ProductCard.jsx'
import ProductSheet from '../components/ProductSheet.jsx'
import { useCart } from '../cart.jsx'
import { categories, products, outlets, rupiah } from '../data.js'

const tag = { paket: 'NEW' }

export default function Menu() {
  const nav = useNavigate()
  const { mode, setMode, outlet, count, subtotal } = useCart()
  const [cat, setCat] = useState('kebab')
  const [sheet, setSheet] = useState(null)
  const [q, setQ] = useState('')
  const list = products.filter((p) => (q ? p.name.toLowerCase().includes(q.toLowerCase()) : p.cat === cat))

  return (
    <div className="flex h-full flex-col bg-white">
      <header className="shrink-0 px-4 pb-2 pt-4 shadow-[0_2px_8px_rgba(0,0,0,.04)]">
        <div className="flex items-center gap-3">
          <Tabs value={mode} onValueChange={setMode}>
            <TabsList className="h-auto rounded-full p-1">
              <TabsTrigger value="pickup" className="h-10 rounded-full px-5">Ambil</TabsTrigger>
              <TabsTrigger value="delivery" className="h-10 rounded-full px-5">Antar</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari menu" aria-label="Cari menu" className="h-11 rounded-full border-0 bg-muted pl-10" />
          </div>
        </div>
        <button onClick={() => nav('/checkout')} className="mt-3 flex min-h-10 items-center gap-2 font-medium"><StoreIcon className="size-4" /> {outlets.find((o) => o.id === outlet).name.split('– ')[1]} <ChevronRightIcon className="size-4 text-muted-foreground" /></button>
      </header>

      <nav aria-label="Kategori" className="no-scrollbar flex shrink-0 gap-1 overflow-x-auto border-b border-border bg-white px-2">
        {categories.map((c) => {
          const on = cat === c.id && !q
          return (
            <button key={c.id} onClick={() => { setCat(c.id); setQ('') }} aria-current={on}
              className={`relative flex min-h-16 min-w-20 shrink-0 flex-col items-center justify-center gap-1 px-3 text-xs font-medium ${on ? 'text-primary' : 'text-muted-foreground'}`}>
              {tag[c.id] && <Badge className="absolute right-0 top-1 h-4 rounded px-1.5 text-xs">{tag[c.id]}</Badge>}
              <c.icon aria-hidden className="size-6" strokeWidth={1.5} />{c.name}
              {on && <i className="absolute inset-x-3 bottom-0 h-1 rounded-t bg-primary" />}
            </button>
          )
        })}
      </nav>

      <section className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-12 pt-4">
        <div className="relative flex h-44 flex-col justify-end overflow-hidden rounded-2xl p-4 text-white shadow-md">
          <img
            src="/images/banners/menu-promo.jpg"
            alt="Promo Menu Kebab"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
          <div className="relative z-10">
            <span className="inline-block rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-bold tracking-widest text-foreground">PROMO OKTOBER</span>
            <p className="mt-1 font-display text-xl leading-tight">Always <span className="text-accent">Kebab</span></p>
          </div>
        </div>
        <h2 className="mb-1 mt-5 text-sm font-semibold uppercase tracking-wide">{q ? `Hasil “${q}”` : categories.find((c) => c.id === cat).name}</h2>
        {list.length ? list.map((p) => <ProductCard key={p.id} p={p} onOpen={setSheet} />) : <p className="py-10 text-center text-muted-foreground">Menunya nggak ketemu</p>}
      </section>

      {count > 0 && (
        <div className="flex shrink-0 items-center justify-between bg-cream px-4 py-3">
          <div className="flex items-center gap-3"><span className="relative" aria-hidden><ShoppingBagIcon className="size-8 text-primary" /><Badge className="absolute -right-3 -top-1 h-5 min-w-5 px-1 text-xs">{count}</Badge></span><span className="font-semibold">{rupiah(subtotal)}</span></div>
          <Button onClick={() => nav('/checkout')} className="px-8">Checkout</Button>
        </div>
      )}
      {sheet && <ProductSheet product={sheet} onClose={() => setSheet(null)} />}
    </div>
  )
}
