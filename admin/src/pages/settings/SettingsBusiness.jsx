import { useState } from 'react'
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { Switch } from '@/components/ui/switch'
import Receipt from '@/components/pos/Receipt'
import SaveBar from '@/components/common/SaveBar'
import { Section, SettingsPage } from '@/components/common/Section'
import { fmtDate, rupiah } from '@/lib/format'
import { cartTotals } from '@/lib/pricing'
import { usePos } from '@/context/pos'
import { useDraft } from './useDraft'

const field = 'h-11 rounded-xl border-0 bg-muted'
const area = 'w-full rounded-xl bg-muted p-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/40'
const sample = { id: 'KNM-1031', createdAt: new Date('2026-10-18T12:30:00').toISOString(), customer: 'Walk-in', delivery: false, method: 'Tunai', items: [{ qty: 2, name: 'Kebab Original', price: 18000, opts: 'Regular · Sedang' }, { qty: 1, name: 'Es Teh Manis', price: 6000 }], subtotal: 42000, discount: 0, total: 42000 }

export function SettingsProfile() {
  const { tenant } = usePos()
  const validate = (b) => !b.name.trim() ? 'Nama bisnis wajib diisi' : !/^\S+@\S+\.\S+$/.test(b.email) ? 'Format email belum benar' : b.phone.replace(/\D/g, '').length < 9 ? 'Nomor telepon minimal 9 digit' : null
  const { d: b, setD: setB, dirty, save, reset } = useDraft('business', 'profil bisnis', validate)
  const set = (k) => (e) => setB({ ...b, [k]: e.target.value })
  const logo = b.logo ?? tenant?.logo
  return (
    <SettingsPage title="Profil bisnis" description="Nama dan logo tampil di struk, sidebar, dan aplikasi pelanggan.">
      <form onSubmit={save}>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_340px]">
          <Section title="Identitas">
            <div className="flex items-center gap-4"><span className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">{logo ? <img src={logo} alt="Logo bisnis" className="max-h-full" /> : <span className="text-sm text-muted-foreground">Belum ada</span>}</span>
              <div><Label htmlFor="logo" className="mb-1.5 block">Logo</Label><input id="logo" type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) setB({ ...b, logo: URL.createObjectURL(f) }) }} className="text-sm file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium" /></div></div>
            <div className="space-y-1.5"><Label htmlFor="bn">Nama bisnis</Label><Input id="bn" value={b.name} onChange={set('name')} className={field} /></div>
            <div className="space-y-1.5"><Label htmlFor="bt">Slogan</Label><Input id="bt" value={b.tagline} onChange={set('tagline')} className={field} /></div>
            <div className="space-y-1.5"><Label htmlFor="bab">Tentang bisnis</Label><textarea id="bab" rows={4} value={b.about ?? ''} onChange={set('about')} maxLength={400} className={area} /><p className="text-[13px] text-muted-foreground">Tampil di halaman profil publik (alamat <code>/</code>). {(b.about ?? '').length}/400</p></div>
          </Section>
          <Section title="Kontak dan lokasi">
            <div className="space-y-1.5"><Label htmlFor="bp">Nomor telepon</Label><Input id="bp" inputMode="tel" value={b.phone} onChange={set('phone')} className={field} /></div>
            <div className="space-y-1.5"><Label htmlFor="be">Email</Label><Input id="be" type="email" value={b.email} onChange={set('email')} className={field} /></div>
            <div className="space-y-1.5"><Label htmlFor="ba">Alamat</Label><textarea id="ba" rows={2} value={b.address} onChange={set('address')} className={area} /></div>
            <div className="space-y-1.5"><Label htmlFor="bz">Zona waktu</Label><NativeSelect id="bz" value={b.timezone} onChange={set('timezone')}><option value="WIB">WIB (UTC+7)</option><option value="WITA">WITA (UTC+8)</option><option value="WIT">WIT (UTC+9)</option></NativeSelect></div>
          </Section>
          <Section title="Pratinjau">
            <div className="overflow-hidden rounded-2xl bg-primary p-4 text-center text-white">{logo && <img src={logo} alt="" className="logo-round mx-auto mb-2 h-10" />}<p className="font-display text-lg">{b.name || 'Nama bisnis'}</p><p className="text-sm opacity-90">{b.tagline}</p></div>
            <p className="text-[13px] text-muted-foreground">Tampilan kepala aplikasi pelanggan. Perubahan baru berlaku setelah disimpan.</p>
          </Section>
        </div>
        <SaveBar dirty={dirty} onReset={reset} />
      </form>
    </SettingsPage>
  )
}

