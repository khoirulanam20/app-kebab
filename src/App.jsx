import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { ShoppingBagIcon } from 'lucide-react'
import { rupiah } from './data.js'
import BottomNav from './components/BottomNav.jsx'
import { useCart } from './cart.jsx'
import Home from './pages/Home.jsx'
import Menu from './pages/Menu.jsx'
import Checkout from './pages/Checkout.jsx'
import Payment from './pages/Payment.jsx'
import Orders from './pages/Orders.jsx'
import Me from './pages/Me.jsx'
import QR from './pages/QR.jsx'
import Points from './pages/Points.jsx'

export default function App() {
  const { toast, count, subtotal } = useCart()
  const { pathname } = useLocation()
  const showMini = count > 0 && ['/', '/orders', '/me'].includes(pathname)
  return (
    <div className="relative mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-white">
      <main className="no-scrollbar relative flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/qr" element={<QR />} />
          <Route path="/points" element={<Points />} />
          <Route path="/me" element={<Me />} />
        </Routes>
      </main>
      <div aria-live="polite" className="pointer-events-none absolute inset-x-0 top-4 z-[60] flex justify-center px-4">
        {toast && <p className="animate-in fade-in slide-in-from-top-4 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-white shadow-lg duration-200">{toast}</p>}
      </div>
      {showMini && (
        <Link to="/checkout" className="relative z-20 flex items-center justify-between bg-cream px-4 py-3 text-sm font-semibold shadow-[0_-1px_0_var(--border)]">
          <span className="flex items-center gap-2"><ShoppingBagIcon className="size-5 text-primary" />{count} item · {rupiah(subtotal)}</span>
          <span className="text-primary">Lihat keranjang ›</span>
        </Link>
      )}
      <BottomNav />
    </div>
  )
}
