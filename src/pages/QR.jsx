import { useEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import jsQR from 'jsqr'
import { CameraOffIcon, CheckCircle2Icon, CircleAlertIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MEMBER_CODE } from '../data.js'

function Scanner() {
  const video = useRef()
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [round, setRound] = useState(0) // bump to restart scanning

  useEffect(() => {
    let stream, raf, stopped = false
    setResult(null); setError(null)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    const tick = () => {
      const v = video.current
      if (!stopped && v && v.readyState === v.HAVE_ENOUGH_DATA) {
        canvas.width = v.videoWidth; canvas.height = v.videoHeight
        ctx.drawImage(v, 0, 0)
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const hit = jsQR(img.data, img.width, img.height)
        if (hit?.data) { setResult(hit.data); return }
      }
      raf = requestAnimationFrame(tick)
    }
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } })
      .then((s) => {
        if (stopped) return s.getTracks().forEach((t) => t.stop())
        stream = s
        video.current.srcObject = s
        video.current.play()
        tick()
      })
      .catch(() => setError('Kamera tidak bisa dibuka. Izinkan akses kamera di browser, lalu coba lagi.'))
    return () => { stopped = true; cancelAnimationFrame(raf); stream?.getTracks().forEach((t) => t.stop()) }
  }, [round])

  if (error)
    return (
      <div className="flex flex-col items-center gap-4 p-8 text-center">
        <CameraOffIcon className="size-14 text-muted-foreground" aria-hidden />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button onClick={() => setRound((r) => r + 1)}>Coba Lagi</Button>
      </div>
    )

  if (result) {
    const ok = result.startsWith('KNM-')
    const Icon = ok ? CheckCircle2Icon : CircleAlertIcon
    return (
      <div className="flex flex-col items-center gap-3 p-8 text-center">
        <Icon className={`size-16 ${ok ? 'text-primary' : 'text-muted-foreground'}`} aria-hidden />
        <h2 className="text-lg font-semibold">{ok ? 'Kode dikenali' : 'Kode tidak dikenali'}</h2>
        <p className="max-w-full break-all rounded-xl bg-muted px-4 py-2 text-sm">{result}</p>
        <Button onClick={() => setRound((r) => r + 1)} className="mt-2">Scan Lagi</Button>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-foreground">
        <video ref={video} muted playsInline className="h-full w-full object-cover" aria-label="Pratinjau kamera" />
        <div aria-hidden className="absolute inset-10 rounded-2xl border-4 border-accent/90" />
      </div>
      <p className="mt-4 text-center text-sm text-muted-foreground">Arahkan kamera ke kode QR di meja atau struk.</p>
    </div>
  )
}

export default function QR() {
  const [tab, setTab] = useState('mine')
  return (
    <div className="min-h-full bg-muted pb-14">
      <header className="bg-primary px-4 pb-6 pt-8 text-white">
        <h1 className="font-display text-xl">QR</h1>
        <Tabs value={tab} onValueChange={setTab} className="mt-4">
          <TabsList className="h-auto w-full rounded-full bg-white/20 p-1">
            <TabsTrigger value="mine" className="h-10 rounded-full text-white data-active:bg-white data-active:text-primary">Kode Saya</TabsTrigger>
            <TabsTrigger value="scan" className="h-10 rounded-full text-white data-active:bg-white data-active:text-primary">Scan</TabsTrigger>
          </TabsList>
        </Tabs>
      </header>
      <Card className="mx-4 -mt-2">
        {tab === 'mine' ? (
          <div className="flex flex-col items-center gap-4 p-6 text-center">
            <p className="font-semibold">Khoirul Anam</p>
            <div className="rounded-2xl border-4 border-foreground p-3"><QRCodeSVG value={MEMBER_CODE} size={208} role="img" title={`QR member ${MEMBER_CODE}`} /></div>
            <p className="font-mono text-sm tracking-wider">{MEMBER_CODE}</p>
            <p className="text-sm text-muted-foreground">Tunjukin ke abang kasir biar poinnya masuk.</p>
          </div>
        ) : <Scanner />}
      </Card>
    </div>
  )
}
