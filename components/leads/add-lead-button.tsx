'use client'

import { useState } from 'react'
import type {
  Lead,
  PropertyCurrency,
} from '@/lib/types'
import { AddLeadDialog } from './add-lead-dialog'

type AddLeadButtonProps = {
  onLeadCreated: (lead: Lead) => void
  defaultCurrency: PropertyCurrency
}

export function AddLeadButton({
  onLeadCreated,
  defaultCurrency,
}: AddLeadButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  function handleLeadCreated(newLead: Lead) {
    onLeadCreated(newLead)
    setIsOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        + Add Lead
      </button>

      <AddLeadDialog
  open={isOpen}
  onClose={() => setIsOpen(false)}
  onLeadCreated={handleLeadCreated}
  defaultCurrency={defaultCurrency}
/>
    </>
  )
}