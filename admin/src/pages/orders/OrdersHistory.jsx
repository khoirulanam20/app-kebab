import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { SearchIcon, PrinterIcon, ChefHatIcon, BellRingIcon, Volume2Icon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import DataTable from '@/components/common/DataTable'
import Receipt from '@/components/pos/Receipt'
import { fmtDateTime, rupiah } from '@/lib/format'
import { usePos } from '@/context/pos'

const STATUS = ['Semua', 'Menunggu', 'Diproses', 'Siap', 'Dikirim', 'Selesai', 'Dibatalkan', 'Tidak diambil']
const tone = { Menunggu: '', Diproses: 'bg-accent text-foreground', Siap: 'bg-accent text-foreground', Dikirim: 'bg-accent text-foreground', Selesai: 'bg-muted text-foreground', Dibatalkan: 'bg-muted text-muted-foreground', Refund: 'bg-muted text-muted-foreground', 'Tidak diambil': 'bg-muted text-muted-foreground', Void: 'bg-muted text-muted-foreground' }
const COURIERS = ['Lalamove', 'Gojek', 'Grab', 'Driver sendiri']
const NEXT = (o) => (o.status === 'Menunggu' ? null : o.status === 'Diproses' ? ['Siap', 'Tandai siap'] : o.status === 'Siap' ? (o.delivery ? ['Dikirim', 'Kirim pesanan'] : ['Selesai', 'Selesai diambil']) : o.status === 'Dikirim' ? ['Selesai', 'Tandai selesai'] : null)

export default function OrdersHistory({ lockOutlet }) {
  const { user, orders, outlets, updateOrder, voidOrder, simulateIncoming, soundOn, setSoundOn, notify, settings } = usePos()
  // Owner browsing one outlet passes lockOutlet; staff below Owner are always limited to their own outlet
  const lock = lockOutlet ?? (user?.role === 'Owner' ? null : user?.outletId)
  const [q, setQ] = useState('')
  const [st, setSt] = useState('Semua')
  const [outletF, setOutletF] = useState('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [sel, setSel] = useState(null)
  const [dialog, setDialog] = useState(null) // 'refund' | 'void' | 'reject'
  const [reason, setReason] = useState('')
  const [pin, setPin] = useState('')
  const [ticket, setTicket] = useState('receipt')

  const rows = useMemo(() => orders.filter((o) => (st === 'Semua' || o.status === st) && (lock ? o.outletId === lock : outletF === 'all' || o.outletId === Number(outletF)) && (!from || o.createdAt.slice(0, 10) >= from) && (!to || o.createdAt.slice(0, 10) <= to) && (o.id + o.customer).toLowerCase().includes(q.toLowerCase())), [orders, q, st, outletF, from, to, lock])
  const cur = sel ? orders.find((o) => o.id === sel) : null
  const closeDialog = () => { setDialog(null); setReason(''); setPin('') }
  const setStatus = (status, text) => updateOrder(cur.id, { status }, `${text} ${cur.id}`)

  const confirmDialog = (e) => {
    e.preventDefault()
    if (dialog === 'void') { if (!voidOrder(cur.id, pin, reason)) return notify('PIN Owner salah'); notify('Pesanan di-void') }
    if (dialog === 'refund') { updateOrder(cur.id, { status: 'Refund', refundReason: reason }, `Refund pesanan ${cur.id}: ${reason || '-'}`); notify('Refund dicatat') }
    if (dialog === 'reject') { updateOrder(cur.id, { status: 'Dibatalkan', refundReason: reason }, `Menolak pesanan ${cur.id}: ${reason || '-'}`); notify('Pesanan ditolak') }
    closeDialog()
  }
  const cols = [
    { key: 'id', header: 'No. Pesanan', render: (o) => <span className="font-medium">{o.id}{o.pendingSync && <Badge variant="secondary" className="ml-2">Antre</Badge>}</span> },
    { key: 'createdAt', header: 'Waktu', render: (o) => fmtDateTime(o.createdAt) },
    { key: 'customer', header: 'Pelanggan' }, { key: 'source', header: 'Sumber' },
    ...(lock ? [] : [{ key: 'outletId', header: 'Cabang', render: (o) => outlets.find((x) => x.id === o.outletId)?.name.split('– ').pop() ?? '-' }]),
    { key: 'status', header: 'Status', render: (o) => <Badge className={tone[o.status]}>{o.status}</Badge> },
    { key: 'total', header: 'Total', align: 'right', render: (o) => rupiah(o.total) },
  ]
  const field = 'h-10 rounded-full border-0 bg-white'
  // pickup orders are only completed through the Pickup tab, where the customer's code or QR is verified
  const pickupGate = cur?.pickupCode && cur.status === 'Siap'
  const next = cur && !pickupGate && NEXT(cur)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs"><SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari no. pesanan / pelanggan" aria-label="Cari pesanan" className={`${field} pl-10`} /></div>
        {!lock && <NativeSelect aria-label="Filter cabang" value={outletF} onChange={(e) => setOutletF(e.target.value)} className="h-10 w-auto rounded-full bg-white"><option value="all">Semua cabang</option>{outlets.map((o) => <option key={o.id} value={o.id}>{o.name.split('– ').pop()}</option>)}</NativeSelect>}
        <Input type="date" aria-label="Dari tanggal" value={from} onChange={(e) => setFrom(e.target.value)} className={`${field} w-40`} />
        <Input type="date" aria-label="Sampai tanggal" value={to} onChange={(e) => setTo(e.target.value)} className={`${field} w-40`} />
        <div className="ml-auto flex items-center gap-3 text-sm">
          <label className="flex items-center gap-2"><Volume2Icon className="size-4" aria-hidden />Suara<Switch checked={soundOn} onCheckedChange={setSoundOn} aria-label="Suara pesanan baru" /></label>
          <Button variant="outline" size="sm" onClick={simulateIncoming}><BellRingIcon /> Simulasi pesanan masuk</Button>
        </div>
      </div>
      <div role="group" aria-label="Filter status" className="no-scrollbar flex gap-2 overflow-x-auto">{STATUS.map((s) => <button key={s} aria-pressed={st === s} onClick={() => setSt(s)} className={`h-10 shrink-0 rounded-full px-4 text-sm font-medium ${st === s ? 'bg-primary text-white' : 'bg-white'}`}>{s}</button>)}</div>
      <DataTable columns={cols} rows={rows} onRowClick={(o) => { setSel(o.id); setTicket('receipt') }} empty="Pesanan tidak ditemukan." />

      <Sheet open={!!cur} onOpenChange={(o) => !o && setSel(null)}>
        <SheetContent side="right" className="w-full max-w-md overflow-y-auto p-6">
          {cur && (
            <div className="space-y-4">
              <div><SheetTitle className="font-display text-xl">{cur.id}</SheetTitle><SheetDescription>{fmtDateTime(cur.createdAt)} · {cur.source} · <Badge className={tone[cur.status]}>{cur.status}</Badge></SheetDescription></div>
              {cur.delivery && (
                <div className="space-y-2 rounded-xl bg-muted p-3 text-sm"><p><b>Alamat:</b> {cur.address}</p>
                  <Label htmlFor="courier" className="block">Kurir</Label>
                  <NativeSelect id="courier" value={cur.courier ?? ''} onChange={(e) => updateOrder(cur.id, { courier: e.target.value }, `Mengatur kurir ${e.target.value} untuk ${cur.id}`)}><option value="">Belum dipilih</option>{COURIERS.map((c) => <option key={c}>{c}</option>)}</NativeSelect></div>
              )}
              <div role="group" aria-label="Jenis cetak" className="flex gap-2">{[['receipt', 'Struk'], ['kitchen', 'Tiket dapur']].map(([k, l]) => <button key={k} aria-pressed={ticket === k} onClick={() => setTicket(k)} className={`h-9 rounded-full px-4 text-sm font-medium ${ticket === k ? 'bg-primary text-white' : 'bg-muted'}`}>{l}</button>)}</div>
              <Receipt order={cur} mode={ticket} />
              <div className="grid grid-cols-2 gap-2"><Button variant="outline" onClick={() => window.print()}><PrinterIcon /> {cur.source === 'POS' ? 'Cetak ulang' : 'Cetak'}</Button><Button variant="outline" onClick={() => { setTicket('kitchen'); setTimeout(() => window.print(), 50) }}><ChefHatIcon /> Tiket dapur</Button></div>
              <div className="space-y-2 border-t border-border pt-4">
                {cur.status === 'Menunggu' && <div className="grid grid-cols-2 gap-2"><Button variant="outline" onClick={() => setDialog('reject')}>Tolak</Button><Button onClick={() => setStatus('Diproses', 'Menerima pesanan')}>Terima</Button></div>}
                {pickupGate && <Button className="w-full" variant="outline" render={<Link to="/orders/pickup" />}>Serahkan lewat tab Pickup (verifikasi kode)</Button>}
                {next && <Button className="w-full" onClick={() => setStatus(next[0], next[1])}>{next[1]}</Button>}
                {['Selesai', 'Diproses', 'Siap', 'Dikirim'].includes(cur.status) && <Button variant="outline" className="w-full" onClick={() => setDialog('refund')}>Batalkan / refund</Button>}
                {cur.status === 'Selesai' && <Button variant="ghost" className="w-full text-primary" onClick={() => setDialog('void')}>Void / retur (butuh PIN Owner)</Button>}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={!!dialog} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="gap-4 p-6">
          <div><DialogTitle className="text-lg font-semibold">{dialog === 'refund' ? 'Batalkan / refund pesanan' : dialog === 'void' ? 'Void / retur pesanan' : 'Tolak pesanan'}</DialogTitle><DialogDescription>{dialog === 'void' ? 'Tindakan ini perlu persetujuan Owner dengan PIN.' : 'Alasan dicatat di log aktivitas.'}</DialogDescription></div>
          <form onSubmit={confirmDialog} className="space-y-3">
            <div className="space-y-1.5"><Label htmlFor="reason">Alasan</Label><Input id="reason" required value={reason} onChange={(e) => setReason(e.target.value)} className="h-11 rounded-xl border-0 bg-muted" />
              {dialog === 'reject' && <div className="flex flex-wrap gap-2 pt-1">{settings.orders.reasons.map((r) => <button key={r} type="button" onClick={() => setReason(r)} className="rounded-full bg-muted px-3 py-1.5 text-[13px] font-medium">{r}</button>)}</div>}</div>
            {dialog === 'void' && <div className="space-y-1.5"><Label htmlFor="pin">PIN Owner</Label><Input id="pin" type="password" inputMode="numeric" required value={pin} onChange={(e) => setPin(e.target.value)} className="h-11 rounded-xl border-0 bg-muted" /></div>}
            <div className="grid grid-cols-2 gap-2"><Button type="button" variant="outline" onClick={closeDialog}>Batal</Button><Button type="submit">Konfirmasi</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
