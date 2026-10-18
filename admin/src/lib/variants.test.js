import assert from 'node:assert/strict'
import { cleanVariants, groupsFor, initialSelection, summarize } from './variants.js'

const shared = [{ id: 'size', name: 'Ukuran', required: true, multi: false, items: [{ n: 'Regular', add: 0 }, { n: 'Jumbo', add: 8000 }] }]
const own = [
  { id: 'v-isi', name: 'Isi', required: true, multi: false, items: [{ n: 'Sapi', add: 0 }, { n: 'Campur', add: 3000 }] },
  { id: 'v-top', name: 'Topping', required: false, multi: true, items: [{ n: 'Keju', add: 4000 }, { n: 'Telur', add: 3000 }] },
]
const product = { variants: own, opts: true }

const groups = groupsFor(product, shared)
assert.deepEqual(groups.map((g) => g.id), ['v-isi', 'v-top', 'size']) // own variants first, then shared
assert.deepEqual(groupsFor({ variants: own, opts: false }, shared).map((g) => g.id), ['v-isi', 'v-top'])
assert.deepEqual(groupsFor({}, shared), []) // nothing to choose -> added straight to the cart
assert.deepEqual(groupsFor({ variants: [{ id: 'x', name: 'Kosong', items: [] }] }, shared), []) // empty groups ignored

const sel = initialSelection(groups)
assert.deepEqual(sel, { 'v-isi': ['Sapi'], 'v-top': [], size: ['Regular'] })
assert.deepEqual(summarize(groups, sel), { add: 0, label: 'Sapi · Regular', missing: [] })

const picked = { ...sel, 'v-isi': ['Campur'], 'v-top': ['Keju', 'Telur'], size: ['Jumbo'] }
assert.deepEqual(summarize(groups, picked), { add: 3000 + 4000 + 3000 + 8000, label: 'Campur · Keju · Telur · Jumbo', missing: [] })
assert.deepEqual(summarize(groups, { ...sel, 'v-isi': [] }).missing, ['Isi']) // required group left empty

assert.deepEqual(cleanVariants([{ id: 'a', name: '  Rasa ', required: false, multi: false, items: [{ n: ' Pedas ', add: '2000' }, { n: '  ', add: 5 }] }, { id: 'b', name: '', items: [{ n: 'x', add: 0 }] }, { id: 'c', name: 'Kosong', items: [] }]),
  [{ id: 'a', name: 'Rasa', required: false, multi: false, items: [{ n: 'Pedas', add: 2000 }] }])
console.log('variants ok')
