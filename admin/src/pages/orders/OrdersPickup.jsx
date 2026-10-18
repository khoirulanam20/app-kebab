import { useEffect, useMemo, useState } from 'react'
import { ClockIcon, PackageCheckIcon, QrCodeIcon, ScanSearchIcon, UserRoundIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import EmptyState from '@/components/common/EmptyState'
import QrScanDialog from '@/components/common/QrScanDialog'
import { Section } from '@/components/common/Section'
import { fmtTime, rupiah } from '@/lib/format'
import { usePos } from '@/context/pos'

// Pickup handover for staff: ready orders, hold timer, code/QR verification, no-show.
export default function OrdersPickup() {
  const { orders, user, settings, updateOrder, handoverPickup, markNoShow, notify, apiOnline, customers } = usePos()
  const lock = user?.role === 'Owner' ? null : user?.outletId
  const hold = settings.orders.pickupHoldMinutes ?? 30
  const [now, setNow] = useState(Date.now())
  const [code, setCode] = useState('')
  const [scan, setScan] = useState(false)
  const [verify, setVerify] = useState(null) // order being handed over
  const [vCode, setVCode] = useState('')
  const [noShow, setNoShow] = useState(null)
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 15000); return () => clearInterval(t) }, [])

  const pickup = useMemo(() => orders.filter((o) => o.source === 'Online' && !o.delivery && o.pickupCode && (!lock || o.outletId === lock)), [orders, lock])
  const waiting = pickup.filter((o) => o.status === 'Menunggu')
  const preparing = pickup.filter((o) => o.status === 'Diproses')
  const ready = pickup.filter((o) => o.status === 'Siap').sort((a, b) => (a.readyAt ?? '').localeCompare(b.readyAt ?? ''))
  const doneToday = pickup.filter((o) => ['Selesai', 'Tidak diambil'].includes(o.status) && (o.pickedUpAt ?? o.createdAt).slice(0, 10) === new Date().toISOString().slice(0, 10))
  const left = (o) => Math.round((new Date(o.readyAt ?? o.createdAt).getTime() + hold * 60000 - now) / 60000)
  const isMember = (o) => !!o.memberCode && customers.some((c) => c.code === o.memberCode)

  // staff types the 4-digit code, a USB scanner types the QR text, or the camera returns it
  const find = (raw) => {
    const r = String(raw).trim(); const parts = r.split('|')
    const c = parts[0] === 'KNM-PICKUP' ? parts[2] : r
    const hit = pickup.filter((o) => o.pickupCode === c && (parts[0] !== 'KNM-PICKUP' || o.id === parts[1]))
    const readyHit = hit.find((o) => o.status === 'Siap')
    if (readyHit) return { order: readyHit }
    if (hit.length) return { error: `Pesanan ${hit[0].id} belum siap (${hit[0].status.toLowerCase()}). Tandai siap dulu.` }
    return { error: 'Kode tidak ditemukan di antrean pickup cabang ini.' }
  }
  const lookup = (raw) => { if (!raw.trim()) return; const { order, error } = find(raw); if (error) return notify(error); setVerify(order); setVCode(raw.trim()) }
  const finish = () => {
    const err = handoverPickup(verify, vCode)
    if (err) return notify(err)
    notify(`Pesanan ${verify.id} diserahkan ke ${verify.customer}`); setVerify(null); setVCode(''); setCode('')
  }

  const Card1 = ({ o, children }) => (
    <Card className="gap-2 p-4">
      <div className="flex items-start justify-between gap-2"><div><b>{o.id}</b><p className="flex items-center gap-1.5 text-sm text-muted-foreground"><UserRoundIcon className="size-4" aria-hidden />{o.customer}{isMember(o) && <Badge variant="secondary">Member</Badge>}</p></div><span className="text-sm tabular-nums">{rupiah(o.total)}</span></div>
      <ul className="text-sm">{o.items.map((i, n) => <li key={n}>{i.qty}× {i.name}{i.opts && <small className="block text-muted-foreground">{i.opts}</small>}</li>)}</ul>
      {children}
    </Card>
  )

  return (
    <div className="space-y-4">
      <Section title="Serahkan pesanan" description="Minta pelanggan menunjukkan kode 4 digit atau QR dari aplikasi, lalu verifikasi.">
        <form onSubmit={(e) => { e.preventDefault(); lookup(code) }} className="flex flex-wrap gap-2">
          <Input autoFocus aria-label="Kode ambil" inputMode="text" placeholder="Kode ambil, mis. 4821 (atau scan)" value={code} onChange={(e) => setCode(e.target.value)} className="h-11 max-w-sm rounded-xl border-0 bg-muted font-mono" />
          <Button type="submit"><ScanSearchIcon /> Verifikasi</Button>
          <Button type="button" variant="outline" onClick={() => setScan(true)}><QrCodeIcon /> Scan QR</Button>
        </form>
        <p className="text-[13px] text-muted-foreground">Batas ambil: {hold} menit sejak pesanan siap. {apiOnline ? 'Status ikut tampil di aplikasi pelanggan.' : 'Server mati: status hanya tersimpan di perangkat ini.'}</p>
      </Section>

      {waiting.length > 0 && <p role="status" className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium">{waiting.length} pesanan pickup menunggu konfirmasi ({waiting.map((o) => o.id).join(', ')}). Terima dulu di halaman Dapur atau Riwayat.</p>}

      <div className="grid gap-4 xl:grid-cols-2">
        <section aria-label="Siap diambil"><h2 className="mb-2 flex items-center gap-2 font-semibold"><PackageCheckIcon className="size-5 text-primary" aria-hidden />Siap diambil<Badge variant="secondary">{ready.length}</Badge></h2>
          <div className="space-y-3">
            {ready.map((o) => { const m = left(o); const late = m < 0; return (
              <Card1 key={o.id} o={o}>
                <p className={`flex items-center gap-1.5 text-sm font-medium ${late ? 'text-primary' : ''}`}><ClockIcon className="size-4" aria-hidden />{o.readyAt ? `Siap ${fmtTime(o.readyAt)} · ` : ''}{late ? `lewat batas ${-m} menit` : `sisa ${m} menit`}</p>
                <div className="flex gap-2"><Button size="sm" className="flex-1" onClick={() => { setVerify(o); setVCode('') }}>Serahkan</Button>{late && <Button size="sm" variant="outline" onClick={() => setNoShow(o)}>Tidak diambil</Button>}</div>
              </Card1>) })}
            {!ready.length && <Card><EmptyState icon={PackageCheckIcon} title="Belum ada pesanan siap" text="Pesanan yang ditandai siap akan muncul di sini." /></Card>}
          </div></section>
        <section aria-label="Sedang disiapkan"><h2 className="mb-2 flex items-center gap-2 font-semibold"><ClockIcon className="size-5 text-primary" aria-hidden />Sedang disiapkan<Badge variant="secondary">{preparing.length}</Badge></h2>
          <div className="space-y-3">
            {preparing.map((o) => (
              <Card1 key={o.id} o={o}><Button size="sm" onClick={() => { updateOrder(o.id, { status: 'Siap' }, `Pesanan pickup ${o.id} siap diambil`); notify(`${o.customer} diberi tahu: pesanan siap diambil`) }}>Tandai siap diambil</Button></Card1>))}
            {!preparing.length && <Card><EmptyState title="Tidak ada yang sedang disiapkan" /></Card>}
          </div></section>
      </div>

      {doneToday.length > 0 && <Section title="Selesai hari ini"><ul className="divide-y divide-border text-sm">{doneToday.slice(0, 6).map((o) => <li key={o.id} className="flex items-center justify-between gap-3 py-2"><span><b className="font-medium">{o.id}</b> · {o.customer}</span><span className="flex items-center gap-2 text-muted-foreground">{o.pickedUpAt ? fmtTime(o.pickedUpAt) : ''}<Badge variant={o.status === 'Selesai' ? 'default' : 'secondary'}>{o.status === 'Selesai' ? 'Diambil' : o.status}</Badge></span></li>)}</ul></Section>}

      <Dialog open={!!verify} onOpenChange={(o) => !o && setVerify(null)}>
        <DialogContent className="gap-4 p-6">
          <div><DialogTitle className="text-lg font-semibold">Serahkan {verify?.id}</DialogTitle><DialogDescription>Pastikan nama dan pesanan sesuai dengan pelanggan di depan Anda.</DialogDescription></div>
          {verify && (<>
            <div className="rounded-xl bg-muted p-3 text-sm"><b>{verify.customer}</b>{verify.memberCode && <Badge variant="secondary" className="ml-2">Member</Badge>}<ul className="mt-1">{verify.items.map((i, n) => <li key={n}>{i.qty}× {i.name}</li>)}</ul></div>
            <form onSubmit={(e) => { e.preventDefault(); finish() }} className="space-y-3">
              <Input aria-label="Kode ambil pelanggan" placeholder="Kode ambil 4 digit" inputMode="numeric" autoFocus value={vCode} onChange={(e) => setVCode(e.target.value)} className="h-11 rounded-xl border-0 bg-muted text-center font-mono text-lg tracking-widest" />
              <div className="grid grid-cols-2 gap-2"><Button type="button" variant="outline" onClick={() => setScan('verify')}><QrCodeIcon /> Scan QR</Button><Button type="submit" disabled={!vCode.trim()}>Verifikasi & serahkan</Button></div>
            </form>
          </>)}
        </DialogContent>
      </Dialog>
      <QrScanDialog open={!!scan} title="Scan QR ambil pesanan" hint="Minta pelanggan menunjukkan QR di halaman Pesanan aplikasi." onClose={() => setScan(false)} onResult={(t) => { const mode = scan; setScan(false); if (mode === 'verify') setVCode(t); else lookup(t) }} />
      <ConfirmDialog open={!!noShow} title={`Tandai ${noShow?.id} tidak diambil?`} text="Pesanan melewati batas ambil. Pelanggan sudah membayar, jadi poin dan pembayaran tidak dikembalikan otomatis." confirmLabel="Ya, tidak diambil" onConfirm={() => { markNoShow(noShow); notify(`${noShow.id} ditandai tidak diambil`) }} onClose={() => setNoShow(null)} />
    </div>
  )
}
