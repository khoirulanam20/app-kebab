import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from './cart.jsx'
import { MemberProvider } from './member.jsx'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <MemberProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </MemberProvider>
  </BrowserRouter>
)
