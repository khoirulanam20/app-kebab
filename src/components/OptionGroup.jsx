import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const chip =
  'h-11 rounded-xl border border-transparent bg-muted px-5 text-sm font-medium text-foreground/70 ' +
  'aria-pressed:border-accent aria-pressed:bg-accent/40 aria-pressed:text-foreground data-pressed:border-accent data-pressed:bg-accent/40 data-pressed:text-foreground'

// single: value is a string; multiple: value is string[]
export default function OptionGroup({ legend, options, value, onChange, multiple = false }) {
  const arr = multiple ? value : [value]
  return (
    <fieldset>
      <legend className="mb-3 font-medium">{legend}</legend>
      <ToggleGroup multiple={multiple} value={arr} spacing={3}
        onValueChange={(v) => (multiple ? onChange(v) : v.length && onChange(v[0]))}>
        {options.map((o) => <ToggleGroupItem key={o.value} value={o.value} className={chip}>{o.label}</ToggleGroupItem>)}
      </ToggleGroup>
    </fieldset>
  )
}
