import { useState } from 'react'
import PageHeader from '@/components/common/PageHeader'
import ProductsTab from './menu/ProductsTab'
import CategoriesTab from './menu/CategoriesTab'
import OptionsTab from './menu/OptionsTab'
import BundlesTab from './menu/BundlesTab'

const TABS = [['products', 'Produk', ProductsTab], ['categories', 'Kategori', CategoriesTab], ['options', 'Opsi', OptionsTab], ['bundles', 'Paket & bundling', BundlesTab]]

export default function MenuPage() {
  const [tab, setTab] = useState('products')
  const Tab = TABS.find((t) => t[0] === tab)[2]
  return (
    <>
      <PageHeader title="Menu" description="Produk, kategori, opsi, dan paket yang tampil di kasir dan aplikasi pelanggan." />
      <div role="tablist" aria-label="Menu" className="no-scrollbar mb-4 flex gap-6 overflow-x-auto border-b border-border">
        {TABS.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`relative h-11 shrink-0 text-sm font-medium ${tab === k ? 'text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:rounded-t after:bg-primary' : 'text-muted-foreground'}`}>{l}</button>)}
      </div>
      <Tab />
    </>
  )
}
