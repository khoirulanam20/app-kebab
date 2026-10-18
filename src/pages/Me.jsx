import { ChevronRightIcon, TicketIcon, CoinsIcon, QrCodeIcon, MapPinIcon, GiftIcon, CircleHelpIcon, GlobeIcon, BookOpenIcon, CopyIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useCart } from '../cart.jsx'
import { POINTS } from '../data.js'

const menu = [[MapPinIcon, 'Alamat Saya'], [GiftIcon, 'Tukar Poin'], [CircleHelpIcon, 'Pusat Bantuan'], [GlobeIcon, 'Bahasa'], [BookOpenIcon, 'Syarat & Ketentuan']]
const REF = 'ANAM15'

export default function Me() {
  const nav = useNavigate()
  const { notify } = useCart()
  const copy = () => navigator.clipboard?.writeText(REF).then(() => notify('Kode referral disalin'), () => notify('Gagal menyalin kode'))
  return (
    <div className="min-h-full bg-muted pb-14">
      <header className="relative flex h-56 items-start gap-4 overflow-hidden bg-primary px-5 pt-16 text-white">
        <img src="/logo-mark.png" alt="" aria-hidden className="pointer-events-none absolute -bottom-2 -right-8 w-44 -rotate-6 opacity-30 logo-round" />
        <Avatar className="relative size-16 border-2 border-white"><AvatarFallback className="bg-accent text-lg font-bold text-foreground">KA</AvatarFallback></Avatar>
        <div className="relative pt-2"><h1 className="font-display text-lg">Khoirul Anam</h1><p className="text-sm text-white/90">Langganan tetap abang</p></div>
      </header>
      <Card className="relative z-10 -mt-14 mx-3 p-4">
        <div className="grid grid-cols-3 text-center text-sm font-medium">
          <div className="flex min-h-20 flex-col items-center gap-2"><span>Voucher</span><span className="flex items-center gap-1.5"><TicketIcon className="size-5 text-primary" />0</span></div>
          <div className="flex min-h-20 flex-col items-center gap-2"><span>Poin</span><span className="flex items-center gap-1.5"><CoinsIcon className="size-5 text-accent" />{POINTS}</span></div>
          <button onClick={() => nav('/qr')} className="flex min-h-20 flex-col items-center gap-2"><span>Kode QR</span><QrCodeIcon className="size-5 text-primary" /></button>
        </div>
      </Card>
      <Card className="mx-3 mt-3 gap-1 border-2 border-foreground bg-accent p-5 shadow-[4px_4px_0_#1f1a17]">
        <p className="font-display text-lg">Ajak temen, abang traktir Rp 15K</p>
        <p className="text-sm">Buat kamu dan temenmu, tiap pesanan pertama.</p>
        <Button onClick={copy} className="mt-3 self-start bg-foreground text-white hover:bg-foreground/90"><CopyIcon /> {REF}</Button>
      </Card>
      <Card className="mx-3 mt-3">
        {menu.map(([Icon, l]) => (
          <Button key={l} variant="ghost" onClick={() => notify('Fitur ini segera hadir')} className="h-16 w-full justify-start gap-3 rounded-none px-4 text-base font-normal"><Icon aria-hidden className="size-5" />{l}<ChevronRightIcon className="ml-auto text-muted-foreground" /></Button>
        ))}
      </Card>
    </div>
  )
}
