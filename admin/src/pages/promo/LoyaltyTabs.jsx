import { useState } from 'react'
import { PlusIcon, SendIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { Switch } from '@/components/ui/switch'
import DataTable from '@/components/common/DataTable'
import { fmtDateTime, rupiah } from '@/lib/format'
import { usePos } from '@/context/pos'

const field = 'h-11 rounded-xl border-0 bg-muted'
const num = (v) => Number(v.replace(/\D/g, '')) || 0

function useSetting(key) {
  const { settings, setSettings, notify, logAction } = usePos()
  const [draft, setDraft] = useState(settings[key])
  const save = (label) => (e) => { e.preventDefault(); setSettings((s) => ({ ...s, [key]: draft })); logAction(`Mengubah ${label}`); notify('Tersimpan') }
  return [draft, setDraft, save]
}

export function PointsTab() {
  const [p, setP, save] = useSetting('points')
  return (
    <Card className="max-w-xl p-5"><form onSubmit={save('aturan poin')} className="space-y-4">
      <h2 className="font-semibold">Aturan poin</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label htmlFor="pe">Tiap belanja (Rp)</Label><Input id="pe" inputMode="numeric" value={p.earnPerRp} onChange={(e) => setP({ ...p, earnPerRp: num(e.target.value) })} className={field} /></div>
        <div className="space-y-1.5"><Label htmlFor="pq">Dapat (poin)</Label><Input id="pq" inputMode="numeric" value={p.earnPts} onChange={(e) => setP({ ...p, earnPts: num(e.target.value) })} className={field} /></div>
        <div className="space-y-1.5"><Label htmlFor="pr">Tukar (poin)</Label><Input id="pr" inputMode="numeric" value={p.redeemPts} onChange={(e) => setP({ ...p, redeemPts: num(e.target.value) })} className={field} /></div>
        <div className="space-y-1.5"><Label htmlFor="pv">Senilai (Rp)</Label><Input id="pv" inputMode="numeric" value={p.redeemValue} onChange={(e) => setP({ ...p, redeemValue: num(e.target.value) })} className={field} /></div>
      </div>
      <div className="space-y-1.5"><Label htmlFor="pm">Minimal belanja untuk tukar poin (Rp)</Label><Input id="pm" inputMode="numeric" value={p.minSubtotal} onChange={(e) => setP({ ...p, minSubtotal: num(e.target.value) })} className={field} /></div>
      <p className="rounded-xl bg-muted p-3 text-sm">Contoh: belanja {rupiah(50000)} dapat {Math.floor(50000 / (p.earnPerRp || 1)) * p.earnPts} poin. {p.redeemPts} poin = {rupiah(p.redeemValue)}.</p>
      <Button type="submit">Simpan</Button></form></Card>
  )
}

export function LevelsTab() {
  const { members, setMembers, notify, logAction } = usePos()
  const upd = (id, patch) => setMembers((c) => c.map((m) => (m.id === id ? { ...m, ...patch } : m)))
  return (
    <div className="space-y-3"><div className="grid gap-4 md:grid-cols-3">
      {members.map((m) => (
        <Card key={m.id} className="gap-3 p-5">
          <Input aria-label="Nama level" value={m.name} onChange={(e) => upd(m.id, { name: e.target.value })} className="h-10 rounded-lg border-0 bg-muted font-semibold" />
          <div className="grid grid-cols-2 gap-3"><div className="space-y-1.5"><Label htmlFor={`min${m.id}`}>Minimal poin</Label><Input id={`min${m.id}`} inputMode="numeric" value={m.min} onChange={(e) => upd(m.id, { min: num(e.target.value) })} className="h-10 rounded-lg border-0 bg-muted" /></div>
            <div className="space-y-1.5"><Label htmlFor={`mult${m.id}`}>Pengali poin</Label><Input id={`mult${m.id}`} inputMode="decimal" value={m.mult ?? 1} onChange={(e) => upd(m.id, { mult: Math.min(5, Number(e.target.value.replace(/[^\d.]/g, '')) || 0) })} className="h-10 rounded-lg border-0 bg-muted" /></div></div>
          <div className="space-y-1.5"><Label htmlFor={`ben${m.id}`}>Keuntungan</Label><textarea id={`ben${m.id}`} rows={3} value={m.benefit} onChange={(e) => upd(m.id, { benefit: e.target.value })} className="w-full rounded-lg bg-muted p-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/40" /></div>
        </Card>
      ))}</div>
      <p className="text-sm text-muted-foreground">Level ditentukan dari total poin yang pernah didapat. Perubahan langsung dipakai di aplikasi pelanggan dan kasir.</p><Button onClick={() => { logAction('Mengubah level member'); notify('Level tersimpan dan disinkronkan') }}>Simpan level</Button></div>
  )
}

export function ReferralTab() {
  const [r, setR, save] = useSetting('referral')
  return (
    <Card className="max-w-xl p-5"><form onSubmit={save('pengaturan referral')} className="space-y-4">
      <h2 className="font-semibold">Referral</h2>
      <label className="flex items-center justify-between text-sm"><span>Program referral aktif</span><Switch checked={r.active} onCheckedChange={(v) => setR({ ...r, active: v })} aria-label="Program referral aktif" /></label>
      <div className="space-y-1.5"><Label htmlFor="rw">Hadiah untuk pengundang dan teman (Rp)</Label><Input id="rw" inputMode="numeric" value={r.reward} onChange={(e) => setR({ ...r, reward: num(e.target.value) })} className={field} /></div>
      <p className="rounded-xl bg-muted p-3 text-sm">Masing-masing mendapat voucher {rupiah(r.reward)} setelah pesanan pertama teman selesai.</p>
      <Button type="submit">Simpan</Button></form></Card>
  )
}

export function MissionsTab() {
  const { missions, setMissions, products, notify, logAction } = usePos()
  const [s, setS, saveStamp] = useSetting('stamp')
  const [title, setTitle] = useState(''); const [reward, setReward] = useState('')
  const add = (e) => { e.preventDefault(); if (!title.trim() || !reward.trim()) return notify('Isi misi dan hadiah'); setMissions((c) => [...c, { id: Date.now(), title: title.trim(), reward: reward.trim(), active: true }]); logAction(`Menambah misi ${title.trim()}`); setTitle(''); setReward('') }
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="p-5"><form onSubmit={saveStamp('program stempel')} className="space-y-4"><h2 className="font-semibold">Stempel</h2>
        <label className="flex items-center justify-between text-sm"><span>Program stempel aktif</span><Switch checked={s.active} onCheckedChange={(v) => setS({ ...s, active: v })} aria-label="Program stempel aktif" /></label>
        <div className="grid grid-cols-2 gap-3"><div className="space-y-1.5"><Label htmlFor="sb">Beli (kali)</Label><Input id="sb" inputMode="numeric" value={s.buy} onChange={(e) => setS({ ...s, buy: num(e.target.value) })} className={field} /></div><div className="space-y-1.5"><Label htmlFor="sf">Gratis (kali)</Label><Input id="sf" inputMode="numeric" value={s.free} onChange={(e) => setS({ ...s, free: num(e.target.value) })} className={field} /></div></div>
        <div className="space-y-1.5"><Label htmlFor="sp">Produk yang dihitung</Label><NativeSelect id="sp" value={s.productId ?? ''} onChange={(e) => setS({ ...s, productId: Number(e.target.value) || null })}><option value="">Semua kebab</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</NativeSelect></div>
        <p className="rounded-xl bg-muted p-3 text-sm">Beli {s.buy} gratis {s.free}.</p><Button type="submit">Simpan</Button></form></Card>
      <Card className="gap-3 p-5"><h2 className="font-semibold">Misi</h2>
        {missions.map((m) => <div key={m.id} className="flex items-center justify-between gap-3 text-sm"><span><b className="block font-medium">{m.title}</b><span className="text-muted-foreground">Hadiah: {m.reward}</span></span><Switch checked={m.active} onCheckedChange={(v) => setMissions((c) => c.map((x) => (x.id === m.id ? { ...x, active: v } : x)))} aria-label={`Aktifkan ${m.title}`} /></div>)}
        <form onSubmit={add} className="mt-2 space-y-2 border-t border-border pt-3"><Input aria-label="Misi baru" placeholder="Misi, mis. Pesan 5× bulan ini" value={title} onChange={(e) => setTitle(e.target.value)} className={field} /><div className="flex gap-2"><Input aria-label="Hadiah" placeholder="Hadiah" value={reward} onChange={(e) => setReward(e.target.value)} className={field} /><Button type="submit"><PlusIcon /> Tambah</Button></div></form></Card>
    </div>
  )
}

