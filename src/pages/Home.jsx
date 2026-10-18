import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useEmblaCarousel from 'embla-carousel-react'
import { XIcon, TicketIcon, CoinsIcon, PackageCheckIcon, MotorbikeIcon, TagIcon, TargetIcon, UsersIcon, ReceiptTextIcon, PlusIcon, SandwichIcon, PackageIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogClose, DialogTitle } from '@/components/ui/dialog'
import ProductSheet from '../components/ProductSheet.jsx'
import { useCart } from '../cart.jsx'
import { products, rupiah, POINTS, GOLD_AT } from '../data.js'

const slides = [
  { title: 'Always', accent: 'Kebab', sub: 'Beli 5 gratis 1, Bang!', tag: 'STEMPEL', icon: SandwichIcon, image: '/images/products/kebab-original.jpg', bg: 'bg-primary', fg: 'text-white', hl: 'text-accent' },
  { title: 'Paket', accent: 'Kenyang', sub: 'Kebab + kentang + es teh, Rp 32.000', tag: 'HEMAT 6K', icon: PackageIcon, image: '/images/products/paket-kenyang.jpg', bg: 'bg-accent', fg: 'text-foreground', hl: 'text-primary' },
  { title: 'Gratis', accent: 'Ongkir', sub: 'Min. order Rp 50.000, minggu ini aja', tag: 'DIANTAR', icon: MotorbikeIcon, image: '/images/banners/delivery-rider.jpg', bg: 'bg-foreground', fg: 'text-white', hl: 'text-accent' },
]

