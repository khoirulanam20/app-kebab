import { Card } from '@/components/ui/card'

export default function MetricCard({ label, value, hint, icon: Icon }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        {Icon && <span aria-hidden className="flex size-9 items-center justify-center rounded-full bg-accent/40 text-primary"><Icon className="size-4" /></span>}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-[13px] text-muted-foreground">{hint}</p>}
    </Card>
  )
}
