import { useState } from 'react'
import { PlugZapIcon, EyeIcon, EyeOffIcon, PlusIcon, SendIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { Switch } from '@/components/ui/switch'
import DataTable from '@/components/common/DataTable'
import SaveBar from '@/components/common/SaveBar'
import { Section, SettingsPage } from '@/components/common/Section'
import { usePos } from '@/context/pos'
import { useDraft } from './useDraft'

const field = 'h-11 rounded-xl border-0 bg-muted'
const area = 'w-full rounded-xl bg-muted p-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/40'
const int = (v) => Number(v.replace(/\D/g, '')) || 0

export function SettingsOrders() {
  const [r, setR] = useState('')
  const { d, setD, dirty, save, reset } = useDraft('orders', 'aturan pesanan online', (x) => (x.rejectMinutes < 1 ? 'Batas waktu minimal 1 menit' : x.pickupHoldMinutes < 1 ? 'Batas ambil minimal 1 menit' : null))
  return (
    <SettingsPage title="Pesanan online" description="Aturan untuk pesanan dari aplikasi pelanggan.">
      <form onSubmit={save}>
        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="Penerimaan pesanan">
            <label className="flex items-center justify-between gap-4 text-sm"><span><b className="block font-medium">Terima otomatis</b><span className="text-muted-foreground">Pesanan langsung masuk dapur tanpa konfirmasi kasir.</span></span><Switch checked={d.autoAccept} onCheckedChange={(v) => setD({ ...d, autoAccept: v })} aria-label="Terima otomatis" /></label>
            <div className="space-y-1.5"><Label htmlFor="rm">Batas waktu konfirmasi (menit)</Label><Input id="rm" inputMode="numeric" disabled={d.autoAccept} value={d.rejectMinutes} onChange={(e) => setD({ ...d, rejectMinutes: int(e.target.value) })} className={field} /><p className="text-[13px] text-muted-foreground">Pesanan yang tidak dikonfirmasi lewat batas ini akan dibatalkan otomatis.</p></div>
          </Section>
          <Section title="Pickup" description="Pesanan yang diambil sendiri di cabang.">
            <div className="space-y-1.5"><Label htmlFor="ph">Batas ambil setelah siap (menit)</Label><Input id="ph" inputMode="numeric" value={d.pickupHoldMinutes ?? 30} onChange={(e) => setD({ ...d, pickupHoldMinutes: int(e.target.value) })} className={field} /><p className="text-[13px] text-muted-foreground">Lewat batas ini kasir bisa menandai pesanan "Tidak diambil". Pelanggan memverifikasi dengan kode 4 digit atau QR dari aplikasi.</p></div>
          </Section>
          <Section title="Alasan penolakan" description="Muncul sebagai pilihan cepat saat menolak pesanan.">
            <div className="flex flex-wrap gap-2">{d.reasons.map((x) => <span key={x} className="flex items-center gap-1 rounded-full bg-muted py-1.5 pl-3 pr-1 text-sm">{x}<button type="button" aria-label={`Hapus ${x}`} onClick={() => setD({ ...d, reasons: d.reasons.filter((y) => y !== x) })} className="flex size-6 items-center justify-center rounded-full hover:bg-white"><Trash2Icon className="size-3.5" /></button></span>)}</div>
            <div className="flex gap-2"><Input aria-label="Alasan baru" placeholder="Alasan baru" value={r} onChange={(e) => setR(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (r.trim() && !d.reasons.includes(r.trim())) { setD({ ...d, reasons: [...d.reasons, r.trim()] }); setR('') } } }} className={field} /><Button type="button" variant="outline" onClick={() => { if (r.trim() && !d.reasons.includes(r.trim())) { setD({ ...d, reasons: [...d.reasons, r.trim()] }); setR('') } }}><PlusIcon /> Tambah</Button></div>
          </Section>
        </div>
        <SaveBar dirty={dirty} onReset={reset} />
      </form>
    </SettingsPage>
  )
}

