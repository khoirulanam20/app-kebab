import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { PosProvider } from './context/pos.jsx'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <PosProvider>
      <App />
    </PosProvider>
  </BrowserRouter>
)
