// Menu variants: groups of choices per product (e.g. "Isi: Sapi / Ayam"), plus the shared option groups when a product opts in.
// group: { id, name, required, multi, items: [{ n, add }] }
export const groupsFor = (product, shared) => [...(product.variants ?? []), ...(product.opts ? shared : [])].filter((g) => g.items.length)

// required groups start on their first choice so the cashier can only change it, never leave it empty
export const initialSelection = (groups) => Object.fromEntries(groups.map((g) => [g.id, g.required ? [g.items[0].n] : []]))

export function summarize(groups, sel) {
  const add = groups.reduce((s, g) => s + g.items.filter((i) => sel[g.id]?.includes(i.n)).reduce((t, i) => t + i.add, 0), 0)
  const label = groups.flatMap((g) => sel[g.id] ?? []).join(' · ')
  const missing = groups.filter((g) => g.required && !sel[g.id]?.length).map((g) => g.name)
  return { add, label, missing }
}

// drops empty groups/items and trims names before saving a product
export const cleanVariants = (groups) => groups
  .map((g) => ({ ...g, name: g.name.trim(), items: g.items.map((i) => ({ n: i.n.trim(), add: Number(i.add) || 0 })).filter((i) => i.n) }))
  .filter((g) => g.name && g.items.length)
