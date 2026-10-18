import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeftIcon, CoinsIcon, TicketIcon, WifiOffIcon, ArrowDownLeftIcon, ArrowUpRightIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useMember } from '../member.jsx'
import { rupiah } from '../data.js'
import { voucherDiscount } from '../lib/membership.js'

const TYPE = { earn: 'Belanja', redeem: 'Tukar poin', bonus: 'Bonus', adjust: 'Penyesuaian', refund: 'Pengembalian' }

export default function Points() {
  const nav = useNavigate()
  const { member, config, level, next, ledger, owned, online } = useMember()
  const pct = next ? Math.min(100, Math.round(((member.lifetime - level.min) / (next.min - level.min)) * 100)) : 100
  return (
    <div className="min-h-full bg-muted pb-14">
      <header className="bg-primary px-4 pb-16 pt-6 text-white">
        <div className="relative flex items-center justify-center">
          <Button variant="ghost" size="icon" onClick={() => nav(-1)} aria-label="Kembali" className="absolute left-0 size-11 text-white hover:bg-white/15 hover:text-white"><ChevronLeftIcon className="size-6" /></Button>
          <h1 className="font-display text-xl">Poin & Member</h1>
        </div>
        <div className="mt-6 text-center"><p className="flex items-center justify-center gap-2 font-display text-5xl"><CoinsIcon className="size-9 text-accent" aria-hidden />{member.points}</p><p className="text-sm text-white/90">poin kamu · Member {level.name}</p></div>
      </header>

      <Card className="relative z-10 -mt-10 mx-3 gap-3 p-5">
        {!online && <p className="flex items-center gap-2 rounded-xl bg-muted p-3 text-[13px] text-muted-foreground"><WifiOffIcon className="size-4 shrink-0" aria-hidden />Mode demo: server belum aktif, data poin contoh.</p>}
        <div className="flex items-center justify-between text-sm"><b>Level {level.name}</b>{next ? <span className="text-muted-foreground">{next.toGo} poin lagi ke {next.name}</span> : <span className="text-muted-foreground">Level tertinggi</span>}</div>
        <div className="h-3 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label={`Menuju level ${next?.name ?? level.name}`} aria-valuenow={pct} aria-valuemax={100}><div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} /></div>
        <p className="text-sm text-muted-foreground">{level.benefit}</p>
      </Card>

      <section className="mx-3 mt-4">
        <h2 className="mb-2 font-semibold">Cara dapat dan pakai poin</h2>
        <Card className="gap-2 p-4 text-sm">
          <p>Belanja {rupiah(config.points.earnPerRp)} = <b>{config.points.earnPts} poin</b>, dikali level kamu ({level.mult}×).</p>
          <p>Tiap <b>{config.points.redeemPts} poin</b> = potongan <b>{rupiah(config.points.redeemValue)}</b> saat checkout (min. belanja {rupiah(config.points.minSubtotal)}).</p>
          {config.referral.active && <p>Ajak teman: dapat bonus poin setelah pesanan pertama temanmu selesai.</p>}
        </Card>
      </section>

      <section className="mx-3 mt-4">
        <h2 className="mb-2 font-semibold">Level member</h2>
        <div className="grid gap-2">{config.levels.map((l) => (
          <Card key={l.name} className={`flex-row items-center justify-between gap-3 p-4 text-sm ${l.name === level.name ? 'ring-2 ring-primary' : ''}`}>
            <span><b className="block">{l.name}{l.name === level.name && <Badge className="ml-2">Kamu</Badge>}</b><span className="text-muted-foreground">{l.benefit}</span></span><span className="shrink-0 text-muted-foreground">{l.min} poin</span>
          </Card>))}</div>
      </section>

      <section className="mx-3 mt-4">
        <h2 className="mb-2 flex items-center gap-2 font-semibold"><TicketIcon className="size-4 text-primary" aria-hidden />Voucher saya</h2>
        {owned.length ? <div className="grid gap-2">{owned.map((v) => (
          <Card key={v.code} className="gap-0.5 p-4 text-sm"><b className="font-mono">{v.code}</b><span>{v.type === 'pct' ? `Diskon ${v.value}%` : `Potongan ${rupiah(v.value)}`} · min. belanja {rupiah(v.min)}</span><span className="text-muted-foreground">Berlaku s/d {v.until}</span></Card>))}</div>
          : <Card className="p-4 text-sm text-muted-foreground">Belum ada voucher aktif.</Card>}
      </section>

      <section className="mx-3 mt-4">
        <h2 className="mb-2 font-semibold">Riwayat poin</h2>
        {ledger.length ? <Card className="divide-y divide-border px-4">{ledger.map((l) => (
          <div key={l.id} className="flex items-center gap-3 py-3 text-sm">
            <span aria-hidden className={`flex size-9 shrink-0 items-center justify-center rounded-full ${l.pts > 0 ? 'bg-accent/40 text-foreground' : 'bg-secondary text-primary'}`}>{l.pts > 0 ? <ArrowDownLeftIcon className="size-4" /> : <ArrowUpRightIcon className="size-4" />}</span>
            <span className="min-w-0 flex-1"><b className="block truncate font-medium">{l.note}</b><span className="text-[13px] text-muted-foreground">{TYPE[l.type] ?? l.type} · {new Date(l.at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span></span>
            <b className={`tabular-nums ${l.pts > 0 ? '' : 'text-primary'}`}>{l.pts > 0 ? '+' : ''}{l.pts}</b>
          </div>))}</Card>
          : <Card className="p-4 text-sm text-muted-foreground">Belum ada riwayat. Pesan dulu, poin langsung masuk.</Card>}
      </section>
      <div className="mx-3 mt-4"><Button className="w-full" render={<Link to="/menu" />}>Pesan dan kumpulkan poin</Button></div>
    </div>
  )
}
