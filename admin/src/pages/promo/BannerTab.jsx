import { useState } from 'react'
import { ImageIcon, PlusIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { fmtDate } from '@/lib/format'
import { usePos } from '@/context/pos'

const field = 'h-11 rounded-xl border-0 bg-muted'
export default function BannerTab() {
  const { banners, setBanners, notify, logAction } = usePos()
  const [edit, setEdit] = useState(null)
  const live = (b) => b.active && b.from <= '2026-10-18' && b.to >= '2026-10-18'
  const save = (e) => {
    e.preventDefault()
    if (!edit.title.trim()) return notify('Judul wajib diisi')
    if (edit.to < edit.from) return notify('Tanggal selesai harus setelah tanggal mulai')
    setBanners((cur) => (edit.id ? cur.map((b) => (b.id === edit.id ? edit : b)) : [{ ...edit, id: Date.now() }, ...cur]))
    logAction(`${edit.id ? 'Mengubah' : 'Membuat'} ${edit.kind.toLowerCase()} "${edit.title}"`); setEdit(null); notify('Disimpan')
  }
  return (
    <>
      <div className="mb-4 flex justify-end"><Button onClick={() => setEdit({ title: '', kind: 'Banner', from: '2026-10-18', to: '2026-10-31', active: true, image: null })}><PlusIcon /> Banner baru</Button></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {banners.map((b) => (
          <button key={b.id} onClick={() => setEdit({ ...b })} className="text-left">
            <Card className="gap-0 overflow-hidden"><span className="flex h-32 items-center justify-center bg-primary text-white">{b.image ? <img src={b.image} alt="" className="size-full object-cover" /> : <span className="px-4 text-center font-display text-lg">{b.title}</span>}</span>
              <span className="flex items-center justify-between p-4 text-sm"><span><b className="block font-medium">{b.title}</b><span className="text-muted-foreground">{fmtDate(b.from)} – {fmtDate(b.to)}</span></span><span className="flex flex-col items-end gap-1"><Badge variant="secondary">{b.kind}</Badge>{live(b) ? <Badge>Tayang</Badge> : <Badge variant="secondary">{b.active ? 'Terjadwal' : 'Nonaktif'}</Badge>}</span></span></Card>
          </button>
        ))}
      </div>
      <Sheet open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <SheetContent side="right" className="w-full max-w-md overflow-y-auto p-6">
          {edit && (
            <form onSubmit={save} className="space-y-4">
              <div><SheetTitle className="font-display text-xl">{edit.id ? 'Ubah' : 'Baru'} banner/popup</SheetTitle><SheetDescription>Atur jadwal tayang di aplikasi pelanggan.</SheetDescription></div>
              <div className="flex h-32 items-center justify-center overflow-hidden rounded-xl bg-muted">{edit.image ? <img src={edit.image} alt="Pratinjau banner" className="size-full object-cover" /> : <ImageIcon className="size-8 text-muted-foreground" aria-hidden />}</div>
              <input type="file" accept="image/*" aria-label="Gambar banner" onChange={(e) => { const f = e.target.files?.[0]; if (f) setEdit({ ...edit, image: URL.createObjectURL(f) }) }} className="text-sm file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium" />
              <div className="space-y-1.5"><Label htmlFor="bt">Judul</Label><Input id="bt" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} className={field} /></div>
              <div className="space-y-1.5"><Label htmlFor="bk">Jenis</Label><NativeSelect id="bk" value={edit.kind} onChange={(e) => setEdit({ ...edit, kind: e.target.value })}><option>Banner</option><option>Popup</option></NativeSelect></div>
              <div className="grid grid-cols-2 gap-3"><div className="space-y-1.5"><Label htmlFor="bf">Mulai tayang</Label><Input id="bf" type="date" value={edit.from} onChange={(e) => setEdit({ ...edit, from: e.target.value })} className={field} /></div><div className="space-y-1.5"><Label htmlFor="bto">Selesai</Label><Input id="bto" type="date" value={edit.to} onChange={(e) => setEdit({ ...edit, to: e.target.value })} className={field} /></div></div>
              <label className="flex items-center justify-between text-sm"><span>Aktif</span><Switch checked={edit.active} onCheckedChange={(v) => setEdit({ ...edit, active: v })} aria-label="Aktif" /></label>
              <div className="grid grid-cols-2 gap-2"><Button type="button" variant="outline" onClick={() => setEdit(null)}>Batal</Button><Button type="submit">Simpan</Button></div>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
