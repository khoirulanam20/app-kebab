import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { CameraOffIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'

// Opens the camera and reports the first QR code it reads. USB scanners need no dialog: they type into the input.
export default function QrScanDialog({ open, title = 'Scan QR', hint, onResult, onClose }) {
  const video = useRef()
  const [error, setError] = useState(null)
  const [round, setRound] = useState(0)

  useEffect(() => {
    if (!open) return
    let stream, raf, stopped = false
    setError(null)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    const tick = () => {
      const v = video.current
      if (!stopped && v && v.readyState === v.HAVE_ENOUGH_DATA) {
        canvas.width = v.videoWidth; canvas.height = v.videoHeight
        ctx.drawImage(v, 0, 0)
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const hit = jsQR(img.data, img.width, img.height)
        if (hit?.data) { stopped = true; onResult(hit.data); return }
      }
      raf = requestAnimationFrame(tick)
    }
    if (!navigator.mediaDevices?.getUserMedia) setError('Browser ini tidak mendukung kamera. Ketik kodenya manual.')
    else navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then((s) => { if (stopped) return s.getTracks().forEach((t) => t.stop()); stream = s; video.current.srcObject = s; video.current.play(); tick() })
      .catch(() => setError('Kamera tidak bisa dibuka. Izinkan akses kamera, atau ketik kodenya manual.'))
    return () => { stopped = true; cancelAnimationFrame(raf); stream?.getTracks().forEach((t) => t.stop()) }
  }, [open, round]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="gap-4 p-6">
        <div><DialogTitle className="text-lg font-semibold">{title}</DialogTitle><DialogDescription>{hint ?? 'Arahkan kamera ke kode QR.'}</DialogDescription></div>
        {error ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center"><CameraOffIcon className="size-12 text-muted-foreground" aria-hidden /><p className="text-sm text-muted-foreground">{error}</p><Button onClick={() => setRound((r) => r + 1)}>Coba lagi</Button></div>
        ) : (
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-foreground"><video ref={video} muted playsInline aria-label="Pratinjau kamera" className="size-full object-cover" /><div aria-hidden className="absolute inset-10 rounded-xl border-4 border-accent/90" /></div>
        )}
      </DialogContent>
    </Dialog>
  )
}
