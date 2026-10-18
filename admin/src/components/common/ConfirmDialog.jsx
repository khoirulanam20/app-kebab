import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'

export default function ConfirmDialog({ open, title, text, confirmLabel = 'Ya, lanjutkan', onConfirm, onClose }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="gap-4 p-6">
        <div><DialogTitle className="text-lg font-semibold">{title}</DialogTitle><DialogDescription>{text}</DialogDescription></div>
        <div className="grid grid-cols-2 gap-2"><Button variant="outline" onClick={onClose}>Batal</Button><Button onClick={() => { onConfirm(); onClose() }}>{confirmLabel}</Button></div>
      </DialogContent>
    </Dialog>
  )
}
