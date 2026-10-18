import { useMemo, useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { ChevronLeftIcon, MapPinIcon, PhoneIcon, ReceiptTextIcon, TrendingUpIcon, WalletIcon, ClockIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Bars } from '@/components/common/Charts'
import DataTable from '@/components/common/DataTable'
import MetricCard from '@/components/common/MetricCard'
import OrgTree from '@/components/common/OrgTree'
import { Section } from '@/components/common/Section'
import OutletForm from '@/components/outlets/OutletForm'
import OrdersHistory from '@/pages/orders/OrdersHistory'
import Reports from '@/pages/Reports'
import { StaffManager } from '@/pages/settings/SettingsAccess'
import { outletStats, todayStatus } from '@/pages/Outlets'
import { series } from '@/lib/series'
import { fmtDateTime, fmtTime, rupiah } from '@/lib/format'
import { usePos } from '@/context/pos'
import { catIcons } from '@/mock'

const TABS = [['summary', 'Ringkasan'], ['orders', 'Pesanan'], ['reports', 'Laporan'], ['team', 'Tim'], ['menu', 'Menu'], ['settings', 'Pengaturan']]

function Summary({ outlet }) {
  const { orders, staff, pastShifts } = usePos()
  const [kind, setKind] = useState('day')
  const mine = useMemo(() => orders.filter((o) => o.outletId === outlet.id), [orders, outlet.id])
  const done = mine.filter((o) => o.status === 'Selesai')
  const st = outletStats(orders, outlet.id)
  const qty = {}; done.forEach((o) => o.items.forEach((i) => { qty[i.name] = (qty[i.name] ?? 0) + i.qty }))
  const top = Object.entries(qty).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const mix = {}; done.forEach((o) => { mix[o.method] = (mix[o.method] ?? 0) + o.total })
  const revenue = done.reduce((s, o) => s + o.total, 0)
  const shifts = pastShifts.filter((s) => outlet.name.endsWith(s.outlet))
  const recent = mine.slice(0, 5)
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Penjualan hari ini" value={rupiah(st.sales)} icon={WalletIcon} />
        <MetricCard label="Pesanan selesai hari ini" value={st.orders} icon={ReceiptTextIcon} />
        <MetricCard label="Pesanan berjalan" value={st.active} hint={st.waiting ? `${st.waiting} menunggu konfirmasi` : 'Tidak ada yang menunggu'} icon={ClockIcon} />
        <MetricCard label="Rata-rata per pesanan" value={rupiah(revenue / (done.length || 1))} icon={TrendingUpIcon} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Section title="Penjualan">
          <div role="group" aria-label="Periode grafik" className="flex gap-1.5">{[['day', 'Harian'], ['week', 'Mingguan'], ['month', 'Bulanan']].map(([k, l]) => <button key={k} aria-pressed={kind === k} onClick={() => setKind(k)} className={`h-9 rounded-full px-3.5 text-sm font-medium ${kind === k ? 'bg-primary text-white' : 'bg-muted'}`}>{l}</button>)}</div>
          <Bars data={series(kind, done, 0.5)} label={`Penjualan ${outlet.name}`} />
          <p className="text-[13px] text-muted-foreground">Riwayat sebelum hari ini adalah data contoh.</p>
        </Section>
        <Section title="Produk terlaris"><ol className="space-y-3">{top.length ? top.map(([name, n], i) => <li key={name} className="flex items-center gap-3 text-sm"><span className="flex size-7 items-center justify-center rounded-full bg-accent/50 font-semibold">{i + 1}</span><span className="flex-1">{name}</span><span className="tabular-nums text-muted-foreground">{n}</span></li>) : <li className="text-sm text-muted-foreground">Belum ada penjualan.</li>}</ol></Section>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Section title="Metode bayar">{Object.entries(mix).length ? <ul className="space-y-3">{Object.entries(mix).sort((a, b) => b[1] - a[1]).map(([m, v]) => <li key={m} className="text-sm"><div className="mb-1 flex justify-between"><span>{m}</span><span className="tabular-nums">{rupiah(v)}</span></div><div className="h-2.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(v / revenue) * 100}%` }} /></div></li>)}</ul> : <p className="text-sm text-muted-foreground">Belum ada data.</p>}</Section>
        <Section title="Tim"><OrgTree staff={staff} outlets={[outlet]} outletId={outlet.id} /></Section>
        <Section title="Shift terakhir">{shifts.length ? <ul className="divide-y divide-border text-sm">{shifts.map((s) => <li key={s.id} className="flex justify-between py-2"><span>{s.cashier} · {s.date}</span><span className="tabular-nums">{rupiah(s.sales)}</span></li>)}</ul> : <p className="text-sm text-muted-foreground">Belum ada riwayat shift.</p>}</Section>
      </div>
      <Section title="Pesanan terbaru" description="Buka tab Pesanan untuk daftar lengkap.">
        <DataTable rows={recent} empty="Belum ada pesanan." columns={[{ key: 'id', header: 'No. Pesanan', render: (o) => <b className="font-medium">{o.id}</b> }, { key: 't', header: 'Jam', render: (o) => fmtTime(o.createdAt) }, { key: 'src', header: 'Sumber', render: (o) => o.source }, { key: 'st', header: 'Status', render: (o) => <Badge variant={o.status === 'Selesai' ? 'secondary' : 'default'}>{o.status}</Badge> }, { key: 'total', header: 'Total', align: 'right', render: (o) => rupiah(o.total) }]} />
      </Section>
    </div>
  )
}

function MenuTab({ outlet }) {
  const { products, setProducts, logAction, categories } = usePos()
  const [q, setQ] = useState('')
  const rows = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
  const upd = (id, fn, text) => { setProducts((c) => c.map((p) => (p.id === id ? fn(p) : p))); if (text) logAction(text) }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">Atur produk apa yang dijual di cabang ini dan harganya. Harga kosong memakai harga default.</p><Input aria-label="Cari produk" placeholder="Cari produk" value={q} onChange={(e) => setQ(e.target.value)} className="h-10 w-60 rounded-full border-0 bg-white" /></div>
      <DataTable rows={rows} empty="Produk tidak ditemukan." columns={[
        { key: 'name', header: 'Produk', render: (p) => { const Icon = catIcons[p.cat] ?? catIcons.kebab; return <span className="flex items-center gap-3"><span aria-hidden className="flex size-9 items-center justify-center rounded-lg bg-accent/30 text-primary"><Icon className="size-4" /></span><span><b className="font-medium">{p.name}</b><small className="block text-muted-foreground">{categories.find((c) => c.id === p.cat)?.name}</small></span></span> } },
        { key: 'price', header: 'Harga default', align: 'right', render: (p) => rupiah(p.price) },
        { key: 'op', header: 'Harga di cabang ini', align: 'right', render: (p) => <Input aria-label={`Harga ${p.name} di ${outlet.name}`} inputMode="numeric" placeholder="Default" value={p.outletPrice?.[outlet.id] ?? ''} onChange={(e) => { const v = Number(e.target.value.replace(/\D/g, '')); upd(p.id, (x) => ({ ...x, outletPrice: { ...x.outletPrice, [outlet.id]: v || undefined } })) }} className="ml-auto h-9 w-32 rounded-lg border-0 bg-muted text-right" /> },
        { key: 'on', header: 'Dijual di sini', render: (p) => <Switch checked={!!p.outlets?.includes(outlet.id)} onCheckedChange={(v) => upd(p.id, (x) => ({ ...x, outlets: v ? [...new Set([...(x.outlets ?? []), outlet.id])] : (x.outlets ?? []).filter((i) => i !== outlet.id) }), `${v ? 'Menjual' : 'Berhenti menjual'} ${p.name} di ${outlet.name}`)} aria-label={`Jual ${p.name} di ${outlet.name}`} /> },
      ]} />
    </div>
  )
}

export default function OutletDetail() {
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const { outlets, setOutlets, staff, logAction, notify } = usePos()
  const outlet = outlets.find((o) => o.id === Number(id))
  if (!outlet) return <Navigate to="/cabang" replace />
  const tab = TABS.some((t) => t[0] === params.get('tab')) ? params.get('tab') : 'summary'
  const head = staff.find((s) => s.role === 'Head Kitchen' && s.outletId === outlet.id)
  const save = (o) => { setOutlets((c) => c.map((x) => (x.id === o.id ? o : x))); logAction(`Mengubah cabang ${o.name}`); notify('Cabang disimpan') }
  return (
    <>
      <Link to="/cabang" className="mb-3 -ml-2 inline-flex h-9 items-center gap-1 rounded-full px-2 text-sm font-medium text-muted-foreground hover:text-foreground"><ChevronLeftIcon className="size-4" aria-hidden />Semua cabang</Link>
      <Card className="mb-4 gap-2 p-5">
        <div className="flex flex-wrap items-start justify-between gap-2"><h1 className="font-display text-2xl">{outlet.name}</h1><div className="flex gap-2">{outlet.tempClosed ? <Badge variant="secondary">Tutup sementara</Badge> : outlet.active ? <Badge>Aktif</Badge> : <Badge variant="secondary">Nonaktif</Badge>}<Badge variant="secondary">{todayStatus(outlet)}</Badge></div></div>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground"><span className="flex items-center gap-1.5"><MapPinIcon className="size-4" aria-hidden />{outlet.address}</span><span className="flex items-center gap-1.5"><PhoneIcon className="size-4" aria-hidden />{outlet.phone}</span><span>Head Kitchen: <b className="font-medium text-foreground">{head?.name ?? '—'}</b></span></p>
      </Card>
      <div role="tablist" aria-label="Detail cabang" className="no-scrollbar mb-4 flex gap-6 overflow-x-auto border-b border-border">
        {TABS.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setParams(k === 'summary' ? {} : { tab: k })} className={`relative h-11 shrink-0 text-sm font-medium ${tab === k ? 'text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:rounded-t after:bg-primary' : 'text-muted-foreground'}`}>{l}</button>)}
      </div>
      {tab === 'summary' && <Summary outlet={outlet} />}
      {tab === 'orders' && <OrdersHistory lockOutlet={outlet.id} />}
      {tab === 'reports' && <Reports lockOutlet={outlet.id} embedded />}
      {tab === 'team' && <StaffManager scope={{ outletId: outlet.id }} />}
      {tab === 'menu' && <MenuTab outlet={outlet} />}
      {tab === 'settings' && <OutletForm key={outlet.id + JSON.stringify(outlet).length} wide initial={outlet} onSave={save} submitLabel="Simpan perubahan" />}
    </>
  )
}
