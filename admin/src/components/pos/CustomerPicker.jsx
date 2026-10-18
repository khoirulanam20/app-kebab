import { useState } from 'react'
import { QrCodeIcon, UserPlusIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import QrScanDialog from '@/components/common/QrScanDialog'
import { usePos } from '@/context/pos'

export default function CustomerPicker({ onClose }) {
  const { customers, setCustomer, addCustomer, lookupMember, levelFor, notify } = usePos()
  const [q, setQ] = useState('')
  const [adding, setAdding] = useState(false)
  const [scan, setScan] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '' })
  const list = customers.filter((c) => (c.name + c.phone + c.code).toLowerCase().includes(q.toLowerCase()))
  const pick = (c) => { if (c?.blocked) return notify(`${c.name} diblokir dan tidak bisa dipilih`); setCustomer(c); onClose() }
  const create = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || form.phone.replace(/\D/g, '').length < 9) return notify('Isi nama dan nomor HP yang valid')
    const c = await addCustomer({ name: form.name.trim(), phone: form.phone })
    if (c) { notify(`Member ${c.name} terdaftar · ${c.code}`); pick(c) }
  }
  // a USB scanner types the member code then presses Enter; the camera dialog returns the same text
  const byCode = async (raw) => {
    const c = await lookupMember(raw)
    if (c) pick(c); else notify('Member tidak ditemukan')
  }
  const field = 'h-11 rounded-xl border-0 bg-muted'
  return (
    <>
      <Dialog open onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="gap-3 p-6">
          <div><DialogTitle className="text-lg font-semibold">Pilih Member</DialogTitle><DialogDescription>Scan QR member, ketik nomor HP atau kode, atau daftarkan member baru.</DialogDescription></div>
          {adding ? (
            <form onSubmit={create} className="space-y-3">
              <Input autoFocus placeholder="Nama" aria-label="Nama" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} />
              <Input placeholder="Nomor HP" aria-label="Nomor HP" inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={field} />
              <p className="rounded-xl bg-muted p-3 text-[13px] text-muted-foreground">Member baru langsung dapat kode member dan bonus poin sambutan.</p>
              <div className="grid grid-cols-2 gap-2"><Button type="button" variant="outline" onClick={() => setAdding(false)}>Batal</Button><Button type="submit">Daftarkan</Button></div>
            </form>
          ) : (
            <>
              <div className="flex gap-2">
                <Input autoFocus placeholder="Cari nama, nomor HP, atau kode (Enter)" aria-label="Cari member" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && q.trim()) { e.preventDefault(); byCode(q) } }} className={field} />
                <Button variant="outline" size="icon" aria-label="Scan QR member" onClick={() => setScan(true)} className="size-11 shrink-0"><QrCodeIcon /></Button>
              </div>
              <ul className="max-h-64 overflow-y-auto">
                <li><button onClick={() => pick(null)} className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm hover:bg-muted"><span className="font-medium">Walk-in</span><span className="text-muted-foreground">Tanpa member</span></button></li>
                {list.map((c) => (
                  <li key={c.id}><button onClick={() => pick(c)} disabled={c.blocked} className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-3 text-left text-sm hover:bg-muted disabled:opacity-50">
                    <span className="min-w-0"><b className="block truncate font-medium">{c.name}{c.blocked && ' (diblokir)'}</b><span className="text-[13px] text-muted-foreground">{c.phone}</span></span>
                    <span className="flex shrink-0 items-center gap-2"><Badge variant="secondary">{levelFor(c).name}</Badge><span className="tabular-nums text-muted-foreground">{c.points} poin</span></span></button></li>
                ))}
              </ul>
              <Button variant="outline" onClick={() => setAdding(true)}><UserPlusIcon /> Member baru</Button>
            </>
          )}
        </DialogContent>
      </Dialog>
      <QrScanDialog open={scan} title="Scan QR member" hint="Minta pelanggan menunjukkan QR dari menu QR di aplikasi." onClose={() => setScan(false)} onResult={(t) => { setScan(false); byCode(t) }} />
    </>
  )
}
