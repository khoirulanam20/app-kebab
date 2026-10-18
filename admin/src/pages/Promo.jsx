import { useState } from 'react'
import PageHeader from '@/components/common/PageHeader'
import VoucherTab from './promo/VoucherTab'
import BannerTab from './promo/BannerTab'
import FlashTab from './promo/FlashTab'
import { PointsTab, LevelsTab, ReferralTab, MissionsTab, BroadcastTab } from './promo/LoyaltyTabs'

const TABS = [['voucher', 'Voucher', VoucherTab], ['banner', 'Banner & popup', BannerTab], ['flash', 'Flash sale', FlashTab], ['points', 'Aturan poin', PointsTab], ['levels', 'Level member', LevelsTab], ['referral', 'Referral', ReferralTab], ['missions', 'Misi & stempel', MissionsTab], ['broadcast', 'Push & WhatsApp', BroadcastTab]]

export default function Promo() {
  const [tab, setTab] = useState('voucher')
  const Tab = TABS.find((t) => t[0] === tab)[2]
  return (
    <>
      <PageHeader title="Promo & loyalitas" description="Voucher, banner, flash sale, poin, level member, referral, dan pesan massal." />
      <div role="tablist" aria-label="Promo" className="no-scrollbar mb-4 flex gap-6 overflow-x-auto border-b border-border">
        {TABS.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`relative h-11 shrink-0 text-sm font-medium ${tab === k ? 'text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:rounded-t after:bg-primary' : 'text-muted-foreground'}`}>{l}</button>)}
      </div>
      <Tab />
    </>
  )
}
