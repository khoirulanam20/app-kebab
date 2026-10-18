import { useState } from 'react'
import { PlusIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import DataTable from '@/components/common/DataTable'
import { fmtDate, rupiah } from '@/lib/format'
import { usePos } from '@/context/pos'

const field = 'h-11 rounded-xl border-0 bg-muted'
const blank = { code: '', type: 'pct', value: '', min: '', quota: '', until: '2026-12-31', active: true, used: 0 }

export default function VoucherTab() {
  const { vouchers, setVouchers, notify, logAction } = usePos()
  const [edit, setEdit] = useState(null)
  const n = (v) => v.replace(/\D/g, '')
  const save = (e) => {
    e.preventDefault()
    const d = { ...edit, code: edit.code.trim().toUpperCase(), value: Number(edit.value), min: Number(edit.min) || 0, quota: Number(edit.quota) }
    if (!d.code || !d.value || !d.quota) return notify('Kode, nilai, dan kuota wajib diisi')
    if (d.type === 'pct' && d.value > 100) return notify('Persen maksimal 100')
    if (!d.id && vouchers.some((v) => v.code === d.code)) return notify('Kode sudah dipakai')
    setVouchers((cur) => (d.id ? cur.map((v) => (v.id === d.id ? d : v)) : [{ ...d, id: Date.now() }, ...cur]))
    logAction(`${d.id ? 'Mengubah' : 'Membuat'} voucher ${d.code}`); setEdit(null); notify('Voucher disimpan')
  }
  const status = (v) => (!v.active ? ['Nonaktif', 'secondary'] : v.used >= v.quota ? ['Habis', 'secondary'] : v.until < '2026-10-18' ? ['Kedaluwarsa', 'secondary'] : ['Aktif', 'default'])
  return (
    <>
      <div className="mb-4 flex justify-end"><Button onClick={() => setEdit(blank)}><PlusIcon /> Voucher baru</Button></div>
      <DataTable rows={vouchers} onRowClick={(v) => setEdit({ ...v })} columns={[
        { key: 'code', header: 'Kode', render: (v) => <b className="font-mono font-medium">{v.code}</b> },
        { key: 'value', header: 'Nilai', render: (v) => (v.type === 'pct' ? `${v.value}%` : rupiah(v.value)) },
        { key: 'min', header: 'Min. belanja', align: 'right', render: (v) => rupiah(v.min) },
        { key: 'use', header: 'Terpakai', align: 'right', render: (v) => `${v.used}/${v.quota}` },
        { key: 'until', header: 'Berlaku s/d', render: (v) => fmtDate(v.until) },
        { key: 'st', header: 'Status', render: (v) => { const [l, variant] = status(v); return <Badge variant={variant}>{l}</Badge> } },
      ]} />
      <Sheet open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <SheetContent side="right" className="w-full max-w-md overflow-y-auto p-6">
          {edit && (
            <form onSubmit={save} className="space-y-4">
              <div><SheetTitle className="font-display text-xl">{edit.id ? 'Ubah voucher' : 'Voucher baru'}</SheetTitle><SheetDescription>Voucher bisa dipakai di kasir dan aplikasi pelanggan.</SheetDescription></div>
              <div className="space-y-1.5"><Label htmlFor="vc">Kode</Label><Input id="vc" value={edit.code} onChange={(e) => setEdit({ ...edit, code: e.target.value })} className={`${field} font-mono uppercase`} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label htmlFor="vt">Jenis</Label><NativeSelect id="vt" value={edit.type} onChange={(e) => setEdit({ ...edit, type: e.target.value })}><option value="pct">Persen (%)</option><option value="flat">Potongan (Rp)</option></NativeSelect></div>
                <div className="space-y-1.5"><Label htmlFor="vv">Nilai</Label><Input id="vv" inputMode="numeric" value={edit.value} onChange={(e) => setEdit({ ...edit, value: n(e.target.value) })} className={field} /></div>
                <div className="space-y-1.5"><Label htmlFor="vm">Min. belanja (Rp)</Label><Input id="vm" inputMode="numeric" value={edit.min} onChange={(e) => setEdit({ ...edit, min: n(e.target.value) })} className={field} /></div>
                <div className="space-y-1.5"><Label htmlFor="vq">Kuota</Label><Input id="vq" inputMode="numeric" value={edit.quota} onChange={(e) => setEdit({ ...edit, quota: n(e.target.value) })} className={field} /></div>
              </div>
              <div className="space-y-1.5"><Label htmlFor="vu">Berlaku sampai</Label><Input id="vu" type="date" value={edit.until} onChange={(e) => setEdit({ ...edit, until: e.target.value })} className={field} /></div>
              <label className="flex items-center justify-between text-sm"><span>Aktif</span><Switch checked={edit.active} onCheckedChange={(v) => setEdit({ ...edit, active: v })} aria-label="Aktif" /></label>
              <div className="grid grid-cols-2 gap-2"><Button type="button" variant="outline" onClick={() => setEdit(null)}>Batal</Button><Button type="submit">Simpan</Button></div>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
