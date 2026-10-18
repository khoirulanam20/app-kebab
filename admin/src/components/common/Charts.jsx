import { rupiah } from '@/lib/format'

export function Bars({ data, label }) {
  const max = Math.max(...data.map((d) => d.total), 1)
  return (
    <div className="mt-4 flex h-52 items-end gap-3" role="img" aria-label={`${label}: ${data.map((d) => `${d.label} ${rupiah(d.total)}`).join(', ')}`}>
      {data.map((d, i) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-[13px] tabular-nums text-muted-foreground">{d.total >= 1e6 ? (d.total / 1e6).toFixed(1) + 'jt' : Math.round(d.total / 1000) + 'k'}</span>
          <div className={`w-full rounded-t-lg ${i === data.length - 1 ? 'bg-primary' : 'bg-accent'}`} style={{ height: `${(d.total / max) * 100}%` }} />
          <span className="text-[13px]">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

