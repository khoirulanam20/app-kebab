import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ChevronLeftIcon, DeleteIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ReceiptModal from '@/components/pos/ReceiptModal'
import { settle } from '@/lib/pricing'
import { rupiah } from '@/lib/format'
import { usePos } from '@/context/pos'

const KEYS = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '000', '0', 'del']
const METHODS = [['cash', 'Tunai'], ['qris', 'QRIS'], ['card', 'Kartu'], ['transfer', 'Transfer']]

export default function Payment() {
  const nav = useNavigate()
  const { lines, totals, completeSale, paymentMethods } = usePos()
  const [method, setMethod] = useState('cash')
  const [amt, setAmt] = useState({ cash: 0, qris: 0, card: 0, transfer: 0 })
  const [done, setDone] = useState(null)
  const [busy, setBusy] = useState(false)
  const s = settle(totals.total, amt)

  const press = (k) => setAmt((a) => {
    const cur = String(a[method] || '')
    const next = k === 'del' ? cur.slice(0, -1) : (cur + k).replace(/^0+/, '')
    return { ...a, [method]: Number(next.slice(0, 9)) || 0 }
  })
  const setExact = (v) => setAmt((a) => ({ ...a, [method]: v }))
  const remainingFor = (m) => Math.max(0, totals.total - Object.entries(amt).filter(([k]) => k !== m).reduce((t, [, v]) => t + v, 0))

  useEffect(() => {
    const h = (e) => { if (/^\d$/.test(e.key)) press(e.key); if (e.key === 'Backspace') press('del') }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  })

  if (!lines.length && !done) return <Navigate to="/kasir" replace />
  const finish = async () => { if (busy) return; setBusy(true); try { setDone({ ...(await completeSale({ ...amt, change: s.change })), change: s.change }) } finally { setBusy(false) } }
  const quick = [remainingFor(method), 20000, 50000, 100000].filter((v, i, a) => v > 0 && a.indexOf(v) === i)

  return (
    <div className="mx-auto max-w-5xl">
      <Button variant="ghost" onClick={() => nav('/kasir')} className="mb-3 -ml-2"><ChevronLeftIcon /> Kembali ke kasir</Button>
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[['Total tagihan', totals.total, ''], ['Dibayar', s.paid, ''], ['Sisa', s.remaining, s.remaining ? 'text-primary' : ''], ['Kembalian', s.change, s.change ? 'text-gold' : '']].map(([l, v, c]) => (
              <Card key={l} className="p-4"><p className="text-[13px] text-muted-foreground">{l}</p><p className={`mt-1 text-xl font-semibold tabular-nums ${c}`}>{rupiah(v)}</p></Card>
            ))}
          </div>
          <Card className="gap-4 p-4">
            <Tabs value={method} onValueChange={setMethod}>
              <TabsList className="h-auto w-full rounded-full p-1">{METHODS.filter(([k]) => paymentMethods.find((m) => m.id === k)?.active !== false).map(([k, l]) => <TabsTrigger key={k} value={k} className="h-10 rounded-full">{l}{amt[k] > 0 && <span className="ml-1.5 size-2 rounded-full bg-primary" aria-label="terisi" />}</TabsTrigger>)}</TabsList>
            </Tabs>
            <p className="text-center text-sm text-muted-foreground">Diterima via {METHODS.find((m) => m[0] === method)[1]}</p>
            <p className="text-center text-4xl font-semibold tabular-nums" aria-live="polite">{rupiah(amt[method])}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {quick.map((v, i) => <Button key={v} variant="outline" size="sm" onClick={() => setExact(v)}>{i === 0 ? 'Uang pas' : rupiah(v)}</Button>)}
              <Button variant="ghost" size="sm" onClick={() => setExact(0)}>Reset</Button>
            </div>
            <div className="mx-auto grid w-full max-w-xs grid-cols-3 gap-2">
              {KEYS.map((k) => (
                <Button key={k} variant="secondary" onClick={() => press(k)} aria-label={k === 'del' ? 'Hapus' : k} className="h-14 bg-muted text-lg text-foreground hover:bg-muted/70">{k === 'del' ? <DeleteIcon /> : k}</Button>
              ))}
            </div>
            {s.invalidOver > 0 && <p role="alert" className="text-center text-sm text-primary">Pembayaran non-tunai tidak boleh melebihi tagihan. Kurangi {rupiah(s.invalidOver)}.</p>}
          </Card>
        </div>
        <Card className="h-fit gap-3 p-4 text-sm">
          <h2 className="font-semibold">Ringkasan pesanan</h2>
          <ul className="divide-y divide-border">{lines.map((l) => <li key={l.key} className="flex justify-between gap-2 py-2"><span>{l.qty}× {l.name}{l.opts && <small className="block text-muted-foreground">{l.opts}</small>}</span><span className="tabular-nums">{rupiah(l.unit * l.qty)}</span></li>)}</ul>
          <div className="space-y-1 border-t border-dashed border-border pt-3">
            <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span className="tabular-nums">{rupiah(totals.subtotal)}</span></div>
            {totals.discount > 0 && <div className="flex justify-between text-primary"><span>Diskon</span><span className="tabular-nums">- {rupiah(totals.discount)}</span></div>}
            {totals.service > 0 && <div className="flex justify-between text-muted-foreground"><span>Biaya layanan</span><span className="tabular-nums">{rupiah(totals.service)}</span></div>}
            {totals.tax > 0 && <div className="flex justify-between text-muted-foreground"><span>Pajak</span><span className="tabular-nums">{rupiah(totals.tax)}</span></div>}
            <div className="flex justify-between text-base font-semibold"><span>Total</span><span className="tabular-nums">{rupiah(totals.total)}</span></div>
          </div>
          <Button disabled={!s.ok || busy} onClick={finish} className="mt-2 w-full">{busy ? 'Memproses…' : 'Selesaikan pembayaran'}</Button>
        </Card>
      </div>
      {done && <ReceiptModal order={done} onDone={() => nav('/kasir')} />}
    </div>
  )
}
