import { useState } from 'react'
import { Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Section } from '@/components/common/Section'
import { fmtDate, rupiah } from '@/lib/format'
import { usePos } from '@/context/pos'
import { DAYS } from '@/mock'

const field = 'h-11 rounded-xl border-0 bg-muted'
const n = (v) => v.replace(/[^\d.]/g, '')
export const blankOutlet = () => ({ name: '', address: '', phone: '', lat: '', lng: '', hours: Object.fromEntries(DAYS.map((d) => [d, { open: '10:00', close: '22:00', closed: false }])), tempClosed: false, holidays: [], radiusKm: 5, feeBase: 5000, feePerKm: 2000, prepMin: 10, active: true })

// Shared by the "new cabang" sheet and the outlet detail "Pengaturan" tab.
export default function OutletForm({ initial, onSave, onCancel, submitLabel = 'Simpan cabang', wide }) {
  const { notify } = usePos()
  const [edit, setEdit] = useState(() => structuredClone(initial))
  const [hol, setHol] = useState({ date: '', note: '' })
  const dirty = JSON.stringify(edit) !== JSON.stringify(initial)
  const setDay = (d, patch) => setEdit({ ...edit, hours: { ...edit.hours, [d]: { ...edit.hours[d], ...patch } } })
  const submit = (e) => {
    e.preventDefault()
    if (!edit.name.trim()) return notify('Nama cabang wajib diisi')
    const bad = DAYS.find((d) => !edit.hours[d].closed && edit.hours[d].close <= edit.hours[d].open)
    if (bad) return notify(`Jam tutup ${bad} harus setelah jam buka`)
    onSave(edit)
  }
  const data = (
    <Section title="Data cabang">
      <div className="space-y-1.5"><Label htmlFor="on">Nama</Label><Input id="on" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} className={field} /></div>
      <div className="space-y-1.5"><Label htmlFor="oa">Alamat</Label><Input id="oa" value={edit.address} onChange={(e) => setEdit({ ...edit, address: e.target.value })} className={field} /></div>
      <div className="grid grid-cols-3 gap-3"><div className="space-y-1.5"><Label htmlFor="op">Telepon</Label><Input id="op" inputMode="tel" value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} className={field} /></div><div className="space-y-1.5"><Label htmlFor="ola">Latitude</Label><Input id="ola" value={edit.lat} onChange={(e) => setEdit({ ...edit, lat: e.target.value })} className={field} /></div><div className="space-y-1.5"><Label htmlFor="olg">Longitude</Label><Input id="olg" value={edit.lng} onChange={(e) => setEdit({ ...edit, lng: e.target.value })} className={field} /></div></div>
      <label className="flex items-center justify-between text-sm"><span>Cabang aktif</span><Switch checked={edit.active} onCheckedChange={(v) => setEdit({ ...edit, active: v })} aria-label="Cabang aktif" /></label>
      <label className="flex items-center justify-between text-sm"><span>Tutup sementara</span><Switch checked={edit.tempClosed} onCheckedChange={(v) => setEdit({ ...edit, tempClosed: v })} aria-label="Tutup sementara" /></label>
    </Section>
  )
  const hours = (
    <Section title="Jam buka">
      {DAYS.map((d) => (
        <div key={d} className="flex items-center gap-2 text-sm"><span className="w-10 font-medium">{d}</span>
          <Input type="time" aria-label={`Buka ${d}`} disabled={edit.hours[d].closed} value={edit.hours[d].open} onChange={(e) => setDay(d, { open: e.target.value })} className="h-10 rounded-lg border-0 bg-muted" />
          <Input type="time" aria-label={`Tutup ${d}`} disabled={edit.hours[d].closed} value={edit.hours[d].close} onChange={(e) => setDay(d, { close: e.target.value })} className="h-10 rounded-lg border-0 bg-muted" />
          <label className="flex shrink-0 items-center gap-1.5"><Checkbox checked={edit.hours[d].closed} onCheckedChange={(v) => setDay(d, { closed: v })} aria-label={`Libur ${d}`} />Libur</label></div>
      ))}
    </Section>
  )
  const extra = (
    <>
      <Section title="Hari libur khusus">
        {edit.holidays.map((h, i) => <div key={i} className="flex items-center justify-between rounded-xl bg-muted px-3 py-2 text-sm"><span>{fmtDate(h.date)} · {h.note}</span><Button type="button" variant="ghost" size="icon" aria-label="Hapus libur" onClick={() => setEdit({ ...edit, holidays: edit.holidays.filter((_, j) => j !== i) })}><Trash2Icon /></Button></div>)}
        <div className="flex gap-2"><Input type="date" aria-label="Tanggal libur" value={hol.date} onChange={(e) => setHol({ ...hol, date: e.target.value })} className="h-10 rounded-lg border-0 bg-muted" /><Input aria-label="Keterangan libur" placeholder="Keterangan" value={hol.note} onChange={(e) => setHol({ ...hol, note: e.target.value })} className="h-10 rounded-lg border-0 bg-muted" /><Button type="button" variant="outline" size="sm" onClick={() => { if (!hol.date) return; setEdit({ ...edit, holidays: [...edit.holidays, hol] }); setHol({ date: '', note: '' }) }}>Tambah</Button></div>
      </Section>
      <Section title="Antar dan estimasi">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label htmlFor="or">Radius antar (km)</Label><Input id="or" inputMode="decimal" value={edit.radiusKm} onChange={(e) => setEdit({ ...edit, radiusKm: n(e.target.value) })} className={field} /></div>
          <div className="space-y-1.5"><Label htmlFor="opm">Estimasi siap (menit)</Label><Input id="opm" inputMode="numeric" value={edit.prepMin} onChange={(e) => setEdit({ ...edit, prepMin: n(e.target.value) })} className={field} /></div>
          <div className="space-y-1.5"><Label htmlFor="ofb">Ongkir dasar (Rp)</Label><Input id="ofb" inputMode="numeric" value={edit.feeBase} onChange={(e) => setEdit({ ...edit, feeBase: Number(n(e.target.value)) || 0 })} className={field} /></div>
          <div className="space-y-1.5"><Label htmlFor="ofk">Tambahan per km (Rp)</Label><Input id="ofk" inputMode="numeric" value={edit.feePerKm} onChange={(e) => setEdit({ ...edit, feePerKm: Number(n(e.target.value)) || 0 })} className={field} /></div>
        </div>
        <p className="rounded-xl bg-muted p-3 text-sm">Contoh ongkir 3 km: {rupiah(edit.feeBase + edit.feePerKm * 3)}</p>
      </Section>
    </>
  )
  return (
    <form onSubmit={submit} className="space-y-4">
      {wide ? (
        <div className="grid gap-4 xl:grid-cols-2"><div className="space-y-4">{data}{extra}</div>{hours}</div>
      ) : (
        <div className="space-y-4">{data}{hours}{extra}</div>
      )}
      <div className={`flex gap-2 ${dirty || !wide ? '' : 'opacity-60'}`}>
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>{wide ? 'Batalkan perubahan' : 'Batal'}</Button>}
        <Button type="submit" disabled={wide && !dirty}>{submitLabel}</Button>
      </div>
    </form>
  )
}
