import { MinusIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function QtyStepper({ qty, onChange, removable = false, size = 'icon' }) {
  const atMin = qty <= 1
  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" size={size} aria-label={removable && atMin ? 'Hapus' : 'Kurangi'} disabled={!removable && atMin}
        onClick={() => onChange(qty - 1)} className="border-accent text-foreground hover:bg-accent/30">
        {removable && atMin ? <Trash2Icon /> : <MinusIcon />}
      </Button>
      <span className="w-4 text-center font-medium">{qty}</span>
      <Button variant="amber" size={size} aria-label="Tambah" onClick={() => onChange(qty + 1)}><PlusIcon /></Button>
    </div>
  )
}
