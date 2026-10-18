import { UserRoundIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const Person = ({ s, strong }) => (
  <span className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${strong ? 'bg-primary text-white' : 'bg-muted'} ${s.active ? '' : 'opacity-50'}`}>
    <UserRoundIcon className="size-4 shrink-0" aria-hidden /><span><b className="font-medium">{s.name}</b><small className={`block ${strong ? 'text-white/80' : 'text-muted-foreground'}`}>{s.role}{s.active ? '' : ' · nonaktif'}</small></span>
  </span>
)

// Owner > Head Kitchen > Kasir / Dapur. Pass outletId to show one outlet's branch only.
export default function OrgTree({ staff, outlets, outletId }) {
  const owner = staff.find((s) => s.role === 'Owner')
  const heads = staff.filter((s) => s.role === 'Head Kitchen' && (!outletId || s.outletId === outletId))
  const members = (h) => staff.filter((s) => s.managerId === h.id)
  const orphans = staff.filter((s) => ['Kasir', 'Dapur'].includes(s.role) && (!outletId || s.outletId === outletId) && !heads.some((h) => h.id === s.managerId))
  const outletName = (id) => outlets.find((o) => o.id === id)?.name.split('– ').pop()
  return (
    <div className="space-y-3" role="tree" aria-label="Struktur tim">
      {owner && <div role="treeitem"><Person s={owner} strong /></div>}
      <ul className="space-y-4 border-l-2 border-border pl-4 sm:ml-5">
        {heads.map((h) => (
          <li key={h.id} role="treeitem" className="space-y-2">
            <div className="flex flex-wrap items-center gap-2"><Person s={h} /><Badge variant="secondary">{outletName(h.outletId)}</Badge></div>
            <ul className="flex flex-wrap gap-2 border-l-2 border-border pl-4 sm:ml-5">{members(h).map((m) => <li key={m.id}><Person s={m} /></li>)}{!members(h).length && <li className="text-[13px] text-muted-foreground">Belum ada Kasir atau Dapur.</li>}</ul>
          </li>
        ))}
        {!heads.length && <li className="text-[13px] text-muted-foreground">Belum ada Head Kitchen di cabang ini.</li>}
      </ul>
      {orphans.length > 0 && <div className="rounded-xl bg-secondary p-3 text-[13px] text-primary">Tanpa atasan: {orphans.map((o) => o.name).join(', ')}</div>}
    </div>
  )
}
