import { NavLink } from 'react-router-dom'
import { LogOutIcon } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { usePos } from '@/context/pos'
import { navItems } from './nav-items'

export default function IconSidebar() {
  const { user, logout, can, tenant } = usePos()
  return (
    <aside className="hidden w-[84px] shrink-0 flex-col border-r border-border bg-white lg:flex">
      <div className="flex h-16 items-center justify-center border-b border-border" title={tenant?.name}>
        {tenant?.logo ? <img src={tenant.logo} alt={tenant.name} className="logo-round h-9" /> : <span className="flex size-9 items-center justify-center rounded-lg bg-primary font-display text-white">{tenant?.name?.[0]}</span>}
      </div>
      <nav aria-label="Menu utama" className="no-scrollbar flex flex-1 flex-col gap-1 overflow-y-auto py-3">
        {navItems.filter((n) => can(n.perm)).map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => `flex flex-col items-center gap-1 border-l-4 px-1 py-2.5 text-xs font-medium transition-colors ${isActive ? 'border-primary bg-accent/40 text-primary' : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
            <Icon className="size-5" aria-hidden />{label}
          </NavLink>
        ))}
      </nav>
      <div className="flex flex-col items-center gap-1 border-t border-border p-2">
        <Avatar title={`${user?.name} · ${user?.role}`}><AvatarFallback className="bg-accent font-semibold text-foreground">{user?.name?.[0]?.toUpperCase() ?? '?'}</AvatarFallback></Avatar>
        <button onClick={logout} aria-label="Keluar" className="flex flex-col items-center gap-0.5 py-2 text-xs text-muted-foreground hover:text-primary"><LogOutIcon className="size-4" />Keluar</button>
      </div>
    </aside>
  )
}
