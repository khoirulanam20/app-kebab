import { useState } from 'react'
import { QrCodeIcon, Trash2Icon, UsersIcon, UserRoundIcon, MinusIcon, PlusIcon, PauseIcon, CoinsIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { rupiah } from '@/lib/format'
import { usePos } from '@/context/pos'
import CustomerPicker from './CustomerPicker'
import QrScanDialog from '@/components/common/QrScanDialog'

export default function CartPanel({ onNavigate }) {
  const nav = useNavigate()
  const { lines, setQty, clearCart, customer, couponCode, setCouponCode, coupon, totals, holdCart, notify, vouchers, manualDiscount, setManualDiscount, redeem, setRedeemBlocks, levelFor, settings, lookupMember, setCustomer } = usePos()
  const [picker, setPicker] = useState(false)
  const [scan, setScan] = useState(false)
  const scanned = async (text) => {
    setScan(false)
    const m = await lookupMember(text)
    if (!m) return notify('QR tidak dikenali sebagai member')
    if (m.blocked) return notify(`${m.name} diblokir`)
    setCustomer(m); notify(`Member ${m.name} dipilih`)
  }
  const [code, setCode] = useState(couponCode)
  const applyCoupon = () => {
    const c = code.trim().toUpperCase()
    if (!c) { setCouponCode(''); return }
    const v = vouchers.find((x) => x.code === c)
    if (!v || !v.active || v.used >= v.quota) return notify('Kode kupon tidak valid atau habis')
    if (totals.subtotal < v.min) return notify(`Minimal belanja ${rupiah(v.min)}`)
    setCouponCode(c); notify(`Kupon ${c} dipakai`)
  }
  const pay = () => { onNavigate?.(); nav('/payment') }

  return (
    <div className="flex h-full flex-col bg-white lg:rounded-2xl lg:shadow-[0_1px_8px_rgba(0,0,0,.08)]">
      <div className="flex items-center justify-between gap-2 border-b border-border p-3">
        <div className="flex min-w-0 items-center gap-2">
          <UserRoundIcon className={`size-4 shrink-0 ${customer ? 'text-primary' : 'text-muted-foreground'}`} aria-hidden />
          <div className="min-w-0"><p className="truncate text-sm font-medium">{customer?.name ?? 'Walk-in'}</p><p className="truncate text-[13px] text-muted-foreground">{customer ? `${levelFor(customer).name} · ${customer.points} poin` : 'Tanpa member'}</p></div>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button variant="outline" size="icon" aria-label="Scan QR member" title="Scan QR member" onClick={() => setScan(true)}><QrCodeIcon /></Button>
          <Button variant="outline" size="icon" aria-label="Pilih member" title="Cari atau daftarkan member" onClick={() => setPicker(true)}><UsersIcon /></Button>
          <Button variant="ghost" size="icon" aria-label="Kosongkan keranjang" disabled={!lines.length} onClick={clearCart}><Trash2Icon /></Button>
        </div>
      </div>

      <ul className="min-h-0 flex-1 divide-y divide-border overflow-y-auto px-3">
        {!lines.length && <li className="py-14 text-center text-sm text-muted-foreground">Keranjang kosong. Pilih produk di kiri.</li>}
        {lines.map((l) => (
          <li key={l.key} className="flex items-center gap-3 py-3">
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{l.name}</p>{l.opts && <p className="truncate text-[13px] text-muted-foreground">{l.opts}</p>}<p className="text-sm tabular-nums">{rupiah(l.unit)}</p></div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" aria-label={l.qty === 1 ? 'Hapus' : 'Kurangi'} onClick={() => setQty(l.key, l.qty - 1)} className="size-8 border-accent">{l.qty === 1 ? <Trash2Icon /> : <MinusIcon />}</Button>
              <span className="w-5 text-center text-sm font-medium tabular-nums">{l.qty}</span>
              <Button variant="amber" size="icon" aria-label="Tambah" onClick={() => setQty(l.key, l.qty + 1)} className="size-8"><PlusIcon /></Button>
            </div>
          </li>
        ))}
      </ul>

      <div className="space-y-3 border-t border-border p-3">
        <div className="flex gap-2">
          <Input placeholder="Kode voucher" aria-label="Kode kupon" value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyCoupon()} className="h-10 rounded-xl border-0 bg-muted" />
          <Button variant="outline" size="sm" onClick={applyCoupon}>Pakai</Button>
        </div>
        {customer && redeem.max > 0 && (
          <div className="flex items-center justify-between gap-2 rounded-xl bg-accent/30 px-3 py-2 text-sm">
            <span className="flex items-center gap-2"><CoinsIcon className="size-4" aria-hidden /><span>Tukar poin<small className="block text-muted-foreground">{settings.points.redeemPts} poin = {rupiah(settings.points.redeemValue)}</small></span></span>
            <span className="flex items-center gap-2"><Button type="button" variant="outline" size="icon" aria-label="Kurangi tukar poin" disabled={redeem.blocks === 0} onClick={() => setRedeemBlocks(redeem.blocks - 1)} className="size-8"><MinusIcon /></Button><span className="w-16 text-center font-medium tabular-nums">{redeem.pts} poin</span><Button type="button" variant="amber" size="icon" aria-label="Tambah tukar poin" disabled={redeem.blocks >= redeem.max} onClick={() => setRedeemBlocks(redeem.blocks + 1)} className="size-8"><PlusIcon /></Button></span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm"><label htmlFor="manual" className="shrink-0 text-muted-foreground">Diskon manual</label><Input id="manual" inputMode="numeric" placeholder="Rp 0" value={manualDiscount || ''} onChange={(e) => setManualDiscount(Number(e.target.value.replace(/\D/g, '')) || 0)} className="h-9 rounded-xl border-0 bg-muted text-right" /></div>
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between text-muted-foreground"><dt>Subtotal</dt><dd className="tabular-nums">{rupiah(totals.subtotal)}</dd></div>
          {totals.discount > 0 && <div className="flex justify-between text-primary"><dt>{[coupon && `Voucher ${coupon.code}`, redeem.pts > 0 && `${redeem.pts} poin`, manualDiscount > 0 && 'manual'].filter(Boolean).join(' + ') || 'Diskon'}</dt><dd className="tabular-nums">- {rupiah(totals.discount)}</dd></div>}
          {totals.service > 0 && <div className="flex justify-between text-muted-foreground"><dt>Biaya layanan</dt><dd className="tabular-nums">{rupiah(totals.service)}</dd></div>}
          {totals.tax > 0 && <div className="flex justify-between text-muted-foreground"><dt>Pajak</dt><dd className="tabular-nums">{rupiah(totals.tax)}</dd></div>}
          <Separator className="my-2" />
          <div className="flex justify-between text-base font-semibold"><dt>Total</dt><dd className="tabular-nums">{rupiah(totals.total)}</dd></div>
        </dl>
        <div className="grid grid-cols-[auto_1fr] gap-2">
          <Button variant="outline" disabled={!lines.length} onClick={holdCart}><PauseIcon /> Hold</Button>
          <Button disabled={!lines.length} onClick={pay}>Bayar · {rupiah(totals.total)}</Button>
        </div>
      </div>
      {picker && <CustomerPicker onClose={() => setPicker(false)} />}
      <QrScanDialog open={scan} title="Scan QR member" hint="Minta pelanggan menunjukkan QR di menu QR aplikasi." onClose={() => setScan(false)} onResult={scanned} />
    </div>
  )
}
