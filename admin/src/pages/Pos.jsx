import { useEffect, useMemo, useRef, useState } from 'react'
import { SearchIcon, ShoppingBagIcon, KeyboardIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import CartPanel from '@/components/pos/CartPanel'
import ProductGrid from '@/components/pos/ProductGrid'
import ProductOptionsDialog from '@/components/pos/ProductOptionsDialog'
import { rupiah } from '@/lib/format'
import { groupsFor } from '@/lib/variants'
import { usePos } from '@/context/pos'
import { catIcons, shortcuts } from '@/mock'

export default function Pos() {
  const nav = useNavigate()
  const { addLine, count, totals, holdCart, lines, products, categories, orders, availability, optionGroups, lookupMember, setCustomer, notify } = usePos()
  const [cat, setCat] = useState('all')
  const [q, setQ] = useState('')
  const [opts, setOpts] = useState(null)
  const [sheet, setSheet] = useState(false)
  const [help, setHelp] = useState(false)
  const search = useRef()

  const list = useMemo(
    () => products.filter((p) => (cat === 'all' || p.cat === cat) && (p.name + p.sku).toLowerCase().includes(q.toLowerCase())),
    [cat, q, products],
  )
  const online = orders.filter((o) => o.source === 'Online' && o.status === 'Menunggu').length
  const select = (p) => (groupsFor(p, optionGroups).length ? setOpts(p) : addLine(p))
  // Barcode scanners type the SKU then press Enter.
  const onEnter = async (e) => {
    if (e.key !== 'Enter') return
    // a member QR (USB scanner types its text) or a phone number selects the member instead of searching products
    if (/^KNM-M/i.test(q.trim())) {
      const m = await lookupMember(q.trim())
      if (!m) return notify('Member tidak ditemukan')
      if (m.blocked) return notify(`${m.name} diblokir`)
      setCustomer(m); setQ(''); return notify(`Member ${m.name} dipilih`)
    }
    const hit = products.find((p) => p.sku.toLowerCase() === q.trim().toLowerCase())
    if (hit && availability(hit).ok) { select(hit); setQ('') }
  }

  useEffect(() => {
    const h = (e) => {
      if (e.key === 'F2') { e.preventDefault(); search.current?.focus() }
      if (e.key === 'F4') { e.preventDefault(); holdCart() }
      if (e.key === 'F8' && lines.length) { e.preventDefault(); nav('/payment') }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  })

  return (
    <div className="-m-4 flex h-[calc(100%+2rem)] lg:-m-6 lg:h-[calc(100%+3rem)]">
      <section className="flex min-w-0 flex-1 flex-col" aria-label="Produk">
        <div className="space-y-3 p-4 pb-2 lg:p-6 lg:pb-3">
          {online > 0 && <button onClick={() => nav('/orders/history')} className="flex w-full items-center justify-between rounded-xl bg-accent px-4 py-2.5 text-sm font-medium"><span>{online} pesanan online menunggu konfirmasi</span><span className="text-primary">Lihat ›</span></button>}
          <div className="relative flex gap-2">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input ref={search} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onEnter} placeholder="Cari produk atau scan SKU (F2)" aria-label="Cari produk" className="h-11 rounded-full border-0 bg-white pl-10 shadow-sm" />
            <Button variant="secondary" size="icon" aria-label="Pintasan keyboard" onClick={() => setHelp(true)} className="size-11 shrink-0 bg-white"><KeyboardIcon /></Button>
          </div>
          <div role="group" aria-label="Kategori" className="no-scrollbar flex gap-2 overflow-x-auto">
            {[{ id: 'all', name: 'Semua' }, ...categories.filter((c) => c.active)].map((c) => {
              const Icon = catIcons[c.id] ?? catIcons.all
              return (
              <button key={c.id} onClick={() => setCat(c.id)} aria-pressed={cat === c.id}
                className={`flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium ${cat === c.id ? 'bg-primary text-white' : 'bg-white text-foreground'}`}>
                <Icon className="size-4" aria-hidden />{c.name}
              </button>
            )})}
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-24 pt-2 lg:px-6 lg:pb-6"><ProductGrid products={list} onSelect={select} /></div>
      </section>

      <aside className="hidden w-[380px] shrink-0 p-6 pl-0 lg:block" aria-label="Keranjang"><CartPanel /></aside>

      {count > 0 && (
        <div className="fixed inset-x-0 bottom-[60px] z-20 px-4 lg:hidden">
          <Button onClick={() => setSheet(true)} className="w-full justify-between"><span className="flex items-center gap-2"><ShoppingBagIcon /> {count} item</span><span>{rupiah(totals.total)} · Lihat</span></Button>
        </div>
      )}
      <Sheet open={sheet} onOpenChange={setSheet}>
        <SheetContent side="bottom" className="h-[85vh]"><SheetTitle className="sr-only">Keranjang</SheetTitle><CartPanel onNavigate={() => setSheet(false)} /></SheetContent>
      </Sheet>
      <Dialog open={help} onOpenChange={setHelp}><DialogContent className="gap-4 p-6"><div><DialogTitle className="text-lg font-semibold">Pintasan keyboard</DialogTitle><DialogDescription>Berlaku di halaman Kasir.</DialogDescription></div>
        <ul className="divide-y divide-border text-sm">{shortcuts.map(([k, d]) => <li key={k} className="flex items-center justify-between py-2.5"><span>{d}</span><kbd className="rounded-lg border border-border bg-muted px-2.5 py-1 font-mono text-[13px]">{k}</kbd></li>)}</ul></DialogContent></Dialog>
      {opts && <ProductOptionsDialog product={opts} onAdd={addLine} onClose={() => setOpts(null)} />}
    </div>
  )
}
