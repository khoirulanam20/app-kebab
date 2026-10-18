import { cn } from "@/lib/utils"

function NativeSelect({ className, ...props }) {
  return (
    <select
      className={cn("h-11 w-full rounded-xl border-0 bg-muted px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/40", className)}
      {...props}
    />
  )
}
export { NativeSelect }
