import { Button } from '@/components/ui/button'

// Sticky bar shown only while a form has unsaved changes.
export default function SaveBar({ dirty, onReset }) {
  if (!dirty) return null
  return (
    <div role="status" className="sticky bottom-0 z-10 -mx-4 mt-6 flex items-center justify-between gap-3 border-t border-border bg-white px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,.06)] lg:-mx-6 lg:px-6">
      <p className="text-sm font-medium"><span aria-hidden className="mr-2 inline-block size-2 rounded-full bg-primary" />Perubahan belum disimpan</p>
      <div className="flex gap-2"><Button type="button" variant="outline" size="sm" onClick={onReset}>Batalkan</Button><Button type="submit" size="sm">Simpan perubahan</Button></div>
    </div>
  )
}
