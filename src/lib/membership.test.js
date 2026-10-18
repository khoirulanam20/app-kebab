import assert from 'node:assert/strict'
import { earnFor, levelOf, nextLevel, redeemMax, usableVouchers, voucherDiscount } from './membership.js'

const config = {
  points: { earnPerRp: 10000, earnPts: 1, redeemPts: 100, redeemValue: 5000, minSubtotal: 10000 },
  levels: [{ name: 'Silver', min: 0, mult: 1 }, { name: 'Gold', min: 1000, mult: 1.5 }, { name: 'Platinum', min: 3000, mult: 2 }],
}
assert.equal(levelOf(config.levels, 948).name, 'Silver')
assert.equal(levelOf(config.levels, 1000).name, 'Gold')
assert.equal(levelOf(config.levels, 99999).name, 'Platinum')
assert.deepEqual(nextLevel(config.levels, 948), { name: 'Gold', min: 1000, mult: 1.5, toGo: 52 })
assert.equal(nextLevel(config.levels, 5000), null)
assert.equal(earnFor(50000, config, 0), 5) // Silver 1x
assert.equal(earnFor(50000, config, 1500), 7) // Gold 1.5x -> floor(7.5)
assert.equal(earnFor(9999, config, 0), 0)
assert.equal(redeemMax(948, config, 36000), 7) // limited by payable (36000/5000)
assert.equal(redeemMax(250, config, 100000), 2) // limited by points
assert.equal(redeemMax(948, config, 9000), 0) // below minimum spend
assert.equal(voucherDiscount(50000, { type: 'pct', value: 10, min: 20000 }), 5000)
assert.equal(voucherDiscount(10000, { type: 'pct', value: 10, min: 20000 }), 0)
const vs = [{ code: 'A', active: true, used: 1, quota: 5, until: '2026-12-31' }, { code: 'B', active: true, used: 5, quota: 5, until: '2026-12-31' }, { code: 'C', active: true, used: 0, quota: 5, until: '2020-01-01' }, { code: 'D', active: false, used: 0, quota: 5, until: '2026-12-31' }]
assert.deepEqual(usableVouchers(vs, ['A', 'B', 'C', 'D'], '2026-10-18').map((v) => v.code), ['A'])
console.log('membership ok')
