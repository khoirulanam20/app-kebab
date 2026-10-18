import { Card } from '@/components/ui/card'

export function SettingsPage({ title, description, children }) {
  return (
    <div>
      <div className="mb-5"><h1 className="font-display text-2xl">{title}</h1>{description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}</div>
      {children}
    </div>
  )
}

export function Section({ title, description, children, className = '' }) {
  return (
    <Card className={`gap-4 p-5 ${className}`}>
      {(title || description) && <div>{title && <h2 className="font-semibold">{title}</h2>}{description && <p className="text-sm text-muted-foreground">{description}</p>}</div>}
      {children}
    </Card>
  )
}
