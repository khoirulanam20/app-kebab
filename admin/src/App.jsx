import { Navigate, Route, Routes } from 'react-router-dom'
import AdminShell from '@/components/layout/AdminShell'
import { usePos } from '@/context/pos'
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import Pos from '@/pages/Pos'
import Payment from '@/pages/Payment'
import Dashboard from '@/pages/Dashboard'
import MenuPage from '@/pages/MenuPage'
import Stock from '@/pages/Stock'
import Promo from '@/pages/Promo'
import Customers from '@/pages/Customers'
import Outlets from '@/pages/Outlets'
import OutletDetail from '@/pages/outlets/OutletDetail'
import Team from '@/pages/Team'
import Reports from '@/pages/Reports'
import Kitchen from '@/pages/Kitchen'
import OrdersLayout from '@/pages/orders/OrdersLayout'
import OrdersHistory from '@/pages/orders/OrdersHistory'
import OrdersHold from '@/pages/orders/OrdersHold'
import OrdersPickup from '@/pages/orders/OrdersPickup'
import OrdersOffline from '@/pages/orders/OrdersOffline'
import ShiftLayout from '@/pages/cashier/ShiftLayout'
import CashDrawer from '@/pages/cashier/CashDrawer'
import TodaySales from '@/pages/cashier/TodaySales'
import ShiftHistory from '@/pages/cashier/ShiftHistory'
import SettingsLayout from '@/pages/settings/SettingsLayout'
import { SettingsProfile, SettingsReceipt, SettingsFees, SettingsContent } from '@/pages/settings/SettingsBusiness'
import { SettingsOrders, SettingsPayments, SettingsNotifications } from '@/pages/settings/SettingsOperations'
import { SettingsStaff, SettingsAccess, SettingsSecurity, SettingsLog } from '@/pages/settings/SettingsAccess'
import { SettingsBackup, SettingsTenant } from '@/pages/settings/SettingsData'

function RequireAuth({ children }) {
  const { user } = usePos()
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth><AdminShell /></RequireAuth>}>
        <Route path="/kasir" element={<Pos />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/kitchen" element={<Kitchen />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/stock" element={<Stock />} />
        <Route path="/promo" element={<Promo />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/cabang" element={<Outlets />} />
        <Route path="/cabang/:id" element={<OutletDetail />} />
        <Route path="/team" element={<Team />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/orders" element={<OrdersLayout />}>
          <Route index element={<Navigate to="history" replace />} />
          <Route path="history" element={<OrdersHistory />} />
          <Route path="pickup" element={<OrdersPickup />} />
          <Route path="hold" element={<OrdersHold />} />
          <Route path="offline" element={<OrdersOffline />} />
        </Route>
        <Route path="/cashier" element={<ShiftLayout />}>
          <Route index element={<Navigate to="drawer" replace />} />
          <Route path="drawer" element={<CashDrawer />} />
          <Route path="today" element={<TodaySales />} />
          <Route path="history" element={<ShiftHistory />} />
        </Route>
        <Route path="/settings" element={<SettingsLayout />}>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<SettingsProfile />} />
          <Route path="receipt" element={<SettingsReceipt />} />
          <Route path="fees" element={<SettingsFees />} />
          <Route path="content" element={<SettingsContent />} />
          <Route path="orders" element={<SettingsOrders />} />
          <Route path="payments" element={<SettingsPayments />} />
          <Route path="notifications" element={<SettingsNotifications />} />
          <Route path="staff" element={<SettingsStaff />} />
          <Route path="access" element={<SettingsAccess />} />
          <Route path="security" element={<SettingsSecurity />} />
          <Route path="log" element={<SettingsLog />} />
          <Route path="backup" element={<SettingsBackup />} />
          <Route path="tenant" element={<SettingsTenant />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
