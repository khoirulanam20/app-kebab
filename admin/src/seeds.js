import * as m from './mock'

export const tenants = [
  { id: 'kebabnme', name: 'Kebab N Me', slug: 'kebabnme', plan: 'Lengkap + POS', limits: { outlets: 5, staff: 20, products: 200 }, logo: '/logo-mark.png', domain: 'kebabnme.resto.app' }
]

const common = () => ({
  optionGroups: structuredClone(m.optionGroups), members: structuredClone(m.members), missions: structuredClone(m.missionsSeed),
  perms: structuredClone(m.defaultPerms), backups: structuredClone(m.backups), reconciliation: structuredClone(m.reconciliation),
  settings: structuredClone(m.settingsSeed), faq: structuredClone(m.faqSeed), paymentMethods: structuredClone(m.paymentMethods),
})

const kebab = () => ({
  ...common(),
  categories: structuredClone(m.categories), products: structuredClone(m.products), outlets: structuredClone(m.outlets), ingredients: structuredClone(m.ingredients),
  recipes: structuredClone(m.recipes), movements: structuredClone(m.movements), vouchers: structuredClone(m.vouchers), banners: structuredClone(m.banners),
  flashSales: structuredClone(m.flashSales), broadcasts: structuredClone(m.broadcasts), customers: structuredClone(m.customers), reviews: structuredClone(m.reviews),
  orders: structuredClone(m.orders).map((o) => {
    // online pickup orders get a handover code; ready ones become ready a few minutes ago so the hold timer is meaningful
    if (o.source !== 'Online' || o.delivery) return o
    const code = String(1000 + ((Number(o.id.split('-')[1]) * 7919) % 9000))
    return { ...o, mode: 'pickup', pickupCode: code, readyAt: o.status === 'Siap' ? new Date(Date.now() - 5 * 60000).toISOString() : null }
  }), holds: structuredClone(m.holds), staff: structuredClone(m.staff), log: structuredClone(m.activityLog), pastShifts: structuredClone(m.pastShifts),
})

export const getSeed = () => kebab()

// Dummy login accounts for every tenant (password is shared in the prototype).
export const getAccounts = () => tenants.flatMap((tn) => { const seed = getSeed(tn.id); return seed.staff.map((s) => ({ ...s, tenantId: tn.id, tenantName: tn.name, branch: seed.outlets.find((o) => o.id === s.outletId)?.name.split('– ').pop() ?? null, password: m.DEMO_PASSWORD })) })
