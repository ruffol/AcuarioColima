'use client'

import { useState } from 'react'
import AcuarioProductMgr from '@/components/admin/AcuarioProductMgr'
import AcuarioCategoryMgr from '@/components/admin/AcuarioCategoryMgr'
import AcuarioBlogMgr from '@/components/admin/AcuarioBlogMgr'
import AcuarioKitMgr from '@/components/admin/AcuarioKitMgr'

type Tab = 'products' | 'categories' | 'blog' | 'kits'

const TABS: { key: Tab; label: string }[] = [
  { key: 'products', label: 'Productos' },
  { key: 'categories', label: 'Categorías' },
  { key: 'blog', label: 'Blog' },
  { key: 'kits', label: 'Kits' },
]

export default function AcuarioAdminPage() {
  const [tab, setTab] = useState<Tab>('products')

  return (
    <div>
      <div className="flex gap-2 mb-8 border-b border-arena pb-4 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.key
                ? 'bg-terracota text-white'
                : 'bg-arena text-muted hover:bg-arena/80'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'products' && <AcuarioProductMgr />}
      {tab === 'categories' && <AcuarioCategoryMgr />}
      {tab === 'blog' && <AcuarioBlogMgr />}
      {tab === 'kits' && <AcuarioKitMgr />}
    </div>
  )
}
