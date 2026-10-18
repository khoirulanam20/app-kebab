import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { PlusIcon, SearchIcon, StarIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import DataTable from '@/components/common/DataTable'
import PageHeader from '@/components/common/PageHeader'
import { fmtDate } from '@/lib/format'
import { api } from '@/lib/api'
import { usePos } from '@/context/pos'

const SEG = [['all', 'Semua'], ['new', 'Baru'], ['loyal', 'Loyal'], ['inactive', 'Tidak aktif']]
const segOf = (c) => (c.joined >= '2026-09-18' ? 'new' : (c.last ?? '') < '2026-09-18' ? 'inactive' : c.orders >= 10 ? 'loyal' : 'other')
const field = 'h-11 rounded-xl border-0 bg-muted'
const badge = { new: 'Baru', loyal: 'Loyal', inactive: 'Tidak aktif', other: 'Aktif' }

function Reviews() {
  const { reviews, setReviews, notify, logAction } = usePos()
  const [reply, setReply] = useState({})
  const upd = (id, patch) => setReviews((c) => c.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  if (!reviews.length) return <p className="py-10 text-center text-sm text-muted-foreground">Belum ada ulasan.</p>
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {reviews.map((r) => (
        <Card key={r.id} className="gap-2 p-4">
          <div className="flex items-center justify-between"><b>{r.customer}</b><span className="text-[13px] text-muted-foreground">{fmtDate(r.at)}</span></div>
          <p className="flex items-center gap-1 text-sm" aria-label={`Rating ${r.rating} dari 5`}>{Array.from({ length: 5 }, (_, i) => <StarIcon key={i} className={`size-4 ${i < r.rating ? 'fill-accent text-accent' : 'text-border'}`} aria-hidden />)}<span className="ml-2 text-muted-foreground">{r.product}</span></p>
          <p className="text-sm">{r.text}</p>
          {r.reply && <p className="rounded-xl bg-muted p-3 text-sm"><b>Balasan:</b> {r.reply}</p>}
          <div className="flex gap-2"><Input aria-label="Balas ulasan" placeholder="Tulis balasan" value={reply[r.id] ?? ''} onChange={(e) => setReply({ ...reply, [r.id]: e.target.value })} className="h-10 rounded-lg border-0 bg-muted" />
            <Button size="sm" variant="outline" onClick={() => { if (!reply[r.id]?.trim()) return; upd(r.id, { reply: reply[r.id].trim() }); logAction(`Membalas ulasan ${r.customer}`); setReply({ ...reply, [r.id]: '' }); notify('Balasan terkirim') }}>Balas</Button></div>
          <div className="flex items-center justify-between"><Badge variant={r.status === 'Tayang' ? 'default' : 'secondary'}>{r.status}</Badge>
            <Button size="sm" variant="ghost" onClick={() => { upd(r.id, { status: r.status === 'Tayang' ? 'Disembunyikan' : 'Tayang' }); logAction(`${r.status === 'Tayang' ? 'Menyembunyikan' : 'Menayangkan'} ulasan ${r.customer}`) }}>{r.status === 'Tayang' ? 'Sembunyikan' : 'Tayangkan'}</Button></div>
        </Card>
      ))}
    </div>
  )
}

export default function Customers() {
  const { customers, addCustomer, orders, vouchers, notify, apiOnline, levelFor, nextFor, adjustPoints, assignVoucher, setBlocked } = usePos()
  const [tab, setTab] = useState('list')
  const [q, setQ] = useState('')
  const [seg, setSeg] = useState('all')
  const [selId, setSelId] = useState(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '' })
  const [adj, setAdj] = useState({ pts: '', note: '' })
  const [vc, setVc] = useState('')
  const [ledger, setLedger] = useState([])
  const rows = customers.filter((c) => (seg === 'all' || segOf(c) === seg) && (c.name + c.phone + c.code).toLowerCase().includes(q.toLowerCase()))
  const sel = customers.find((c) => c.id === selId)

  useEffect(() => {
    setLedger([])
    if (sel && apiOnline) api(`/api/members/${sel.code}/ledger`).then(setLedger).catch(() => setLedger([]))
  }, [selId, apiOnline, sel?.points]) // eslint-disable-line react-hooks/exhaustive-deps

  const create = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || form.phone.replace(/\D/g, '').length < 9) return notify('Isi nama dan nomor HP yang valid')
    const c = await addCustomer({ name: form.name.trim(), phone: form.phone })
    if (c) { setForm({ name: '', phone: '' }); setAdding(false); notify(`Member terdaftar · ${c.code}`) }
  }
  const adjust = async (sign) => { const n = Number(adj.pts); if (!n) return notify('Isi jumlah poin'); if (await adjustPoints(sel.code, sign * n, adj.note)) { setAdj({ pts: '', note: '' }); notify('Poin disesuaikan') } }
  const give = async () => { if (!vc) return; if (sel.vouchers.includes(vc)) return notify('Voucher sudah dimiliki'); await assignVoucher(sel.code, vc); setVc(''); notify('Voucher diberikan') }
  const mine = sel ? orders.filter((o) => o.customer === sel.name) : []

  return (
    <>
      <PageHeader title="Pelanggan & member" description="Member, level, poin, voucher, dan ulasan. Tersambung ke aplikasi pelanggan.">{tab === 'list' && <Button onClick={() => setAdding(true)}><PlusIcon /> Daftarkan member</Button>}</PageHeader>
      <div role="tablist" aria-label="Pelanggan" className="mb-4 flex gap-6 border-b border-border">{[['list', 'Member'], ['reviews', 'Ulasan']].map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`relative h-11 text-sm font-medium ${tab === k ? 'text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:rounded-t after:bg-primary' : 'text-muted-foreground'}`}>{l}</button>)}</div>
      {tab === 'reviews' ? <Reviews /> : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-xs"><SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama, HP, atau kode member" aria-label="Cari member" className="h-10 rounded-full border-0 bg-white pl-10" /></div>
            <div role="group" aria-label="Segmen" className="flex gap-2">{SEG.map(([k, l]) => <button key={k} aria-pressed={seg === k} onClick={() => setSeg(k)} className={`h-10 rounded-full px-4 text-sm font-medium ${seg === k ? 'bg-primary text-white' : 'bg-white'}`}>{l}</button>)}</div>
          </div>
          <DataTable onRowClick={(c) => setSelId(c.id)} rows={rows} empty="Member tidak ditemukan." columns={[
            { key: 'name', header: 'Nama', render: (c) => <span className="font-medium">{c.name}{c.blocked && <Badge variant="secondary" className="ml-2">Diblokir</Badge>}<small className="block font-mono font-normal text-muted-foreground">{c.code}</small></span> },
            { key: 'phone', header: 'Nomor HP' },
            { key: 'level', header: 'Level', render: (c) => <Badge variant="secondary">{levelFor(c).name}</Badge> },
            { key: 'seg', header: 'Segmen', render: (c) => badge[segOf(c)] },
            { key: 'orders', header: 'Pesanan', align: 'right' }, { key: 'points', header: 'Poin', align: 'right' },
            { key: 'joined', header: 'Bergabung', render: (c) => fmtDate(c.joined) },
          ]} />
        </>
      )}

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent className="gap-4 p-6">
          <div><DialogTitle className="text-lg font-semibold">Daftarkan member</DialogTitle><DialogDescription>Member baru dapat kode member dan bonus poin sambutan. Kodenya langsung bisa dipakai di aplikasi.</DialogDescription></div>
          <form onSubmit={create} className="space-y-3">
            <div className="space-y-1.5"><Label htmlFor="cn">Nama</Label><Input id="cn" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} /></div>
            <div className="space-y-1.5"><Label htmlFor="cp">Nomor HP</Label><Input id="cp" inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={field} /></div>
            <Button type="submit" className="w-full">Daftarkan</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Sheet open={!!sel} onOpenChange={(o) => !o && setSelId(null)}>
        <SheetContent side="right" className="w-full max-w-md overflow-y-auto p-6">
          {sel && (
            <div className="space-y-4">
              <div><SheetTitle className="font-display text-xl">{sel.name}</SheetTitle><SheetDescription>{sel.phone} · bergabung {fmtDate(sel.joined)} · {badge[segOf(sel)]}</SheetDescription></div>
              <div className="flex items-center gap-4 rounded-xl bg-muted p-3">
                <div className="rounded-lg border-2 border-foreground bg-white p-1.5"><QRCodeSVG value={sel.code} size={84} className="block" role="img" title={`QR member ${sel.code}`} /></div>
                <div className="text-sm"><Badge>{levelFor(sel).name}</Badge><p className="mt-1 font-mono font-semibold">{sel.code}</p><p className="text-[13px] text-muted-foreground">{nextFor(sel) ? `${nextFor(sel).toGo} poin lagi ke ${nextFor(sel).name}` : 'Level tertinggi'}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center"><div className="rounded-xl bg-muted p-3"><p className="text-xl font-semibold">{sel.points}</p><p className="text-[13px] text-muted-foreground">Poin</p></div><div className="rounded-xl bg-muted p-3"><p className="text-xl font-semibold">{sel.orders}</p><p className="text-[13px] text-muted-foreground">Pesanan</p></div></div>
              <section className="space-y-2"><h3 className="text-sm font-semibold">Sesuaikan poin</h3>
                <div className="flex gap-2"><Input aria-label="Jumlah poin" inputMode="numeric" placeholder="Jumlah" value={adj.pts} onChange={(e) => setAdj({ ...adj, pts: e.target.value.replace(/\D/g, '') })} className="h-10 w-24 rounded-lg border-0 bg-muted" /><Input aria-label="Alasan" placeholder="Alasan" value={adj.note} onChange={(e) => setAdj({ ...adj, note: e.target.value })} className="h-10 rounded-lg border-0 bg-muted" /></div>
                <div className="grid grid-cols-2 gap-2"><Button size="sm" variant="outline" onClick={() => adjust(-1)}>Kurangi</Button><Button size="sm" onClick={() => adjust(1)}>Tambah</Button></div></section>
              <section className="space-y-2"><h3 className="text-sm font-semibold">Voucher</h3>
                <div className="flex flex-wrap gap-2">{sel.vouchers.length ? sel.vouchers.map((v) => <Badge key={v} variant="secondary">{v}</Badge>) : <span className="text-sm text-muted-foreground">Belum punya voucher.</span>}</div>
                <div className="flex gap-2"><NativeSelect aria-label="Pilih voucher" value={vc} onChange={(e) => setVc(e.target.value)}><option value="">Pilih voucher</option>{vouchers.filter((v) => v.active).map((v) => <option key={v.id}>{v.code}</option>)}</NativeSelect><Button size="sm" variant="outline" onClick={give}>Beri</Button></div></section>
              <section><h3 className="mb-1 text-sm font-semibold">Riwayat poin</h3>
                {ledger.length ? <ul className="divide-y divide-border text-sm">{ledger.slice(0, 8).map((l) => <li key={l.id} className="flex items-center justify-between gap-2 py-2"><span className="min-w-0"><b className="block truncate font-medium">{l.note}</b><span className="text-[13px] text-muted-foreground">{fmtDate(l.at)} · {l.type}</span></span><b className={`tabular-nums ${l.pts < 0 ? 'text-primary' : ''}`}>{l.pts > 0 ? '+' : ''}{l.pts}</b></li>)}</ul> : <p className="text-sm text-muted-foreground">{apiOnline ? 'Belum ada riwayat poin.' : 'Riwayat poin tersedia saat server aktif.'}</p>}</section>
              <section><h3 className="mb-1 text-sm font-semibold">Pesanan terakhir</h3>
                {mine.length ? <ul className="divide-y divide-border text-sm">{mine.slice(0, 5).map((o) => <li key={o.id} className="flex justify-between py-2"><span>{o.id}</span><span className="text-muted-foreground">{fmtDate(o.createdAt)}</span></li>)}</ul> : <p className="text-sm text-muted-foreground">Belum ada pesanan tercatat di sesi ini.</p>}</section>
              <Button variant={sel.blocked ? 'outline' : 'ghost'} className={sel.blocked ? 'w-full' : 'w-full text-primary'} onClick={() => setBlocked(sel.code, !sel.blocked)}>{sel.blocked ? 'Buka blokir member' : 'Blokir member'}</Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