export function BroadcastTab() {
  const { broadcasts, setBroadcasts, customers, notify, logAction } = usePos()
  const [f, setF] = useState({ channel: 'Push', segment: 'Semua pelanggan', text: '', at: '' })
  const targets = (seg) => (seg === 'Semua pelanggan' ? customers : seg === 'Pelanggan loyal' ? customers.filter((c) => c.orders >= 10) : customers.filter((c) => (c.last ?? '') < '2026-09-18')).filter((c) => !c.blocked)
  const send = (e) => {
    e.preventDefault()
    if (!f.text.trim()) return notify('Isi pesan dulu')
    const sent = targets(f.segment).length
    setBroadcasts((c) => [{ id: Date.now(), at: f.at ? new Date(f.at).toISOString() : new Date().toISOString(), channel: f.channel, segment: f.segment, text: f.text.trim(), sent, scheduled: !!f.at }, ...c])
    logAction(`Mengirim ${f.channel} ke ${sent} pelanggan`); notify(f.at ? 'Pesan dijadwalkan' : `Terkirim ke ${sent} pelanggan`); setF({ ...f, text: '', at: '' })
  }
  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <Card className="h-fit p-5"><form onSubmit={send} className="space-y-3"><h2 className="font-semibold">Pesan massal</h2>
        <div className="grid grid-cols-2 gap-3"><div className="space-y-1.5"><Label htmlFor="bc">Saluran</Label><NativeSelect id="bc" value={f.channel} onChange={(e) => setF({ ...f, channel: e.target.value })}><option>Push</option><option>WhatsApp</option></NativeSelect></div>
          <div className="space-y-1.5"><Label htmlFor="bs">Sasaran</Label><NativeSelect id="bs" value={f.segment} onChange={(e) => setF({ ...f, segment: e.target.value })}><option>Semua pelanggan</option><option>Pelanggan loyal</option><option>Tidak aktif</option></NativeSelect></div></div>
        <div className="space-y-1.5"><Label htmlFor="bm">Pesan</Label><textarea id="bm" rows={4} value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} className="w-full rounded-xl bg-muted p-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/40" /></div>
        <div className="space-y-1.5"><Label htmlFor="ba">Jadwal (opsional)</Label><Input id="ba" type="datetime-local" value={f.at} onChange={(e) => setF({ ...f, at: e.target.value })} className={field} /></div>
        <p className="text-[13px] text-muted-foreground">Sasaran: {targets(f.segment).length} pelanggan.</p>
        <Button type="submit" className="w-full"><SendIcon /> {f.at ? 'Jadwalkan' : 'Kirim sekarang'}</Button></form></Card>
      <DataTable rows={broadcasts} empty="Belum ada pesan terkirim." columns={[{ key: 'at', header: 'Waktu', render: (b) => fmtDateTime(b.at) }, { key: 'channel', header: 'Saluran' }, { key: 'segment', header: 'Sasaran' }, { key: 'text', header: 'Pesan' }, { key: 'sent', header: 'Penerima', align: 'right', render: (b) => `${b.sent}${b.scheduled ? ' (jadwal)' : ''}` }]} />
    </div>
  )
}
