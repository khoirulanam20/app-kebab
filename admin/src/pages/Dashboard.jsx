import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { WalletIcon, ReceiptTextIcon, TrendingUpIcon, QrCodeIcon, AlertTriangleIcon, ClockIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import MetricCard from '@/components/common/MetricCard'
import PageHeader from '@/components/common/PageHeader'
import { rupiah, rp, fmtTime } from '@/lib/format'
import { Bars } from '@/components/common/Charts'
import { series } from '@/lib/series'
import { usePos } from '@/context/pos'
import { FEATURES } from '@/features'

export default function Dashboard() {
  const { orders, outlets, ingredients, tenant } = usePos()
  const [kind, setKind] = useState('day')
  const done = useMemo(() => orders.filter((o) => o.status === 'Selesai'), [orders])
  const revenue = done.reduce((s, o) => s + o.total, 0)
  const pending = orders.filter((o) => o.status === 'Menunggu')
  const low = FEATURES.stock ? ingredients.filter((g) => g.stock <= g.min) : []
  const qty = {}
  done.forEach((o) => o.items.forEach((i) => { qty[i.name] = (qty[i.name] ?? 0) + i.qty }))
  const top = Object.entries(qty).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const digital = done.filter((o) => o.method !== 'Tunai').reduce((s, o) => s + o.total, 0)
  const byOutlet = outlets.map((o) => ({ id: o.id, label: o.name.split('– ').pop(), total: done.filter((x) => x.outletId === o.id).reduce((s, x) => s + x.total, 0) }))
  const hours = Array.from({ length: 13 }, (_, i) => ({ label: String(i + 9), total: done.filter((o) => new Date(o.createdAt).getHours() === i + 9).length }))
  const maxHour = Math.max(...hours.map((h) => h.total), 1)
  const busiest = hours.reduce((a, b) => (b.total > a.total ? b : a))
  const data = series(kind, done)

  return (
    <>
      <PageHeader title="Dashboard" description={`Ringkasan ${tenant?.name}.`} />
      {(pending.length > 0 || low.length > 0) && (
        <div className="mb-4 flex flex-wrap gap-3" role="status">
          {pending.length > 0 && <Link to={`/cabang/${pending[0].outletId}?tab=orders`} className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium"><ClockIcon className="size-4" aria-hidden />{pending.length} pesanan menunggu konfirmasi ›</Link>}
          {low.length > 0 && <Link to="/stock" className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-medium text-primary"><AlertTriangleIcon className="size-4" aria-hidden />{low.length} bahan menipis: {low.slice(0, 3).map((g) => g.name).join(', ')}{low.length > 3 ? '…' : ''} ›</Link>}
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Pendapatan" value={rupiah(revenue)} hint="Dari pesanan selesai" icon={WalletIcon} />
        <MetricCard label="Pesanan selesai" value={done.length} icon={ReceiptTextIcon} />
        <MetricCard label="Rata-rata per pesanan" value={rupiah(revenue / (done.length || 1))} icon={TrendingUpIcon} />
        <MetricCard label="Non-tunai" value={`${Math.round((digital / (revenue || 1)) * 100)}%`} hint="QRIS, kartu, transfer" icon={QrCodeIcon} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-semibold">Penjualan</h2>
            <div role="group" aria-label="Periode grafik" className="flex gap-1.5">{[['day', 'Harian'], ['week', 'Mingguan'], ['month', 'Bulanan']].map(([k, l]) => <button key={k} aria-pressed={kind === k} onClick={() => setKind(k)} className={`h-9 rounded-full px-3.5 text-sm font-medium ${kind === k ? 'bg-primary text-white' : 'bg-muted'}`}>{l}</button>)}</div></div>
          <Bars data={data} label="Grafik penjualan" />
          <p className="mt-3 text-[13px] text-muted-foreground">Data riwayat sebelum hari ini adalah contoh.</p>
        </Card>
        <Card className="gap-3 p-5">
          <h2 className="font-semibold">Produk terlaris</h2>
          <ol className="space-y-3">{top.map(([name, n], i) => <li key={name} className="flex items-center gap-3 text-sm"><span className="flex size-7 items-center justify-center rounded-full bg-accent/50 font-semibold">{i + 1}</span><span className="flex-1">{name}</span><span className="tabular-nums text-muted-foreground">{n} terjual</span></li>)}</ol>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-5"><h2 className="font-semibold">Jam ramai</h2><p className="text-[13px] text-muted-foreground">Paling ramai sekitar pukul {busiest.label}:00</p>
          <div className="mt-4 flex h-28 items-end gap-1.5" role="img" aria-label={`Jumlah pesanan per jam: ${hours.map((h) => `${h.label}:00 ${h.total}`).join(', ')}`}>
            {hours.map((h) => <div key={h.label} className="flex flex-1 flex-col items-center gap-1"><div className={`w-full rounded-t ${h === busiest ? 'bg-primary' : 'bg-accent'}`} style={{ height: `${(h.total / maxHour) * 100}%`, minHeight: 3 }} /><span className="text-[11px] text-muted-foreground">{h.label}</span></div>)}
          </div></Card>
        <Card className="p-5"><h2 className="font-semibold">Perbandingan cabang</h2>
          <ul className="mt-4 space-y-3">{byOutlet.map((o) => { const max = Math.max(...byOutlet.map((x) => x.total), 1); return <li key={o.label} className="text-sm"><Link to={`/cabang/${o.id}`} className="block rounded-lg hover:bg-muted"><div className="mb-1 flex justify-between"><span>{o.label} ›</span><span className="tabular-nums">{rupiah(o.total)}</span></div><div className="h-3 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(o.total / max) * 100}%` }} /></div></Link></li> })}</ul></Card>
      </div>

      <Card className="mt-4 gap-3 p-5">
        <div className="flex items-center justify-between"><h2 className="font-semibold">Perlu tindakan</h2><Button variant="outline" size="sm" render={<Link to="/cabang" />}>Lihat per cabang</Button></div>
        {pending.length ? pending.map((o) => (
          <Link key={o.id} to={`/cabang/${o.outletId}?tab=orders`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted p-3 text-sm hover:bg-accent/30"><span><b>{o.id}</b> · {outlets.find((x) => x.id === o.outletId)?.name.split('– ').pop()} · {fmtTime(o.createdAt)} · {o.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}</span><span className="flex items-center gap-3"><Badge>{o.status}</Badge><span className="tabular-nums">Rp {rp(o.total)}</span></span></Link>
        )) : <p className="text-sm text-muted-foreground">Tidak ada pesanan yang menunggu.</p>}
      </Card>
    </>
  )
}
