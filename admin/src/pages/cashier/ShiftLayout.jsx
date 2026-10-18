import SectionTabs from '@/components/common/SectionTabs'

export default function ShiftLayout() {
  return <SectionTabs title="Shift Kasir" description="Laci kasir, penjualan hari ini, dan riwayat shift." tabs={[{ to: '/cashier/drawer', label: 'Laci kasir' }, { to: '/cashier/today', label: 'Penjualan hari ini' }, { to: '/cashier/history', label: 'Riwayat shift' }]} />
}
