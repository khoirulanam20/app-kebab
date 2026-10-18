import assert from 'node:assert/strict'
import { cartTotals, settle, voucherDiscount } from './pricing.js'

const lines = [{ unit: 18000, qty: 2 }, { unit: 6000, qty: 1 }] // subtotal 42000
const pct = { type: 'pct', value: 10, min: 20000 }
const flat = { type: 'flat', value: 5000, min: 30000 }
assert.equal(cartTotals(lines).total, 42000)
assert.equal(cartTotals(lines, pct).total, 37800)
assert.equal(cartTotals(lines, flat).discount, 5000)
assert.equal(voucherDiscount(10000, pct), 0) // below minimum spend
assert.equal(cartTotals([{ unit: 3000, qty: 1 }], { type: 'flat', value: 5000, min: 0 }).total, 0) // never negative
assert.equal(cartTotals(lines, null, {}, 2000).total, 40000) // manual discount
assert.deepEqual(cartTotals(lines, null, { serviceFeePct: 5, taxPct: 10 }), { subtotal: 42000, discount: 0, service: 2100, tax: 4410, total: 48510 })

assert.deepEqual(cartTotals(lines, null, { taxPct: 10, taxIncluded: true }), { subtotal: 42000, discount: 0, service: 0, tax: 3818, total: 42000 }) // tax included in price

assert.equal(settle(42000, { cash: 50000 }).change, 8000)
assert.equal(settle(42000, { cash: 20000, qris: 22000 }).ok, true)
assert.equal(settle(42000, { cash: 20000 }).remaining, 22000)
assert.equal(settle(42000, { qris: 50000 }).ok, false)
assert.equal(settle(42000, { cash: 10000, card: 40000 }).change, 8000)
assert.equal(settle(0, {}).ok, false)
console.log('pricing ok')
