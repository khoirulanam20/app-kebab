import { NavLink, Outlet } from 'react-router-dom'
import PageHeader from './PageHeader'

// Header + route-based tab bar, used by Orders, Shift and Settings.
export default function SectionTabs({ title, description, tabs }) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <div role="tablist" aria-label={title} className="no-scrollbar mb-4 flex gap-6 overflow-x-auto border-b border-border">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to} role="tab" className={({ isActive }) => `relative h-11 shrink-0 text-sm font-medium leading-[2.75rem] ${isActive ? 'text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:rounded-t after:bg-primary' : 'text-muted-foreground'}`}>{t.label}</NavLink>
        ))}
      </div>
      <Outlet />
    </>
  )
}