export function SettingsPayments() {
  const { paymentMethods, setPaymentMethods, notify, logAction } = usePos()
  const { d: g, setD: setG, dirty, save, reset } = useDraft('gateway', 'pengaturan payment gateway', (x) => (!x.serverKey.trim() || !x.clientKey.trim() ? 'Server key dan client key wajib diisi' : null))
  const [show, setShow] = useState(false)
  const [testing, setTesting] = useState(false)
  const [name, setName] = useState(''); const [fee, setFee] = useState('')
  const upd = (id, patch) => setPaymentMethods((c) => c.map((m) => (m.id === id ? { ...m, ...patch } : m)))
  const core = ['cash', 'qris']
  const test = () => { setTesting(true); setTimeout(() => { setTesting(false); notify(g.serverKey.trim() ? `Terhubung ke ${g.provider} (${g.mode})` : 'Server key kosong') }, 900) }
  const add = (e) => { e.preventDefault(); if (!name.trim()) return notify('Isi nama metode'); setPaymentMethods((c) => [...c, { id: 'm' + Date.now(), name: name.trim(), note: '', fee: Number(fee) || 0, active: true }]); logAction(`Menambah metode bayar ${name.trim()}`); setName(''); setFee('') }
  return (
    <SettingsPage title="Pembayaran" description="Metode bayar di kasir dan aplikasi, serta koneksi payment gateway.">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <DataTable rows={paymentMethods} columns={[
            { key: 'name', header: 'Metode', render: (m) => <span><b className="font-medium">{m.name}</b><small className="block text-muted-foreground">{m.note || '—'}</small></span> },
            { key: 'fee', header: 'Biaya (%)', align: 'right', render: (m) => <Input aria-label={`Biaya ${m.name}`} inputMode="decimal" value={m.fee ?? 0} onChange={(e) => upd(m.id, { fee: Number(e.target.value.replace(/[^\d.]/g, '')) || 0 })} className="ml-auto h-9 w-20 rounded-lg border-0 bg-muted text-right" /> },
            { key: 'active', header: 'Aktif', render: (m) => <Switch checked={m.active} onCheckedChange={(v) => { upd(m.id, { active: v }); logAction(`${v ? 'Mengaktifkan' : 'Menonaktifkan'} metode ${m.name}`) }} aria-label={`Aktifkan ${m.name}`} /> },
            { key: 'del', header: '', align: 'right', render: (m) => !core.includes(m.id) && <Button variant="ghost" size="icon" aria-label={`Hapus ${m.name}`} onClick={() => { setPaymentMethods((c) => c.filter((x) => x.id !== m.id)); logAction(`Menghapus metode ${m.name}`) }}><Trash2Icon /></Button> },
          ]} />
          <form onSubmit={add} className="grid gap-2 sm:grid-cols-[1fr_120px_auto]"><Input aria-label="Nama metode baru" placeholder="Metode baru, mis. OVO" value={name} onChange={(e) => setName(e.target.value)} className={field} /><Input aria-label="Biaya persen" inputMode="decimal" placeholder="Biaya %" value={fee} onChange={(e) => setFee(e.target.value)} className={field} /><Button type="submit" variant="outline"><PlusIcon /> Tambah</Button></form>
          <p className="text-[13px] text-muted-foreground">Biaya per metode dipakai di laporan untuk menghitung pendapatan bersih. Perubahan metode langsung berlaku.</p>
        </div>
        <form onSubmit={save}>
          <Section title="Payment gateway" description="Dipakai untuk QRIS dan e-wallet di aplikasi pelanggan.">
            <div className="grid grid-cols-2 gap-3"><div className="space-y-1.5"><Label htmlFor="gp">Penyedia</Label><NativeSelect id="gp" value={g.provider} onChange={(e) => setG({ ...g, provider: e.target.value })}><option>Midtrans</option><option>Xendit</option></NativeSelect></div>
              <div className="space-y-1.5"><Label htmlFor="gm">Mode</Label><NativeSelect id="gm" value={g.mode} onChange={(e) => setG({ ...g, mode: e.target.value })}><option value="sandbox">Sandbox (uji)</option><option value="production">Produksi</option></NativeSelect></div></div>
            {g.mode === 'production' && <p role="alert" className="rounded-xl bg-secondary p-3 text-[13px] font-medium text-primary">Mode produksi memakai uang sungguhan. Pastikan kunci sudah benar.</p>}
            <div className="space-y-1.5"><Label htmlFor="gs">Server key</Label><div className="flex gap-2"><Input id="gs" type={show ? 'text' : 'password'} autoComplete="off" value={g.serverKey} onChange={(e) => setG({ ...g, serverKey: e.target.value })} className={`${field} font-mono`} /><Button type="button" variant="outline" size="icon" aria-label={show ? 'Sembunyikan kunci' : 'Tampilkan kunci'} onClick={() => setShow(!show)}>{show ? <EyeOffIcon /> : <EyeIcon />}</Button></div></div>
            <div className="space-y-1.5"><Label htmlFor="gc">Client key</Label><Input id="gc" value={g.clientKey} onChange={(e) => setG({ ...g, clientKey: e.target.value })} className={`${field} font-mono`} /></div>
            <Button type="button" variant="outline" disabled={testing} onClick={test}><PlugZapIcon /> {testing ? 'Menguji…' : 'Uji koneksi'}</Button>
            <p className="rounded-xl bg-muted p-3 text-[13px] text-muted-foreground">Prototype: kunci hanya disimpan di memori halaman. Di produksi simpan terenkripsi di server.</p>
          </Section>
          <SaveBar dirty={dirty} onReset={reset} />
        </form>
      </div>
    </SettingsPage>
  )
}