export function SettingsReceipt() {
  const { d: r, setD: setR, dirty, save, reset } = useDraft('receipt', 'pengaturan struk dan printer')
  const toggle = (k, label) => <label className="flex items-center justify-between text-sm"><span>{label}</span><Switch checked={r[k]} onCheckedChange={(v) => setR({ ...r, [k]: v })} aria-label={label} /></label>
  return (
    <SettingsPage title="Struk & printer" description="Atur isi struk dan printer thermal di kasir.">
      <form onSubmit={save}>
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_380px]">
          <Section title="Kertas dan printer">
            <div className="space-y-1.5"><Label htmlFor="rw">Lebar kertas</Label><NativeSelect id="rw" value={r.width} onChange={(e) => setR({ ...r, width: e.target.value })}><option value="58">58 mm</option><option value="80">80 mm</option></NativeSelect></div>
            <div className="space-y-1.5"><Label htmlFor="rp">Printer</Label><NativeSelect id="rp" value={r.printer} onChange={(e) => setR({ ...r, printer: e.target.value })}>{['Epson TM-T82 (USB)', 'Xprinter XP-58 (Bluetooth)', 'Printer bawaan browser'].map((p) => <option key={p}>{p}</option>)}</NativeSelect></div>
            {toggle('autoPrint', 'Cetak otomatis setelah pembayaran')}
          </Section>
          <Section title="Isi struk">
            {toggle('showLogo', 'Tampilkan logo')}{toggle('showAddress', 'Tampilkan alamat')}
            <div className="space-y-1.5"><Label htmlFor="rh">Teks atas</Label><Input id="rh" value={r.header} onChange={(e) => setR({ ...r, header: e.target.value })} placeholder="Mis. Wifi: kebabnme / 12345678" className={field} /></div>
            <div className="space-y-1.5"><Label htmlFor="rf">Teks bawah</Label><textarea id="rf" rows={2} value={r.footer} onChange={(e) => setR({ ...r, footer: e.target.value })} className={area} /></div>
          </Section>
          <Section title="Pratinjau" className="lg:col-span-2 xl:col-span-1"><Receipt order={sample} cfg={r} /></Section>
        </div>
        <SaveBar dirty={dirty} onReset={reset} />
      </form>
    </SettingsPage>
  )
}

export function SettingsFees() {
  const { d: f, setD: setF, dirty, save, reset } = useDraft('fees', 'pajak dan biaya layanan')
  const num = (v) => Math.min(100, Number(v.replace(/[^\d.]/g, '')) || 0)
  return (
    <SettingsPage title="Pajak & biaya" description="Berlaku di kasir, struk, dan pesanan online.">
      <form onSubmit={save}>
        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="Tarif">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label htmlFor="ft">Pajak (%)</Label><Input id="ft" inputMode="decimal" value={f.taxPct} onChange={(e) => setF({ ...f, taxPct: num(e.target.value) })} className={field} /></div>
              <div className="space-y-1.5"><Label htmlFor="fs">Biaya layanan (%)</Label><Input id="fs" inputMode="decimal" value={f.serviceFeePct} onChange={(e) => setF({ ...f, serviceFeePct: num(e.target.value) })} className={field} /></div>
            </div>
            <label className="flex items-center justify-between text-sm"><span>Harga menu sudah termasuk pajak</span><Switch checked={f.taxIncluded} onCheckedChange={(v) => setF({ ...f, taxIncluded: v })} aria-label="Harga sudah termasuk pajak" /></label>
            <p className="text-[13px] text-muted-foreground">{f.taxIncluded ? 'Pajak diambil dari harga, total tidak bertambah.' : 'Pajak ditambahkan di atas harga. Dihitung dari subtotal setelah diskon ditambah biaya layanan.'}</p>
          </Section>
          <Section title="Simulasi">
            <table className="w-full text-sm"><thead><tr className="text-left text-[13px] text-muted-foreground"><th className="py-1 font-medium">Belanja</th><th className="py-1 text-right font-medium">Layanan</th><th className="py-1 text-right font-medium">Pajak</th><th className="py-1 text-right font-medium">Total</th></tr></thead>
              <tbody>{[25000, 50000, 100000].map((v) => { const t = cartTotals([{ unit: v, qty: 1 }], null, f); return <tr key={v} className="border-t border-border"><td className="py-2.5">{rupiah(v)}</td><td className="text-right tabular-nums">{rupiah(t.service)}</td><td className="text-right tabular-nums">{rupiah(t.tax)}</td><td className="text-right font-semibold tabular-nums">{rupiah(t.total)}</td></tr> })}</tbody></table>
          </Section>
        </div>
        <SaveBar dirty={dirty} onReset={reset} />
      </form>
    </SettingsPage>
  )
}

