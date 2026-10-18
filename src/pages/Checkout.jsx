import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeftIcon, ChevronRightIcon, StoreIcon, PackageCheckIcon, MotorbikeIcon, ShoppingBagIcon, CoinsIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import QtyStepper from '../components/QtyStepper.jsx'
import { useCart } from '../cart.jsx'
import { outlets, rupiah, POINTS, MIN_DELIVERY } from '../data.js'

const modeTab = 'h-12 flex-none grow rounded-b-none rounded-t-2xl bg-black/5 after:hidden data-active:bg-white'

export default function Checkout() {
  const nav = useNavigate()
  const { items, setQty, subtotal, mode, setMode, outlet, setOutlet } = useCart()
  const [usePts, setUsePts] = useState(true)
  const [far, setFar] = useState(false)
  const [picker, setPicker] = useState(false)
  const o = outlets.find((x) => x.id === outlet)
  const ongkir = mode === 'delivery' ? 8000 : 0
  const canRedeem = POINTS >= 100 && subtotal >= 10000
  const disc = usePts && canRedeem ? 5000 : 0
  const belowMin = mode === 'delivery' && subtotal < MIN_DELIVERY
  const total = Math.max(0, subtotal + ongkir - disc)

  const Header = (
    <header className="relative flex h-14 items-center justify-center bg-muted">
      <Button variant="ghost" size="icon" onClick={() => nav(-1)} aria-label="Kembali" className="absolute left-2 size-11"><ChevronLeftIcon className="size-6" /></Button>
      <h1 className="font-semibold">Checkout</h1>
    </header>
  )

  if (!items.length)
    return (
      <div className="flex h-full flex-col bg-muted">{Header}
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <ShoppingBagIcon className="size-16 text-muted-foreground/50" aria-hidden /><p className="text-muted-foreground">Keranjangmu masih kosong</p>
          <Button onClick={() => nav('/menu')}>Lihat Menu</Button>
        </div>
      </div>
    )

  const pay = () => (o.km > 3 && mode === 'pickup' ? setFar(true) : nav('/payment', { state: { total } }))

  return (
    <div className="flex min-h-full flex-col bg-muted">
      {Header}
      <div className="flex-1 space-y-4 px-4 pb-4">
        <Tabs value={mode} onValueChange={setMode} className="gap-0">
          <TabsList className="h-auto w-full gap-0 rounded-none bg-transparent p-0">
            <TabsTrigger value="pickup" className={modeTab}><PackageCheckIcon /> Ambil</TabsTrigger>
            <TabsTrigger value="delivery" className={modeTab}><MotorbikeIcon /> Antar</TabsTrigger>
          </TabsList>
          <div className={`bg-white p-4 ${mode === 'pickup' ? 'rounded-b-2xl rounded-tr-2xl' : 'rounded-b-2xl rounded-tl-2xl'}`}>
            <div className="flex items-start justify-between gap-2 pb-4">
              <div><p className="font-semibold">{mode === 'pickup' ? o.name.split('– ')[1] : 'Rumah'}</p><p className="text-sm text-muted-foreground">{mode === 'pickup' ? o.addr : 'Jl. Melati No. 7'}</p></div>
              {mode === 'pickup' && <Button variant="ghost" size="sm" onClick={() => setPicker(true)} className="px-2 font-normal text-muted-foreground">{o.km}km <ChevronRightIcon /></Button>}
            </div>
            <Separator />
            <div className="flex justify-between pt-4 text-sm"><b className="font-semibold">{mode === 'pickup' ? 'Ambil di Toko' : 'Diantar'}</b><span className="text-muted-foreground">{mode === 'pickup' ? '2 - 5 menit' : '25 - 35 menit'}</span></div>
          </div>
        </Tabs>

        <Card className="p-4">
          <h2 className="font-semibold">Pesanan</h2>
          {items.map((i) => (
            <div key={i.key} className="flex items-center gap-3 py-4">
              {i.product.image ? (
                <img src={i.product.image} alt={i.product.name} className="h-16 w-16 shrink-0 rounded-xl object-cover shadow-sm" />
              ) : (
                <span aria-hidden className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted text-primary">
                  {i.product.icon && <i.product.icon className="size-8" strokeWidth={1.5} />}
                </span>
              )}
              <div className="flex-1 text-sm"><p className="font-semibold">{i.product.name}</p>
                {i.opts.size && <p className="text-muted-foreground">{[i.opts.size, i.opts.pedas, ...i.opts.extra].join(', ')}</p>}
                <p className="mt-1">{rupiah(i.unit)}</p></div>
              <QtyStepper qty={i.qty} removable onChange={(n) => setQty(i.key, n)} />
            </div>
          ))}
          <p className="flex h-12 items-center justify-between text-sm">Voucher <span className="text-muted-foreground">Belum ada</span></p>
          <Label className="flex h-12 cursor-pointer items-center justify-between text-sm font-normal">
            <span className="flex items-center gap-2"><CoinsIcon className="size-5 text-accent" /> Tukar 100 poin{!canRedeem && <small className="text-muted-foreground">(min. belanja Rp 10.000)</small>}</span>
            <span className="flex items-center gap-3 font-medium text-primary">- Rp 5.000
              <Checkbox checked={usePts && canRedeem} disabled={!canRedeem} onCheckedChange={setUsePts} className="size-6 rounded-full" aria-label="Tukar 100 poin" /></span>
          </Label>
        </Card>

        <Card className="gap-3 p-4 text-sm">
          <Row l="Subtotal" v={rupiah(subtotal)} />
          {ongkir > 0 && <Row l="Ongkir" v={rupiah(ongkir)} />}
          {disc > 0 && <Row l="Poin ditukar" v={'- ' + rupiah(disc)} red />}
          <Separator className="border-t border-dashed bg-transparent" />
          <Row l="Total" v={rupiah(total)} big />
        </Card>
      </div>

      <div className="sticky bottom-0 z-30 bg-white">
        {belowMin && <p role="alert" className="bg-secondary py-2 text-center text-sm font-medium text-primary">Minimal order antar {rupiah(MIN_DELIVERY)}. Tambah {rupiah(MIN_DELIVERY - subtotal)} lagi, Bang!</p>}
        <p className="bg-cream py-2 text-center text-sm font-medium text-gold"><CoinsIcon className="mr-1 inline size-4" /> Dapat +{Math.floor(total / 1000)} poin</p>
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div><span className="block text-xl font-semibold">{rupiah(total)}</span>{disc > 0 && <s className="text-xs text-muted-foreground">{rupiah(subtotal + ongkir)}</s>}</div>
          <Button onClick={pay} disabled={belowMin} className="px-8">Pilih Pembayaran</Button>
        </div>
      </div>

      <Dialog open={far} onOpenChange={setFar}>
        <DialogContent className="gap-0 bg-muted p-6">
          <DialogTitle className="text-base font-semibold">Toko cukup jauh dari kamu</DialogTitle>
          <DialogDescription>Pastikan lokasi ambil sudah benar</DialogDescription>
          <Card className="mt-4 flex-row items-center gap-3 p-4 font-semibold"><StoreIcon className="size-5" /><span>{o.name.split('– ')[1]}<small className="block font-normal"><span className="text-primary">{o.km}km</span> dari lokasimu</small></span></Card>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => { setFar(false); setPicker(true) }}>Ganti</Button>
            <Button onClick={() => nav('/payment', { state: { total } })}>Yakin</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Sheet open={picker} onOpenChange={setPicker}>
        <SheetContent side="bottom">
          <div className="space-y-3 p-5 pt-6">
            <SheetTitle className="font-semibold">Pilih Toko</SheetTitle>
            {outlets.map((x) => (
              <button key={x.id} onClick={() => { setOutlet(x.id); setPicker(false) }} aria-pressed={x.id === outlet} className={`w-full rounded-2xl p-4 text-left ${x.id === outlet ? 'bg-secondary' : 'bg-muted'}`}>
                <p className="font-semibold">{x.name.split('– ')[1]}</p><p className="text-sm text-muted-foreground">{x.addr} · {x.km}km</p>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

const Row = ({ l, v, red, big }) => (
  <div className={`flex justify-between ${big ? 'text-lg font-semibold' : ''} ${red ? 'text-primary' : ''}`}><span>{l}</span><span className={big ? '' : 'font-medium'}>{v}</span></div>
)