export function SettingsNotifications() {
  const { notify } = usePos()
  const { d: n, setD: setN, dirty, save, reset } = useDraft('notify', 'pengaturan notifikasi', (x) => (x.quiet.on && x.quiet.from === x.quiet.to ? 'Jam tenang: mulai dan selesai tidak boleh sama' : null))
  const rows = [['order', 'Status pesanan'], ['promo', 'Promo dan pengumuman']]
  const chans = [['push', 'Push'], ['email', 'Email'], ['wa', 'WhatsApp']]
  const preview = (t) => t.replace('{nama}', 'Dewi').replace('{no}', 'KNM-1031').replace('{status}', 'sedang dibuat').replace('{promo}', 'Beli 5 gratis 1')
  return (
    <SettingsPage title="Notifikasi" description="Saluran, jam tenang, dan isi pesan ke pelanggan.">
      <form onSubmit={save}>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className="space-y-4">
            <Section title="Saluran">
              <table className="w-full text-sm"><thead><tr className="text-left text-[13px] text-muted-foreground"><th className="py-2 font-medium">Jenis</th>{chans.map(([, l]) => <th key={l} className="px-3 py-2 text-center font-medium">{l}</th>)}</tr></thead>
                <tbody>{rows.map(([k, l]) => <tr key={k} className="border-t border-border"><th scope="row" className="py-3 text-left font-medium">{l}</th>{chans.map(([c, cl]) => <td key={c} className="px-3 py-3 text-center"><Switch checked={n[c][k]} onCheckedChange={(v) => setN({ ...n, [c]: { ...n[c], [k]: v } })} aria-label={`${l} lewat ${cl}`} className="mx-auto" /></td>)}</tr>)}</tbody></table>
            </Section>
            <Section title="Jam tenang" description="Promo tidak dikirim di jam ini. Status pesanan tetap dikirim.">
              <label className="flex items-center justify-between text-sm"><span>Aktifkan jam tenang</span><Switch checked={n.quiet.on} onCheckedChange={(v) => setN({ ...n, quiet: { ...n.quiet, on: v } })} aria-label="Jam tenang" /></label>
              <div className="grid grid-cols-2 gap-3"><div className="space-y-1.5"><Label htmlFor="qf">Mulai</Label><Input id="qf" type="time" disabled={!n.quiet.on} value={n.quiet.from} onChange={(e) => setN({ ...n, quiet: { ...n.quiet, from: e.target.value } })} className={field} /></div><div className="space-y-1.5"><Label htmlFor="qt">Selesai</Label><Input id="qt" type="time" disabled={!n.quiet.on} value={n.quiet.to} onChange={(e) => setN({ ...n, quiet: { ...n.quiet, to: e.target.value } })} className={field} /></div></div>
            </Section>
          </div>
          <Section title="Template pesan" description="Variabel: {nama} {no} {status} {promo}">
            {[['order', 'Status pesanan'], ['promo', 'Promo']].map(([k, l]) => (
              <div key={k} className="space-y-2"><Label htmlFor={`t-${k}`}>{l}</Label><textarea id={`t-${k}`} rows={2} value={n.templates[k]} onChange={(e) => setN({ ...n, templates: { ...n.templates, [k]: e.target.value } })} className={area} />
                <div className="flex items-start justify-between gap-3 rounded-xl bg-muted p-3 text-sm"><span><b className="block text-[13px] text-muted-foreground">Pratinjau</b>{preview(n.templates[k])}</span><Button type="button" variant="outline" size="sm" onClick={() => notify('Pesan uji dikirim ke Anda')}><SendIcon /> Tes</Button></div></div>
            ))}
          </Section>
        </div>
        <SaveBar dirty={dirty} onReset={reset} />
      </form>
    </SettingsPage>
  )
}
