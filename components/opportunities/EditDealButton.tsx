'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { EditDealModal } from './EditDealModal'
import type { Opportunity, Profile, Sector } from '@/types'

interface EditDealButtonProps {
  opportunity: Opportunity
  profiles: Profile[]
  sectors: Sector[]
  currentUserRole: string
}

export function EditDealButton({ opportunity, profiles, sectors, currentUserRole }: EditDealButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 border border-slate-200 text-gray-600 hover:text-gray-900 hover:bg-slate-100 text-sm font-medium px-3 py-2 rounded-lg transition-colors"
      >
        <Pencil size={13} />
        Edit Deal
      </button>

      {open && (
        <EditDealModal
          opportunity={opportunity}
          profiles={profiles}
          sectors={sectors}
          currentUserRole={currentUserRole}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