export function SettingsContent() {
  const { faq, setFaq, notify } = usePos()
  const { d: c, setD: setC, dirty, save, reset } = useDraft('content', 'konten aplikasi')
  const [q, setQ] = useState(''); const [a, setA] = useState('')
  const move = (i, dir) => setFaq((cur) => { const arr = [...cur]; const j = i + dir; if (j < 0 || j >= arr.length) return cur; [arr[i], arr[j]] = [arr[j], arr[i]]; return arr })
  const upd = (id, patch) => setFaq((cur) => cur.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  return (
    <SettingsPage title="Konten aplikasi" description="Syarat layanan, kebijakan privasi, dan FAQ yang tampil di aplikasi pelanggan.">
      <form onSubmit={(e) => save(e, { ...c, updated: new Date().toISOString().slice(0, 10) })}>
        <div className="grid gap-4 xl:grid-cols-2">
          <Section title="Teks hukum" description={`Terakhir diperbarui ${fmtDate(c.updated)}`}>
            <div className="space-y-1.5"><Label htmlFor="tos">Syarat layanan</Label><textarea id="tos" rows={7} value={c.tos} onChange={(e) => setC({ ...c, tos: e.target.value })} className={area} /></div>
            <div className="space-y-1.5"><Label htmlFor="prv">Kebijakan privasi</Label><textarea id="prv" rows={7} value={c.privacy} onChange={(e) => setC({ ...c, privacy: e.target.value })} className={area} /></div>
          </Section>
          <Section title="Pratinjau di aplikasi">
            <div className="mx-auto w-full max-w-sm space-y-4 rounded-3xl border-4 border-foreground bg-white p-5 text-sm">
              <div><h3 className="font-semibold">Syarat & Ketentuan</h3><p className="mt-1 whitespace-pre-line text-muted-foreground">{c.tos}</p></div>
              <div><h3 className="font-semibold">Kebijakan Privasi</h3><p className="mt-1 whitespace-pre-line text-muted-foreground">{c.privacy}</p></div>
            </div>
          </Section>
        </div>
        <SaveBar dirty={dirty} onReset={reset} />
      </form>
      <Section title="FAQ" description="Tersimpan otomatis. Urutan di sini sama dengan di aplikasi." className="mt-4">
        <div className="grid gap-3 lg:grid-cols-2">
          {faq.map((f, i) => (
            <div key={f.id} className="space-y-2 rounded-xl bg-muted p-3">
              <div className="flex items-center gap-2"><Input aria-label="Pertanyaan" value={f.q} onChange={(e) => upd(f.id, { q: e.target.value })} className="h-10 rounded-lg border-0 bg-white font-medium" />
                <Button type="button" variant="ghost" size="icon" aria-label="Naikkan" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUpIcon /></Button>
                <Button type="button" variant="ghost" size="icon" aria-label="Turunkan" disabled={i === faq.length - 1} onClick={() => move(i, 1)}><ArrowDownIcon /></Button>
                <Button type="button" variant="ghost" size="icon" aria-label={`Hapus ${f.q}`} onClick={() => setFaq((x) => x.filter((y) => y.id !== f.id))}><Trash2Icon /></Button></div>
              <textarea aria-label="Jawaban" rows={2} value={f.a} onChange={(e) => upd(f.id, { a: e.target.value })} className="w-full rounded-lg bg-white p-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/40" />
            </div>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (!q.trim() || !a.trim()) return notify('Isi pertanyaan dan jawaban'); setFaq((x) => [...x, { id: Date.now(), q: q.trim(), a: a.trim() }]); setQ(''); setA('') }} className="grid gap-2 lg:grid-cols-[1fr_1fr_auto]">
          <Input aria-label="Pertanyaan baru" placeholder="Pertanyaan baru" value={q} onChange={(e) => setQ(e.target.value)} className={field} /><Input aria-label="Jawaban baru" placeholder="Jawaban" value={a} onChange={(e) => setA(e.target.value)} className={field} /><Button type="submit" variant="outline"><PlusIcon /> Tambah FAQ</Button>
        </form>
      </Section>
    </SettingsPage>
  )
}
