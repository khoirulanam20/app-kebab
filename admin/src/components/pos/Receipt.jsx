import { rupiah, fmtDateTime } from '@/lib/format'
import { usePos } from '@/context/pos'

// Print target: index.css prints only #receipt. mode="kitchen" shows a large items-only ticket.
// cfg lets the settings page preview unsaved receipt options.
export default function Receipt({ order, mode = 'receipt', cfg }) {
  const { tenant, settings } = usePos()
  const c = cfg ?? settings.receipt
  const kitchen = mode === 'kitchen'
  const logo = settings.business.logo ?? tenant?.logo
  return (
    <div id="receipt" className="mx-auto w-full rounded-xl bg-muted p-4 font-mono text-[13px]" style={{ '--receipt-w': c.width === '58' ? '58mm' : '80mm', maxWidth: c.width === '58' ? 260 : 340 }}>
      {!kitchen && c.showLogo && logo && <img src={logo} alt="" className="logo-round mx-auto mb-2 h-10" />}
      <p className="text-center font-bold">{kitchen ? 'TIKET DAPUR' : settings.business.name.toUpperCase()}</p>
      {!kitchen && <p className="text-center">{settings.business.tagline}</p>}
      {!kitchen && c.showAddress && settings.business.address && <p className="text-center text-[12px]">{settings.business.address}</p>}
      {!kitchen && c.header && <p className="mt-1 text-center">{c.header}</p>}
      <p className="mt-2 text-center">{order.id} · {fmtDateTime(order.createdAt)}</p>
      <p className="text-center">{order.delivery ? 'ANTAR' : 'AMBIL'} · {order.customer}</p>
      <hr className="my-2 border-dashed border-foreground/30" />
      {order.items.map((i, n) => (
        <div key={n} className={`flex justify-between gap-2 ${kitchen ? 'text-base font-bold' : ''}`}>
          <span>{i.qty}× {i.name}{i.opts && <small className="block font-normal">{i.opts}</small>}</span>
          {!kitchen && <span>{rupiah(i.price * i.qty)}</span>}
        </div>
      ))}
      {!kitchen && (
        <>
          <hr className="my-2 border-dashed border-foreground/30" />
          <div className="flex justify-between"><span>Subtotal</span><span>{rupiah(order.subtotal ?? order.total)}</span></div>
          {order.discount > 0 && <div className="flex justify-between"><span>Diskon</span><span>- {rupiah(order.discount)}</span></div>}
          {order.service > 0 && <div className="flex justify-between"><span>Biaya layanan</span><span>{rupiah(order.service)}</span></div>}
          {order.tax > 0 && <div className="flex justify-between"><span>Pajak</span><span>{rupiah(order.tax)}</span></div>}
          <div className="flex justify-between font-bold"><span>Total</span><span>{rupiah(order.total)}</span></div>
          <div className="flex justify-between"><span>Metode</span><span>{order.method}</span></div>
          {order.redeemPts > 0 && <div className="flex justify-between"><span>Poin ditukar</span><span>{order.redeemPts}</span></div>}
          {order.earned > 0 && <div className="flex justify-between font-bold"><span>Poin didapat</span><span>+{order.earned}</span></div>}
          {c.footer && <p className="mt-3 text-center">{c.footer}</p>}
          <p className="text-center text-[11px] opacity-60">{tenant?.domain}</p>
        </>
      )}
    </div>
  )
}
