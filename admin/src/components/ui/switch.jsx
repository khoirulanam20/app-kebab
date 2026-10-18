import { cn } from "@/lib/utils"

function Switch({ checked, onCheckedChange, className, ...props }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onCheckedChange(!checked)}
      className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:ring-3 focus-visible:ring-ring/40", checked ? "bg-primary" : "bg-border", className)} {...props}>
      <span className={cn("absolute top-1 size-5 rounded-full bg-white shadow transition-all", checked ? "left-6" : "left-1")} />
    </button>
  )
}
export { Switch }
