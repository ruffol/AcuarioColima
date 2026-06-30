'use client'

import { useState } from 'react'
import ModelManager from '@/components/admin/ModelManager'
import TypeManager from '@/components/admin/TypeManager'
import ColorManager from '@/components/admin/ColorManager'
import AvailabilityManager from '@/components/admin/AvailabilityManager'

type Tab = 'models' | 'types' | 'colors' | 'availability'

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('models')

  return (
    <div>
      <div className="flex gap-2 mb-8 border-b border-arena pb-4 overflow-x-auto">
        {(['models', 'types', 'colors', 'availability'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t
                ? 'bg-terracota text-white'
                : 'bg-arena text-muted hover:bg-arena/80'
            }`}
          >
            {t === 'models' ? 'Productos' : t === 'types' ? 'Tipos' : t === 'colors' ? 'Colores' : 'Stock'}
          </button>
        ))}
      </div>

      {tab === 'models' && <ModelManager />}
      {tab === 'types' && <TypeManager />}
      {tab === 'colors' && <ColorManager />}
      {tab === 'availability' && <AvailabilityManager />}
    </div>
  )
}
