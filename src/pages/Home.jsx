import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useEmblaCarousel from 'embla-carousel-react'
import { XIcon, TicketIcon, CoinsIcon, PackageCheckIcon, MotorbikeIcon, PercentIcon, UsersIcon, TagIcon, TargetIcon, PauseIcon, PlayIcon, ShoppingBagIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogClose, DialogTitle } from '@/components/ui/dialog'
import Countdown from '../components/Countdown.jsx'
import ProductSheet from '../components/ProductSheet.jsx'
import { useCart } from '../cart.jsx'
import { products, rupiah, POINTS } from '../data.js'

const slides = [
  { title: 'Always', accent: 'Kebab', sub: 'DIIRIS PAS KAMU PESAN', tag: 'Beli 5 Gratis 1', bg: 'bg-primary', fg: 'text-white', hl: 'text-accent' },
  { title: 'Paket', accent: 'Kenyang', sub: 'KEBAB + KENTANG + ES TEH', tag: 'Cuma Rp 32.000', bg: 'bg-accent', fg: 'text-foreground', hl: 'text-primary' },
  { title: 'Gratis', accent: 'Ongkir', sub: 'MIN. ORDER Rp 50.000', tag: 'Minggu ini aja, Bang!', bg: 'bg-foreground', fg: 'text-white', hl: 'text-accent' },
]

function Slide({ s, className = '' }) {
  return (
    <div className={`relative flex flex-col items-center justify-center overflow-hidden text-center ${s.bg} ${s.fg} ${className}`}>
      <img src="/logo-mark.png" alt="Kebab N Me – Always Kebab" className="h-16 rounded-xl border-2 border-foreground" />
      <p className="mt-3 font-display text-2xl tracking-wide">{s.title} <span className={s.hl}>{s.accent}</span></p>
      <p className="mt-1 text-xs font-medium tracking-widest opacity-80">{s.sub}</p>
      <p className="mt-3 rounded-full border-2 border-current px-4 py-1 text-xs font-semibold">{s.tag}</p>
    </div>
  )
}

