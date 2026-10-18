import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon, CoinsIcon, MapPinIcon, MotorbikeIcon, PackageCheckIcon, PhoneIcon, StarIcon, MailIcon, SandwichIcon, ClockIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { homeFor } from '@/components/layout/nav-items'
import { usePos } from '@/context/pos'
import { rupiah } from '@/lib/format'
import { DAYS, defaultPerms } from '@/mock'

const CUSTOMER_APP = import.meta.env.VITE_CUSTOMER_APP_URL
const digits = (v) => String(v ?? '').replace(/\D/g, '')

// "Buka sekarang?" from the cabang's hours for today (browser clock) and its open/closed switches
function openState(o) {
  if (!o.active || o.tempClosed) return { open: false, text: o.tempClosed ? 'Tutup sementara' : 'Belum buka' }
  const h = o.hours[DAYS[(new Date().getDay() + 6) % 7]]
  if (h.closed) return { open: false, text: 'Libur hari ini' }
  const hm = new Date().toTimeString().slice(0, 5)
  return hm >= h.open && hm < h.close ? { open: true, text: `Buka sampai ${h.close}`, hours: `${h.open}–${h.close}` } : { open: false, text: `Buka ${h.open}–${h.close}`, hours: `${h.open}–${h.close}` }
}

export default function Landing() {
  const { user, can, settings, products, categories, outlets, members, reviews, paymentMethods, customers } = usePos()
  const [cat, setCat] = useState('all')
  const biz = settings.business
  useEffect(() => { const t = document.title; document.title = `${biz.name} – ${biz.tagline}`; return () => { document.title = t } }, [biz.name, biz.tagline])

  const menu = useMemo(() => products.filter((p) => p.active && (cat === 'all' || p.cat === cat)), [products, cat])
  const cats = categories.filter((c) => c.active && products.some((p) => p.active && p.cat === c.id))
  const branches = outlets.filter((o) => o.active)
  const shown = reviews.filter((r) => r.status === 'Tayang' && r.rating >= 4).slice(0, 3)
  const deals = products.filter((p) => p.active && p.was).sort((a, b) => b.was - b.price - (a.was - a.price))
  const deal = deals[0]
  const homeNow = user && homeFor(user.role, (k) => !!defaultPerms[user.role]?.[k])
  const phoneHref = `tel:${digits(biz.phone)}`
  // ordering happens in the customer app; without its URL the page falls back to calling
  const OrderBtn = ({ className = '', variant = 'amber', children = 'Pesan lewat aplikasi' }) => (CUSTOMER_APP
    ? <Button size="lg" variant={variant} className={`h-12 px-7 ${className}`} render={<a href={CUSTOMER_APP} target="_blank" rel="noreferrer" />}>{children} <ArrowRightIcon /></Button>
    : <Button size="lg" variant={variant} className={`h-12 px-7 ${className}`} render={<a href={phoneHref} />}><PhoneIcon /> Pesan: {biz.phone}</Button>)

  return (
    <div className="min-h-dvh bg-cream text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-cream/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
          <a href="#atas" className="flex items-center gap-3 font-display text-lg" aria-label={`${biz.name}, ke atas`}><img src="/logo-mark.png" alt="" className="logo-round h-9" />{biz.name}</a>
          <nav aria-label="Bagian halaman" className="ml-6 hidden gap-5 text-sm font-medium md:flex">
            {[['menu', 'Menu'], ['cabang', 'Cabang'], ['tentang', 'Tentang'], ['member', 'Member']].map(([id, l]) => <a key={id} href={`#${id}`} className="text-muted-foreground hover:text-foreground">{l}</a>)}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {user ? <Button size="sm" variant="outline" render={<Link to={homeNow} />}>Buka sistem</Button> : <Link to="/login" className="px-2 text-sm text-muted-foreground hover:text-foreground">Login staf</Link>}
            {CUSTOMER_APP && <Button size="sm" render={<a href={CUSTOMER_APP} target="_blank" rel="noreferrer" />}>Pesan</Button>}
          </div>
        </div>
      </header>

      <main id="atas">
        <section className="relative overflow-hidden bg-primary text-white" aria-labelledby="hero-title">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-[1.05fr_1fr] lg:py-20">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border-2 border-white/60 px-3 py-1 text-[13px] font-semibold tracking-wide"><SandwichIcon className="size-4" aria-hidden />{biz.tagline}</p>
              <h1 id="hero-title" className="mt-4 font-display text-4xl leading-[1.1] sm:text-5xl">Dagingnya diiris pas <span className="text-accent">kamu pesan.</span></h1>
              <p className="mt-4 max-w-xl text-lg text-white/90">Kebab hangat dari {branches.length} cabang. Ambil sendiri atau diantar ke rumah. Bukan stok kemarin, Abang janji.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <OrderBtn />
                <Button size="lg" variant="outline" className="h-12 border-white bg-transparent px-7 text-white hover:bg-white/15" render={<a href="#menu" />}>Lihat menu</Button>
              </div>
              <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/90">
                <li className="flex items-center gap-2"><PackageCheckIcon className="size-4 text-accent" aria-hidden />Pickup siap ±10 menit</li>
                <li className="flex items-center gap-2"><MotorbikeIcon className="size-4 text-accent" aria-hidden />Bisa diantar</li>
                <li className="flex items-center gap-2"><CoinsIcon className="size-4 text-accent" aria-hidden />Poin tiap jajan</li>
              </ul>
            </div>
            <div className="relative mx-auto grid w-full max-w-md grid-cols-2 gap-3">
              <img src="/images/kebab-original.jpg" alt="Kebab Original" className="aspect-[4/5] w-full rounded-2xl border-2 border-foreground object-cover shadow-[4px_4px_0_#1f1a17]" />
              <img src="/images/paket-berdua.jpg" alt="Paket Berdua" className="mt-8 aspect-[4/5] w-full rounded-2xl border-2 border-foreground object-cover shadow-[4px_4px_0_#1f1a17]" />
              {deal && <div className="absolute -bottom-3 left-1/2 w-60 -translate-x-1/2 rounded-2xl border-2 border-foreground bg-accent p-3 text-center text-foreground shadow-[4px_4px_0_#1f1a17]"><p className="text-[11px] font-semibold tracking-wide">PROMO</p><p className="font-display text-lg leading-tight">{deal.name}</p><p className="text-sm">{rupiah(deal.price)} <s className="text-foreground/60">{rupiah(deal.was)}</s></p></div>}
            </div>
          </div>
        </section>

        <section id="menu" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16" aria-labelledby="menu-title">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><h2 id="menu-title" className="font-display text-3xl">Menu andalan</h2><p className="mt-1 text-muted-foreground">Harga sama di semua cabang, kecuali tertulis lain di aplikasi.</p></div>
            <div role="group" aria-label="Kategori menu" className="no-scrollbar flex gap-2 overflow-x-auto">
              {[{ id: 'all', name: 'Semua' }, ...cats].map((c) => <button key={c.id} aria-pressed={cat === c.id} onClick={() => setCat(c.id)} className={`h-10 shrink-0 rounded-full px-4 text-sm font-medium ${cat === c.id ? 'bg-primary text-white' : 'bg-white'}`}>{c.name}</button>)}
            </div>
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {menu.map((p) => (
              <li key={p.id} className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_8px_rgba(0,0,0,.08)]">
                <div className="relative aspect-[4/3] bg-accent/30">
                  {p.image && <img src={p.image} alt={p.name} loading="lazy" className="size-full object-cover" />}
                  {p.badge && <Badge className="absolute left-3 top-3">{p.badge}</Badge>}
                </div>
                <div className="space-y-1 p-4">
                  <h3 className="font-semibold leading-snug">{p.name}</h3>
                  <p className="line-clamp-2 text-[13px] text-muted-foreground">{p.desc}</p>
                  <p className="pt-1 font-semibold">{rupiah(p.price)} {p.was && <s className="ml-1 text-[13px] font-normal text-muted-foreground">{rupiah(p.was)}</s>}</p>
                </div>
              </li>
            ))}
          </ul>
          {!menu.length && <p className="py-10 text-center text-muted-foreground">Menu di kategori ini belum tersedia.</p>}
          <div className="mt-8 flex justify-center"><OrderBtn variant="default">Pesan lewat aplikasi</OrderBtn></div>
        </section>

        <section id="cabang" className="scroll-mt-20 bg-white py-16" aria-labelledby="cabang-title">
          <div className="mx-auto max-w-6xl px-4">
            <h2 id="cabang-title" className="font-display text-3xl">Cabang kami</h2>
            <p className="mt-1 text-muted-foreground">Pilih yang paling dekat, ambil sendiri atau minta diantar.</p>
            <ul className="mt-8 grid gap-4 md:grid-cols-2">
              {branches.map((o) => { const st = openState(o); return (
                <li key={o.id} className="rounded-2xl border-2 border-foreground p-5 shadow-[3px_3px_0_#1f1a17]">
                  <div className="flex items-start justify-between gap-3"><h3 className="text-lg font-semibold">{o.name.split('– ').pop()}</h3><Badge variant={st.open ? 'default' : 'secondary'}>{st.open ? 'Buka' : 'Tutup'}</Badge></div>
                  <p className="mt-2 flex items-start gap-2 text-sm"><MapPinIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />{o.address}</p>
                  <p className="mt-1 flex items-center gap-2 text-sm"><ClockIcon className="size-4 shrink-0 text-primary" aria-hidden />{st.text}</p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground"><PackageCheckIcon className="size-4 shrink-0" aria-hidden />Pickup siap ±{o.prepMin} menit · antar radius {o.radiusKm} km</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" render={<a href={`https://www.google.com/maps?q=${o.lat},${o.lng}`} target="_blank" rel="noreferrer" aria-label={`Lihat ${o.name} di peta`} />}><MapPinIcon /> Lihat peta</Button>
                    <Button size="sm" variant="outline" render={<a href={`tel:${digits(o.phone)}`} aria-label={`Telepon ${o.name}`} />}><PhoneIcon /> {o.phone}</Button>
                  </div>
                </li>) })}
            </ul>
          </div>
        </section>

        <section id="tentang" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16" aria-labelledby="tentang-title">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 id="tentang-title" className="font-display text-3xl">Tentang {biz.name}</h2>
              <p className="mt-4 whitespace-pre-line text-lg leading-relaxed">{biz.about}</p>
              <dl className="mt-6 grid grid-cols-3 gap-3 text-center">
                {[[branches.length, 'Cabang'], [products.filter((p) => p.active).length, 'Menu'], [customers.length, 'Member']].map(([n, l]) => <div key={l} className="rounded-2xl bg-white p-4"><dd className="font-display text-3xl text-primary">{n}</dd><dt className="text-sm text-muted-foreground">{l}</dt></div>)}
              </dl>
            </div>
            <ul className="grid gap-3">
              {[['Diiris saat dipesan', 'Daging tidak ditumpuk dari pagi. Kamu pesan, baru diiris dan dibungkus.'], ['Pesan tanpa antre', 'Pesan lewat aplikasi, ambil dengan kode, atau minta diantar ke rumah.'], ['Jajan dapat poin', 'Setiap pesanan menambah poin yang bisa ditukar potongan harga.']].map(([t, d]) => (
                <li key={t} className="rounded-2xl border-2 border-border bg-white p-5"><h3 className="font-semibold">{t}</h3><p className="mt-1 text-sm text-muted-foreground">{d}</p></li>
              ))}
            </ul>
          </div>
        </section>

        <section id="member" className="scroll-mt-20 bg-primary py-16 text-white" aria-labelledby="member-title">
          <div className="mx-auto max-w-6xl px-4">
            <h2 id="member-title" className="font-display text-3xl">Jajan makin sering, untung makin banyak</h2>
            <p className="mt-2 max-w-2xl text-white/90">Daftar member lewat aplikasi, kumpulkan poin tiap pesanan, dan naik level untuk poin berlipat.</p>
            <ol className="mt-8 grid gap-4 md:grid-cols-3">
              {[...members].sort((a, b) => a.min - b.min).map((m) => (
                <li key={m.id} className="rounded-2xl border-2 border-foreground bg-white p-5 text-foreground shadow-[4px_4px_0_#1f1a17]">
                  <p className="flex items-center justify-between"><b className="font-display text-xl">{m.name}</b><Badge variant="secondary">{m.mult ?? 1}× poin</Badge></p>
                  <p className="mt-1 text-sm text-muted-foreground">{m.min ? `Mulai ${m.min} poin` : 'Langsung saat daftar'}</p>
                  <p className="mt-3 text-sm">{m.benefit}</p>
                </li>
              ))}
            </ol>
            <div className="mt-8"><OrderBtn>Daftar lewat aplikasi</OrderBtn></div>
          </div>
        </section>

        {shown.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 py-16" aria-labelledby="ulasan-title">
            <h2 id="ulasan-title" className="font-display text-3xl">Kata pelanggan</h2>
            <ul className="mt-8 grid gap-4 md:grid-cols-3">
              {shown.map((r) => (
                <li key={r.id} className="rounded-2xl bg-white p-5">
                  <p className="flex items-center gap-1" aria-label={`Rating ${r.rating} dari 5`}>{Array.from({ length: 5 }, (_, i) => <StarIcon key={i} className={`size-4 ${i < r.rating ? 'fill-accent text-accent' : 'text-border'}`} aria-hidden />)}</p>
                  <p className="mt-2">“{r.text}”</p>
                  <p className="mt-3 text-sm text-muted-foreground">{r.customer.split(' ')[0]} · {r.product}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <footer className="bg-foreground text-white/85">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div><p className="flex items-center gap-3 font-display text-lg text-white"><img src="/logo-mark.png" alt="" className="logo-round h-9" />{biz.name}</p><p className="mt-3 max-w-sm text-sm">{biz.tagline}. {biz.address}</p></div>
          <div className="text-sm"><h2 className="mb-2 font-semibold text-white">Kontak</h2><p className="flex items-center gap-2"><PhoneIcon className="size-4" aria-hidden /><a href={phoneHref} className="hover:underline">{biz.phone}</a></p><p className="mt-1 flex items-center gap-2"><MailIcon className="size-4" aria-hidden /><a href={`mailto:${biz.email}`} className="hover:underline">{biz.email}</a></p></div>
          <div className="text-sm"><h2 className="mb-2 font-semibold text-white">Pembayaran</h2><p>{paymentMethods.filter((m) => m.active).map((m) => m.name).join(', ')}</p></div>
        </div>
        <div className="border-t border-white/15"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-[13px]"><span>© {new Date().getFullYear()} {biz.name}</span><Link to={user ? homeNow : '/login'} className="hover:underline">{user ? 'Buka sistem' : 'Login staf'}</Link></div></div>
      </footer>
    </div>
  )
}
