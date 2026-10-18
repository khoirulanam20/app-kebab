import { useMemo, useState } from 'react'
import { DownloadIcon, PrinterIcon, WalletIcon, ReceiptTextIcon, TrendingUpIcon, PiggyBankIcon, CheckCircle2Icon, AlertTriangleIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import MetricCard from '@/components/common/MetricCard'
import DataTable from '@/components/common/DataTable'
import PageHeader from '@/components/common/PageHeader'
import { fmtDate, rupiah } from '@/lib/format'
import { usePos } from '@/context/pos'
import { reconciliation } from '@/mock'

const RANGES = [['1', 'Hari ini'], ['7', '7 hari'], ['30', '30 hari']]
const NOW_END = new Date('2026-10-18T23:59:59').getTime()

const toCsv = (rows) => rows.map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n')
function download(name, content, type) {
  const url = URL.createObjectURL(new Blob(['﻿' + content], { type }))
  Object.assign(document.createElement('a'), { href: url, download: name }).click(); URL.revokeObjectURL(url)
}
// Excel opens an HTML table saved as .xls
const toXls = (title, rows) => `<html><head><meta charset="utf-8"></head><body><h3>${title}</h3><table border="1">${rows.map((r, i) => `<tr>${r.map((v) => (i ? `<td>${v}</td>` : `<th>${v}</th>`)).join('')}</tr>`).join('')}</table></body></html>`

export default function Reports({ lockOutlet, embedded }) {
  const { orders: allOrders, outlets, products, categories, recipes, ingredients, vouchers, customers, settings, notify, tenant } = usePos()
  const orders = useMemo(() => (lockOutlet ? allOrders.filter((o) => o.outletId === lockOutlet) : allOrders), [allOrders, lockOutlet])
  const [range, setRange] = useState('7')

  const d = useMemo(() => {
    const from = NOW_END - Number(range) * 86400000
    const list = orders.filter((o) => o.status === 'Selesai' && new Date(o.createdAt).getTime() >= from)
    const revenue = list.reduce((s, o) => s + o.total, 0)
    const catName = (name) => categories.find((c) => c.id === products.find((p) => p.name === name)?.cat)?.name ?? 'Lainnya'
    const cost = (name) => { const p = products.find((x) => x.name === name); return (recipes[p?.id] ?? []).reduce((s, [id, q]) => s + (ingredients.find((g) => g.id === id)?.cost ?? 0) * q, 0) }
    const group = (rowsFn) => { const m = {}; list.forEach((o) => rowsFn(o).forEach(([k, qty, amt, hpp = 0]) => { m[k] = m[k] ?? { id: k, key: k, qty: 0, amount: 0, hpp: 0 }; m[k].qty += qty; m[k].amount += amt; m[k].hpp += hpp })); return Object.values(m).sort((a, b) => b.amount - a.amount) }
    const hpp = list.reduce((s, o) => s + o.items.reduce((t, i) => t + cost(i.name) * i.qty, 0), 0)
    return {
      list, revenue, hpp,
      byDay: group((o) => [[o.createdAt.slice(0, 10), 1, o.total]]).sort((a, b) => b.key.localeCompare(a.key)),
      byProduct: group((o) => o.items.map((i) => [i.name, i.qty, i.price * i.qty, cost(i.name) * i.qty])),
      byCategory: group((o) => o.items.map((i) => [catName(i.name), i.qty, i.price * i.qty])),
      byOutlet: group((o) => [[outlets.find((x) => x.id === o.outletId)?.name.split('– ').pop() ?? '-', 1, o.total]]),
      byCashier: group((o) => (o.cashier && o.cashier !== '-' ? [[o.cashier, 1, o.total]] : [])),
      byMethod: group((o) => [[o.method, 1, o.total]]),
      vouchers: list.filter((o) => o.voucher), disc: list.reduce((s, o) => s + (o.discount ?? 0), 0),
    }
  }, [orders, range, outlets, products, categories, recipes, ingredients])

  const sections = [['Per hari', 'Hari', d.byDay.map((r) => ({ ...r, key: fmtDate(r.key) })), 'Pesanan'], ['Per produk', 'Produk', d.byProduct, 'Jumlah'], ['Per kategori', 'Kategori', d.byCategory, 'Jumlah'], ...(lockOutlet ? [] : [['Per cabang', 'Cabang', d.byOutlet, 'Pesanan']]), ['Per kasir', 'Kasir', d.byCashier, 'Pesanan'], ['Per metode bayar', 'Metode', d.byMethod, 'Pesanan']]
  const exportRows = () => [['No. Pesanan', 'Waktu', 'Pelanggan', 'Cabang', 'Metode', 'Total'], ...d.list.map((o) => [o.id, o.createdAt, o.customer, outlets.find((x) => x.id === o.outletId)?.name ?? '', o.method, o.total])]
  const cols = (label, qtyLabel) => [{ key: 'key', header: label }, { key: 'qty', header: qtyLabel, align: 'right' }, { key: 'amount', header: 'Pendapatan', align: 'right', render: (r) => rupiah(r.amount) }]
  const earned = Math.floor(d.revenue / (settings.points.earnPerRp || 1)) * settings.points.earnPts
  const gross = d.revenue - d.hpp
  const recon = reconciliation.map((r) => ({ ...r, id: r.date, diff: r.settled - r.system }))

  return (
    <>
      <PageHeader title={embedded ? 'Laporan cabang' : 'Laporan'} description={`Penjualan ${tenant?.name} per periode, cabang, kasir, dan metode bayar.`}>
        <div role="group" aria-label="Periode" className="flex gap-2">{RANGES.map(([k, l]) => <button key={k} aria-pressed={range === k} onClick={() => setRange(k)} className={`h-10 rounded-full px-4 text-sm font-medium ${range === k ? 'bg-primary text-white' : 'bg-white'}`}>{l}</button>)}</div>
        <Button variant="outline" size="sm" disabled={!d.list.length} onClick={() => { download(`laporan-${range}-hari.csv`, toCsv(exportRows()), 'text/csv;charset=utf-8'); notify('CSV diunduh') }}><DownloadIcon /> CSV</Button>
        <Button variant="outline" size="sm" disabled={!d.list.length} onClick={() => { download(`laporan-${range}-hari.xls`, toXls('Laporan penjualan', exportRows()), 'application/vnd.ms-excel'); notify('Excel diunduh') }}><DownloadIcon /> Excel</Button>
        <Button variant="outline" size="sm" onClick={() => window.print()}><PrinterIcon /> PDF</Button>
      </PageHeader>

      <div id="report-area">
        <h2 className="mb-3 hidden font-display text-xl print:block">Laporan penjualan {tenant?.name} · {RANGES.find((r) => r[0] === range)[1]}</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Pendapatan" value={rupiah(d.revenue)} icon={WalletIcon} />
          <MetricCard label="Jumlah pesanan" value={d.list.length} icon={ReceiptTextIcon} />
          <MetricCard label="Rata-rata per pesanan" value={rupiah(d.revenue / (d.list.length || 1))} icon={TrendingUpIcon} />
          <MetricCard label="Laba kotor" value={rupiah(gross)} hint={`HPP ${rupiah(d.hpp)} · margin ${d.revenue ? Math.round((gross / d.revenue) * 100) : 0}%`} icon={PiggyBankIcon} />
        </div>
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {sections.map(([title, label, rows, q]) => <section key={title}><h2 className="mb-2 font-semibold">{title}</h2><DataTable columns={cols(label, q)} rows={rows} empty="Tidak ada data pada periode ini." /></section>)}
          <section><h2 className="mb-2 font-semibold">Laba kotor per produk</h2><DataTable rows={d.byProduct} empty="Tidak ada data." columns={[{ key: 'key', header: 'Produk' }, { key: 'amount', header: 'Pendapatan', align: 'right', render: (r) => rupiah(r.amount) }, { key: 'hpp', header: 'HPP', align: 'right', render: (r) => rupiah(r.hpp) }, { key: 'gp', header: 'Laba', align: 'right', render: (r) => rupiah(r.amount - r.hpp) }]} /></section>
          <section><h2 className="mb-2 font-semibold">Voucher dan poin</h2>
            <DataTable rows={[{ id: 1, k: 'Total diskon diberikan', v: rupiah(d.disc) }, { id: 2, k: 'Pesanan memakai voucher', v: d.vouchers.length }, { id: 3, k: 'Voucher terpakai (semua periode)', v: vouchers.reduce((s, x) => s + x.used, 0) }, { id: 4, k: 'Poin diterbitkan (estimasi)', v: earned }, { id: 5, k: 'Poin beredar di pelanggan', v: customers.reduce((s, c) => s + c.points, 0) }]} columns={[{ key: 'k', header: 'Metrik' }, { key: 'v', header: 'Nilai', align: 'right' }]} /></section>
        </div>
      </div>

      {!lockOutlet && <section className="mt-6 print:hidden"><h2 className="mb-1 font-semibold">Rekonsiliasi payment gateway</h2><p className="mb-2 text-sm text-muted-foreground">Bandingkan penjualan non-tunai di sistem dengan dana yang cair dari {settings.gateway.provider}.</p>
        <DataTable rows={recon} columns={[{ key: 'date', header: 'Tanggal', render: (r) => fmtDate(r.date) }, { key: 'system', header: 'Di sistem', align: 'right', render: (r) => rupiah(r.system) }, { key: 'settled', header: 'Cair dari gateway', align: 'right', render: (r) => rupiah(r.settled) },
          { key: 'diff', header: 'Selisih', align: 'right', render: (r) => (r.diff ? <span className="text-primary">{rupiah(r.diff)}</span> : '-') },
          { key: 'st', header: 'Status', render: (r) => (r.diff ? <Badge className="gap-1"><AlertTriangleIcon className="size-3" aria-hidden />Selisih</Badge> : <Badge variant="secondary" className="gap-1"><CheckCircle2Icon className="size-3" aria-hidden />Cocok</Badge>) }]} /></section>}
    </>
  )
}