function HeroCarousel() {
  const [ref, api] = useEmblaCarousel({ loop: true })
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)
  useEffect(() => {
    if (!api) return
    const sync = () => setIdx(api.selectedScrollSnap())
    api.on('select', sync)
    return () => api.off('select', sync)
  }, [api])
  useEffect(() => {
    if (!api || paused) return
    const t = setInterval(() => api.scrollNext(), 4500)
    return () => clearInterval(t)
  }, [api, paused])
  return (
    <div className="relative" role="region" aria-roledescription="carousel" aria-label="Promo">
      <div ref={ref} className="overflow-hidden rounded-b-[28px]">
        <div className="flex">
          {slides.map((s, i) => (
            <div key={i} className="min-w-0 shrink-0 grow-0 basis-full" role="group" aria-roledescription="slide" aria-label={`${i + 1} dari ${slides.length}`}>
              <Slide s={s} className="h-72 pb-8" />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-12 flex items-center justify-center gap-1.5">
        {slides.map((_, i) => (
          <button key={i} onClick={() => api?.scrollTo(i)} aria-label={`Ke slide ${i + 1}`} aria-current={idx === i}
            className={`h-2 rounded-full transition-all ${idx === i ? 'w-6 bg-white' : 'w-2 bg-white/60'}`} />
        ))}
      </div>
      <Button size="icon" variant="secondary" onClick={() => setPaused((p) => !p)} aria-label={paused ? 'Putar slide' : 'Jeda slide'} className="absolute bottom-10 right-4 size-8 bg-white/90">
        {paused ? <PlayIcon /> : <PauseIcon />}
      </Button>
    </div>
  )
}

export default function Home() {
  const nav = useNavigate()
  const { setMode, count, notify } = useCart()
  const [popup, setPopup] = useState(() => !sessionStorage.getItem('knm-popup'))
  const [sheet, setSheet] = useState(null)
  const go = (m) => { setMode(m); nav('/menu') }
  const closePopup = (o) => { setPopup(o); if (!o) sessionStorage.setItem('knm-popup', '1') }
  const deals = products.filter((p) => p.was)
  const shortcuts = [[PercentIcon, 'Paket Hemat', () => nav('/menu')], [TagIcon, 'Promo', () => document.getElementById('promo')?.scrollIntoView({ behavior: 'smooth' })], [TargetIcon, 'Misi', () => notify('Misi segera hadir')], [UsersIcon, 'Ajak Teman', () => nav('/me')]]

  return (
    <div className="bg-white pb-14">
      <div className="relative">
        <HeroCarousel />
        <Button variant="secondary" size="icon" onClick={() => nav('/checkout')} aria-label={`Keranjang, ${count} item`} className="absolute right-4 top-4 size-11 bg-white/90">
          <ShoppingBagIcon className="size-5" />
          {count > 0 && <Badge className="absolute -right-1 -top-1 h-5 min-w-5 px-1 text-xs">{count}</Badge>}
        </Button>
      </div>

      <Card className="relative z-10 -mt-6 mx-3 px-5 pb-5 pt-5" aria-label="Pesan sekarang">
        <div className="flex items-center justify-between">
          <p className="font-medium">Mau kebab apa, Anam?</p>
          <div className="flex items-center gap-4 text-sm font-medium">
            <span className="flex items-center gap-1"><TicketIcon className="size-4 text-primary" />0</span>
            <span className="flex items-center gap-1"><CoinsIcon className="size-4 text-accent" />{POINTS} <small className="font-normal text-muted-foreground">poin</small></span>
          </div>
        </div>
        <div className="mt-5 flex items-center">
          <button onClick={() => go('pickup')} className="flex flex-1 flex-col items-center gap-3 py-2 text-sm font-semibold tracking-wide"><PackageCheckIcon aria-hidden className="size-14 text-primary" strokeWidth={1.25} />AMBIL SENDIRI</button>
          <div aria-hidden className="h-16 w-px bg-border" />
          <button onClick={() => go('delivery')} className="flex flex-1 flex-col items-center gap-3 py-2 text-sm font-semibold tracking-wide"><MotorbikeIcon aria-hidden className="size-14 text-primary" strokeWidth={1.25} />DIANTAR</button>
        </div>
        <ul className="mt-5 grid grid-cols-4 gap-1 text-center text-[11px]">
          {shortcuts.map(([Icon, l, fn]) => (
            <li key={l}><button onClick={fn} className="flex w-full flex-col items-center gap-1.5"><span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/40"><Icon className="size-5 text-primary" /></span>{l}</button></li>
          ))}
        </ul>
      </Card>

      <section id="promo" className="mt-6 scroll-mt-4">
        <div className="mb-3 flex items-center gap-3 px-5"><h2 className="text-lg font-semibold">Promo Kilat</h2><Countdown /></div>
        <div className="no-scrollbar flex gap-3 overflow-x-auto px-5">
          {deals.map((p) => (
            <button key={p.id} onClick={() => setSheet(p)} className="w-72 shrink-0 overflow-hidden rounded-2xl bg-white text-left shadow-[0_1px_8px_rgba(0,0,0,.1)]">
              <div className="flex items-center justify-between px-5 py-3"><p.icon aria-hidden className="size-14 text-primary" strokeWidth={1.25} /><span className="pr-4 text-sm font-bold uppercase leading-tight tracking-wider">{p.name}</span></div>
              <div className="flex items-center gap-2 rounded-t-[28px] bg-primary px-5 pb-3 pt-4 text-white">
                <div><s className="block text-xs opacity-80">{rupiah(p.was)}</s><span className="text-2xl font-bold">{rupiah(p.price)}</span></div>
                <span className="ml-auto rounded-full bg-accent px-6 py-2 text-sm font-bold text-foreground">BELI</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8 bg-primary py-8 text-white">
        <div className="px-5">
          <h2 className="font-display text-2xl leading-tight">Dagingnya diiris<br />pas kamu pesan.</h2>
          <p className="mt-2 text-sm text-white/90">Bukan stok kemarin. Abang janji.</p>
        </div>
        <button onClick={() => nav('/menu')} className="mx-3 mt-5 block w-[calc(100%-1.5rem)] -rotate-1 rounded-2xl border-2 border-foreground bg-accent p-5 text-left text-foreground shadow-[4px_4px_0_#1f1a17]">
          <span className="text-xs font-semibold tracking-widest">BARENG TEMAN?</span>
          <span className="mt-1 block font-display text-2xl">Paket Berdua</span>
          <span className="mt-1 block text-sm">2 kebab + 2 minuman + 1 kentang · hemat Rp 9.000</span>
          <span className="mt-4 inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm font-semibold text-white">Sikat, Bang!</span>
        </button>
      </section>

      <section className="bg-muted py-6">
        <h2 className="mb-3 px-5 text-lg font-semibold">Andalan Abang</h2>
        <div className="no-scrollbar flex gap-3 overflow-x-auto px-5">
          {products.slice(0, 4).map((p) => (
            <button key={p.id} onClick={() => setSheet(p)} className="w-44 shrink-0 overflow-hidden rounded-2xl bg-white pb-4 text-left">
              <span aria-hidden className="flex h-32 items-center justify-center rounded-b-[40px] bg-accent/40 text-primary"><p.icon className="size-16" strokeWidth={1.25} /></span>
              <span className="mt-4 block px-4 text-sm leading-snug">{p.name}</span>
              <span className="mt-4 block px-4 text-sm font-semibold">{rupiah(p.price)}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="px-5 py-6">
        <h2 className="mb-3 text-lg font-semibold">Pesan Lagi</h2>
        {[products[0], products[5]].map((p) => (
          <div key={p.id} className="flex items-center gap-4 py-3">
            <span aria-hidden className="flex h-24 w-24 items-center justify-center rounded-2xl bg-muted text-primary"><p.icon className="size-10" strokeWidth={1.5} /></span>
            <div className="flex-1"><p className="text-sm font-medium">{p.name}</p><p className="mt-1 text-sm">{rupiah(p.price)} {p.was && <s className="text-xs text-muted-foreground">{rupiah(p.was)}</s>}</p></div>
            <Button size="sm" onClick={() => setSheet(p)}>Beli</Button>
          </div>
        ))}
      </section>

      <Dialog open={popup} onOpenChange={closePopup}>
        <DialogContent showCloseButton={false} className="justify-items-center gap-6 bg-transparent p-0 ring-0">
          <DialogTitle className="sr-only">Promo</DialogTitle>
          <Slide s={slides[0]} className="aspect-[3/4] w-full rounded-xl" />
          <DialogClose render={<Button size="icon-lg" aria-label="Tutup" className="size-11 border-2 border-white bg-black/40 text-white hover:bg-black/50" />}><XIcon /></DialogClose>
        </DialogContent>
      </Dialog>
      {sheet && <ProductSheet product={sheet} onClose={() => setSheet(null)} />}
    </div>
  )
}
