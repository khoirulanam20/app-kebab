import { Link } from 'react-router-dom'
import { SandwichIcon, ReceiptTextIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useCart } from '../cart.jsx'
import { products, rupiah } from '../data.js'

const lineTab = 'h-11 flex-none px-0 text-muted-foreground data-active:text-foreground after:bottom-0 after:bg-primary'

function OrderCard({ o, onRate, onAgain }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">{o.outlet.replace('Kebab N Me – ', '')}</h3>
        {o.active ? <Badge>{o.status}</Badge> : <span className="text-sm text-muted-foreground">{o.status}</span>}
      </div>
      <p className="text-sm text-muted-foreground">{o.date} · {o.id}</p>
      <div className="mt-3 flex items-start justify-between gap-3">
        <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted text-primary"><SandwichIcon className="size-6" /></span>
        <p className="flex-1 text-sm">{o.items}</p><p className="text-sm font-semibold">{rupiah(o.total)}</p>
      </div>
      {!o.active && (
        <div className="mt-3 flex justify-end gap-2">
          {o.rate && <Button variant="outline" size="sm" onClick={onRate}>Kasih Nilai</Button>}
          <Button size="sm" onClick={onAgain}>Pesan Lagi</Button>
        </div>
      )}
    </Card>
  )
}

export default function Orders() {
  const { orders, notify, add } = useCart()
  const active = orders.filter((o) => o.active)
  const history = orders.filter((o) => !o.active)
  const again = () => add(products[0], {}, products[0].price, 1)
  return (
    <div className="min-h-full bg-muted pb-14">
      <Tabs defaultValue="active" className="gap-0">
        <div className="bg-white px-4 pt-8">
          <h1 className="font-display text-xl">Pesanan Saya</h1>
          <TabsList variant="line" className="mt-3 h-auto w-full justify-start gap-8 p-0">
            <TabsTrigger value="active" className={lineTab}>Aktif{active.length ? ` (${active.length})` : ''}</TabsTrigger>
            <TabsTrigger value="history" className={lineTab}>Riwayat</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="active" className="space-y-3 p-4">
          {active.length ? active.map((o) => <OrderCard key={o.id} o={o} />) : (
            <div className="flex flex-col items-center gap-3 py-14 text-center">
              <ReceiptTextIcon className="size-14 text-muted-foreground/60" aria-hidden />
              <p className="font-medium">Belum ada pesanan jalan</p>
              <p className="text-sm text-muted-foreground">Perut kosong? Abang siap ngiris.</p>
              <Button render={<Link to="/menu" />}>Pesan Sekarang</Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="history" className="space-y-3 p-4">
          {history.map((o) => <OrderCard key={o.id} o={o} onRate={() => notify('Makasih penilaiannya!')} onAgain={again} />)}
        </TabsContent>
      </Tabs>
    </div>
  )
}
