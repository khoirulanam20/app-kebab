import { NavLink } from 'react-router-dom'
import { usePos } from '@/context/pos'
import { navItems } from './nav-items'

export default function BottomNav() {
  const { can } = usePos()
  return (
    <nav aria-label="Menu utama" className="no-scrollbar flex shrink-0 overflow-x-auto border-t border-border bg-white lg:hidden">
      {navItems.filter((n) => can(n.perm)).map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end}
          className={({ isActive }) => `flex min-w-[76px] flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
          <Icon className="size-5" aria-hidden />{label}
        </NavLink>
      ))}
    </nav>
  )
}
