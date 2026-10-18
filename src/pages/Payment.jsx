import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { ChevronLeftIcon, CircleCheckIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { useCart } from '../cart.jsx'
import { payments } from '../data.js'

export default function Payment() {
  const nav = useNavigate()
  const { state } = useLocation()
  const { clear, mode, placeOrder } = useCart()
  const [res, setRes] = useState(null) // { id, pickupCode }
  const [busy, setBusy] = useState(false)
  const [sel, setSel] = useState('shopee')
  const total = state?.total ?? 0
  const pay = async () => {
    if (busy) return
    setBusy(true)
    try { setRes(await placeOrder({ total, subtotal: state?.subtotal ?? total, discount: state?.discount ?? 0, redeemPts: state?.redeemPts ?? 0, voucher: state?.voucher ?? null, method: sel })) } finally { setBusy(false) }
  }

  if (res)
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-muted p-8 text-center">
        <CircleCheckIcon className="size-20 text-primary" aria-hidden />
        <h1 className="font-display text-2xl">Pesanan Masuk!</h1>
        <p className="text-sm text-muted-foreground">{mode === 'pickup' ? 'Abang lagi ngiris kebabmu. Kami kabari kalau sudah siap diambil.' : 'Kurir segera meluncur ke tempatmu.'}</p>
        <Badge variant="secondary" className="h-7 px-4 text-sm">{res.id}</Badge>
        {res.pickupCode && (
          <div className="w-full max-w-xs rounded-2xl bg-white p-4">
            <p className="text-sm font-medium">Kode ambil pesanan</p>
            <p className="my-1 font-mono text-4xl font-bold tracking-[0.3em]" aria-label={`Kode ambil ${res.pickupCode.split('').join(' ')}`}>{res.pickupCode}</p>
            <div className="mx-auto my-2 w-fit rounded-xl border-4 border-foreground p-2"><QRCodeSVG value={`KNM-PICKUP|${res.id}|${res.pickupCode}`} size={120} className="block" role="img" title="QR kode ambil" /></div>
            <p className="text-[13px] text-muted-foreground">Tunjukkan kode atau QR ini ke kasir saat mengambil pesanan.</p>
          </div>
        )}
        <Button onClick={() => { clear(); nav('/orders') }} className="mt-4">Lihat Pesanan</Button>
      </div>
    )

  return (
    <div className="flex min-h-full flex-col bg-muted">
      <header className="relative flex h-14 items-center justify-center">
        <Button variant="ghost" size="icon" onClick={() => nav(-1)} aria-label="Kembali" className="absolute left-2 size-11"><ChevronLeftIcon className="size-6" /></Button>
        <h1 className="font-semibold">Pembayaran</h1>
      </header>
      <p className="py-5 text-center text-xl font-semibold"><small className="text-sm">Rp</small> {total.toLocaleString('id-ID')}</p>
      <Card className="mx-4 px-4 pb-2 pt-4">
        <h2 className="mb-2 font-semibold">Metode Pembayaran</h2>
        <RadioGroup value={sel} onValueChange={setSel} aria-label="Metode Pembayaran" className="gap-0">
          {payments.map((p) => (
            <Label key={p.id} className="flex h-16 cursor-pointer items-center gap-3 py-3">
              {p.logo ? (
                <div className="flex h-11 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-white p-1 shadow-sm">
                  <img src={p.logo} alt={p.name} className="h-full w-full object-contain" />
                </div>
              ) : (
                <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white" style={{ background: p.color }}>{p.name[0]}</span>
              )}
              <span className="flex-1"><span className="block font-semibold">{p.name}</span>{p.note && <span className="block text-xs font-normal text-muted-foreground">{p.note}</span>}</span>
              <RadioGroupItem value={p.id} className="size-6" />
            </Label>
          ))}
        </RadioGroup>
      </Card>
      <div className="mt-auto bg-white p-4"><Button onClick={pay} disabled={busy} className="w-full text-lg">{busy ? 'Memproses…' : 'Bayar'}</Button></div>
    </div>
  )
}
