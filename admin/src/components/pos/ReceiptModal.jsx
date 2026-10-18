import { useEffect } from 'react'
import { PrinterIcon, CircleCheckIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { rupiah } from '@/lib/format'
import { usePos } from '@/context/pos'
import Receipt from './Receipt'

export default function ReceiptModal({ order, onDone }) {
  const { settings } = usePos()
  useEffect(() => { if (settings.receipt.autoPrint) { const t = setTimeout(() => window.print(), 300); return () => clearTimeout(t) } }, [settings.receipt.autoPrint])
  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent showCloseButton={false} className="gap-4 p-6">
        <div className="flex items-center gap-3 print:hidden"><CircleCheckIcon className="size-9 text-primary" aria-hidden /><div><DialogTitle className="text-lg font-semibold">Pembayaran berhasil</DialogTitle><DialogDescription>Kembalian {rupiah(order.change)}{order.earned > 0 && ` · ${order.customer} dapat +${order.earned} poin`}</DialogDescription></div></div>
        <Receipt order={order} />
        <div className="grid grid-cols-2 gap-2 print:hidden">
          <Button variant="outline" onClick={() => window.print()}><PrinterIcon /> Cetak</Button>
          <Button onClick={onDone}>Transaksi Baru</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
