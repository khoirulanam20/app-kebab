import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { usePos } from '@/context/pos'

export default function OpenShiftModal() {
  const { openShift, user, outlets } = usePos()
  const [cash, setCash] = useState('200000')
  const [outletId, setOutletId] = useState(user?.outletId ?? outlets[0].id)
  const submit = (e) => { e.preventDefault(); openShift(Number(cash) || 0, Number(outletId)) }
  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent showCloseButton={false} className="gap-4 p-6">
        <div>
          <DialogTitle className="font-display text-xl">Buka Shift</DialogTitle>
          <DialogDescription className="mt-1">Isi saldo awal laci kasir sebelum mulai jualan.</DialogDescription>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5"><Label htmlFor="outlet">Cabang</Label>
            <NativeSelect id="outlet" disabled={!!user?.outletId} value={outletId} onChange={(e) => setOutletId(e.target.value)}>{outlets.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</NativeSelect></div>
          <div className="space-y-1.5"><Label htmlFor="cash">Saldo awal laci (Rp)</Label>
            <Input id="cash" inputMode="numeric" value={cash} onChange={(e) => setCash(e.target.value.replace(/\D/g, ''))} className="h-11 rounded-xl border-0 bg-muted" /></div>
          <Button type="submit" className="w-full">Buka Shift</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
