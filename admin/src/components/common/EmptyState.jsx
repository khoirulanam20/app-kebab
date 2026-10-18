export default function EmptyState({ icon: Icon, title, text, children }) {
  return (
    <div className="flex flex-col items-center gap-2 py-14 text-center">
      {Icon && <Icon className="size-12 text-muted-foreground/60" aria-hidden />}
      <p className="font-medium">{title}</p>
      {text && <p className="max-w-xs text-sm text-muted-foreground">{text}</p>}
      {children}
    </div>
  )
}
