import { Routes, Route } from 'react-router-dom'
import BottomNav from './components/BottomNav.jsx'
import { useCart } from './cart.jsx'
import Home from './pages/Home.jsx'
import Menu from './pages/Menu.jsx'
import Checkout from './pages/Checkout.jsx'
import Payment from './pages/Payment.jsx'
import Orders from './pages/Orders.jsx'
import Me from './pages/Me.jsx'
import QR from './pages/QR.jsx'

export default function App() {
  const { toast } = useCart()
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
          <Route path="/me" element={<Me />} />
        </Routes>
      </main>
      <div aria-live="polite" className="pointer-events-none absolute inset-x-0 bottom-24 z-[60] flex justify-center px-4">
        {toast && <p className="rounded-full bg-foreground px-5 py-3 text-sm font-medium text-white shadow-lg">{toast}</p>}
      </div>
      <BottomNav />
    </div>
  )
}
