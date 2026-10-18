import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { outlets, pastOrders } from './data.js'

const Ctx = createContext()
export const useCart = () => useContext(Ctx)

export function CartProvider({ children }) {
  const [items, setItems] = useState([]) // {key, product, opts, qty, unit}
  const [mode, setMode] = useState('pickup')
  const [outlet, setOutlet] = useState(1)
  const [orders, setOrders] = useState(pastOrders)
  const [toast, setToast] = useState(null)
  const timer = useRef()

  const notify = useCallback((msg) => {
    setToast(msg)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setToast(null), 2200)
  }, [])

  const add = (product, opts, unit, qty) => {
    setItems((cur) => {
      const key = product.id + JSON.stringify(opts)
      const hit = cur.find((i) => i.key === key)
      if (hit) return cur.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i))
      return [...cur, { key, product, opts, unit, qty }]
    })
    notify(`${product.name} masuk keranjang`)
  }
  const setQty = (key, qty) =>
    setItems((cur) => (qty < 1 ? cur.filter((i) => i.key !== key) : cur.map((i) => (i.key === key ? { ...i, qty } : i))))
  const clear = () => setItems([])

  const placeOrder = (total) => {
    const id = 'KNM-' + Math.floor(1000 + Math.random() * 9000)
    setOrders((o) => [{
      id, active: true, status: 'Sedang dibuat', total,
      outlet: mode === 'pickup' ? outlets.find((x) => x.id === outlet).name : 'Antar ke rumah',
      date: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
      items: items.map((i) => `${i.product.name} ×${i.qty}`).join(', '),
      lines: items.map((i) => ({ pid: i.product.id, qty: i.qty })),
    }, ...o])
    return id
  }

  const count = items.reduce((s, i) => s + i.qty, 0)
  const subtotal = items.reduce((s, i) => s + i.qty * i.unit, 0)

  return (
    <Ctx.Provider value={{ items, add, setQty, clear, count, subtotal, mode, setMode, outlet, setOutlet, orders, placeOrder, toast, notify }}>
      {children}
    </Ctx.Provider>
  )
}