// poster used by the promo popup
function Poster({ className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl shadow-2xl ${className}`}>
      <img src="/images/banners/popup-poster.jpg" alt="Promo Kebab N Me – Beli 5 Gratis 1" className="h-full w-full object-cover" />
    </div>
  )
}

function Banner({ s }) {
  return (
    <div className={`relative flex h-48 items-center justify-between overflow-hidden rounded-2xl p-5 pb-9 ${s.bg} ${s.fg}`}>
      <div className="relative z-10 max-w-[58%]">
        <span className="rounded-full border-2 border-current px-2.5 py-0.5 text-xs font-semibold tracking-wide">{s.tag}</span>
        <p className="mt-2 font-display text-2xl leading-tight">{s.title} <span className={s.hl}>{s.accent}</span></p>
        <p className="mt-1 text-[13px] font-medium opacity-90">{s.sub}</p>
      </div>
      {s.image ? (
        <div className="absolute -bottom-1 -right-1 h-36 w-36 overflow-hidden rounded-2xl shadow-lg ring-2 ring-white/20">
          <img src={s.image} alt={s.title} className="h-full w-full object-cover" />
        </div>
      ) : (
        <s.icon aria-hidden className="absolute -right-3 bottom-0 size-32 opacity-25" strokeWidth={1} />
      )}
    </div>
  )
}

function BannerCarousel() {
  const [ref, api] = useEmblaCarousel({ loop: true })
  const [idx, setIdx] = useState(0)
  const paused = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
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
    <div className="relative px-4 pt-4" role="region" aria-roledescription="carousel" aria-label="Promo">
      <div ref={ref} className="overflow-hidden rounded-2xl">
        <div className="flex">
          {slides.map((s, i) => (
            <div key={i} className="min-w-0 shrink-0 grow-0 basis-full" role="group" aria-roledescription="slide" aria-label={`${i + 1} dari ${slides.length}`}>
              <Banner s={s} />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-3 left-9 flex gap-1.5">
        {slides.map((_, i) => (
          <button key={i} onClick={() => api?.scrollTo(i)} aria-label={`Ke slide ${i + 1}`} aria-current={idx === i}
            className={`h-2 rounded-full transition-all ${idx === i ? 'w-6 bg-current' : 'w-2 bg-current opacity-40'} ${slides[idx].fg}`} />
        ))}
      </div>
    </div>
  )
}

const ModeButton = ({ icon: Icon, title, note, onClick }) => (
  <button onClick={onClick} className="flex flex-1 items-center gap-3 rounded-2xl border-2 border-border bg-white p-3 text-left active:bg-muted">
    <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent/40"><Icon className="size-6 text-primary" /></span>
    <span><span className="block text-sm font-semibold">{title}</span>{note && <span className="block text-[13px] leading-snug text-muted-foreground">{note}</span>}</span>
  </button>
)

export default function Home() {
  const nav = useNavigate()
  const { setMode, notify } = useCart()
  const [popup, setPopup] = useState(() => !sessionStorage.getItem('knm-popup'))
  const [sheet, setSheet] = useState(null)
  const go = (m) => { setMode(m); nav('/menu') }
  const closePopup = (o) => { setPopup(o); if (!o) sessionStorage.setItem('knm-popup', '1') }
  const deals = products.filter((p) => p.was)
  const usedIds = deals.map((p) => p.id)
  const picks = products.filter((p) => ['kebab', 'burger', 'hotdog'].includes(p.cat) && !usedIds.includes(p.id)).slice(0, 4)
  const shortcuts = [[TagIcon, 'Promo', () => document.getElementById('promo')?.scrollIntoView({ behavior: 'smooth' })], [TargetIcon, 'Misi', () => notify('Misi segera hadir')], [UsersIcon, 'Ajak Teman', () => nav('/me')], [ReceiptTextIcon, 'Riwayat', () => nav('/orders')]]

  return (
    <div className="bg-white pb-14">
      <BannerCarousel />

      <section className="mt-5 px-4" aria-label="Pesan sekarang">
        <h1 className="mb-3 text-lg font-semibold">Mau kebab apa, Anam?</h1>
        <div className="flex gap-3">
          <ModeButton icon={PackageCheckIcon} title="Pickup" onClick={() => go('pickup')} />
          <ModeButton icon={MotorbikeIcon} title="Delivery" onClick={() => go('delivery')} />
        </div>
        <Card className="mt-3 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-semibold"><CoinsIcon className="size-5 text-accent" />{POINTS} poin</span>
            <span className="flex items-center gap-1.5 text-muted-foreground"><TicketIcon className="size-4 text-primary" />Voucher: 0</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={POINTS} aria-valuemax={GOLD_AT} aria-label="Menuju level Gold"><div className="h-full rounded-full bg-accent" style={{ width: `${(POINTS / GOLD_AT) * 100}%` }} /></div>
          <p className="mt-1.5 text-[13px] text-muted-foreground">{GOLD_AT - POINTS} poin lagi ke Gold</p>
        </Card>
        <ul className="mt-4 grid grid-cols-4 text-center text-[13px]">
          {shortcuts.map(([Icon, l, fn]) => (
            <li key={l}><button onClick={fn} className="flex w-full flex-col items-center gap-1.5 py-1"><span aria-hidden className="flex size-9 items-center justify-center rounded-full bg-accent/40"><Icon className="size-4 text-primary" /></span>{l}</button></li>
          ))}
        </ul>
      </section>

      <section id="promo" className="mt-7 scroll-mt-16">
        <h2 className="mb-3 px-4 text-lg font-semibold">Promo Hari Ini</h2>
        <div className="no-scrollbar flex gap-3 overflow-x-auto px-4">
          {deals.map((p) => (
            <div key={p.id} className="w-[75%] shrink-0 overflow-hidden rounded-2xl border-2 border-border bg-white shadow-sm">
              <div className="flex items-center gap-4 p-4">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="size-16 shrink-0 rounded-xl object-cover shadow-sm" />
                ) : (
                  <span aria-hidden className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-accent/30 text-primary">
                    <p.icon className="size-9" strokeWidth={1.25} />
                  </span>
                )}
                <div><p className="font-semibold leading-tight">{p.name}</p><Badge className="mt-1.5 bg-accent text-foreground">Hemat {rupiah(p.was - p.price)}</Badge></div>
              </div>
              <div className="flex items-center justify-between bg-primary px-4 py-3 text-white">
                <div><s className="block text-[13px] opacity-80">{rupiah(p.was)}</s><span className="text-xl font-bold">{rupiah(p.price)}</span></div>
                <Button variant="amber" size="icon" aria-label={`Tambah ${p.name}`} onClick={() => setSheet(p)} className="size-11"><PlusIcon /></Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mt-8 overflow-hidden rounded-t-[32px] bg-primary px-4 pb-8 pt-8 text-white">
        <div className="relative z-10">
          <h2 className="font-display text-2xl leading-tight">Dagingnya diiris<br />pas kamu pesan.</h2>
          <p className="mt-2 text-sm text-white/90">Bukan stok kemarin. Abang janji.</p>
        </div>

        {/* Real photo proof for headline claim */}
        <div className="relative mt-4 overflow-hidden rounded-2xl border-2 border-white/20 shadow-md">
          <img
            src="/images/banners/kebab-slicing.jpg"
            alt="Daging kebab diiris segar saat kamu pesan"
            className="h-44 w-full object-cover"
          />
          <div className="absolute bottom-2 left-2 rounded-lg bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            🔥 Selalu fresh dari panggangan
          </div>
        </div>

        <button onClick={() => nav('/menu')} className="mt-5 block w-full rounded-2xl border-2 border-foreground bg-accent p-5 text-left text-foreground shadow-[4px_4px_0_#1f1a17] active:translate-y-0.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-[13px] font-semibold tracking-widest">BARENG TEMAN?</span>
              <span className="mt-1 block font-display text-2xl">Paket Berdua</span>
              <span className="mt-1 block text-sm">2 kebab + 2 minuman + 1 kentang · hemat Rp 9.000</span>
            </div>
            <img src="/images/products/paket-berdua.jpg" alt="Paket Berdua" className="size-20 shrink-0 rounded-xl border-2 border-foreground object-cover shadow-sm" />
          </div>
          <span className="mt-4 inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm font-semibold text-white">Sikat, Bang!</span>
        </button>
      </section>

      <section className="-mt-6 rounded-t-[32px] bg-muted px-4 pb-8 pt-8">
        <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold">Andalan Abang</h2><button onClick={() => nav('/menu')} className="text-sm font-medium text-primary">Lihat semua menu</button></div>
        <div className="grid grid-cols-2 gap-3">
          {picks.map((p) => (
            <div key={p.id} className="relative overflow-hidden rounded-2xl bg-white p-3 shadow-sm">
              {p.badge && <Badge className="absolute left-3 top-3 z-10">{p.badge}</Badge>}
              <button onClick={() => setSheet(p)} className="block w-full text-left" aria-label={`Atur ${p.name}`}>
                {p.image ? (
                  <img src={p.image} alt={p.name} className="h-28 w-full rounded-xl object-cover" />
                ) : (
                  <span aria-hidden className="flex h-28 items-center justify-center rounded-xl bg-accent/30 text-primary">
                    <p.icon className="size-14" strokeWidth={1.25} />
                  </span>
                )}
                <span className="mt-3 block min-h-10 text-sm font-medium leading-snug">{p.name}</span>
              </button>
              <div className="mt-2 flex items-center justify-between"><span className="text-sm font-semibold">{rupiah(p.price)}</span>
                <Button variant="amber" size="icon" aria-label={`Tambah ${p.name}`} onClick={() => setSheet(p)} className="size-9"><PlusIcon /></Button></div>
            </div>
          ))}
        </div>
      </section>

      <Dialog open={popup} onOpenChange={closePopup}>
        <DialogContent showCloseButton={false} className="justify-items-center gap-6 bg-transparent p-0 ring-0">
          <DialogTitle className="sr-only">Promo</DialogTitle>
          <Poster className="aspect-[3/4] w-full rounded-2xl" />
          <DialogClose render={<Button size="icon-lg" aria-label="Tutup" className="size-11 border-2 border-white bg-black/40 text-white hover:bg-black/50" />}><XIcon /></DialogClose>
        </DialogContent>
      </Dialog>
      {sheet && <ProductSheet product={sheet} onClose={() => setSheet(null)} />}
    </div>
  )
}
