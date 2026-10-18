import { Card } from '@/components/ui/card'

// columns: [{ key, header, render?(row), align?: 'right' }]
export default function DataTable({ columns, rows, onRowClick, empty = 'Belum ada data.' }) {
  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/60 text-[13px] text-muted-foreground">
            {columns.map((c) => <th key={c.key} scope="col" className={`px-4 py-3 font-medium ${c.align === 'right' ? 'text-right' : ''}`}>{c.header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-muted-foreground">{empty}</td></tr>}
          {rows.map((r, i) => (
            <tr key={r.id ?? i} onClick={onRowClick ? () => onRowClick(r) : undefined}
              className={`border-b border-border last:border-0 ${onRowClick ? 'cursor-pointer hover:bg-muted/60' : ''}`}>
              {columns.map((c) => <td key={c.key} className={`px-4 py-3 ${c.align === 'right' ? 'text-right tabular-nums' : ''}`}>{c.render ? c.render(r) : r[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
