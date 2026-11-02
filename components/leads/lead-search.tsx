'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type {
  Lead,
  LeadIntent,
  LeadSource,
  LeadStatus,
} from '@/lib/types'
import { LeadTable } from './lead-table'

type LeadSearchProps = {
  leads: Lead[]
  onEditLead: (lead: Lead) => void
  onViewLead: (lead: Lead) => void
  onRestoreLead?: (leadId: string) => void
  onArchiveLead?: (leadId: string) => void
  actionLeadId?: string | null
  showArchived?: boolean
}

const statusOptions: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'viewing', label: 'Viewing' },
  { value: 'negotiating', label: 'Negotiating' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
]

const intentOptions: { value: LeadIntent; label: string }[] = [
  { value: 'buy', label: 'Buy' },
  { value: 'rent', label: 'Rent' },
  { value: 'sell', label: 'Sell' },
  { value: 'invest', label: 'Invest' },
]

const sourceOptions: { value: LeadSource; label: string }[] = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'manual', label: 'Manual' },
  { value: 'other', label: 'Other' },
]

// Filters leads using search text and the selected pipeline, intent, and source filters.
function filterLeads(
  leads: Lead[],
  searchTerm: string,
  status: LeadStatus | 'all',
  intent: LeadIntent | 'all',
  source: LeadSource | 'all',
) {
  const normalizedSearch = searchTerm.trim().toLowerCase()

  return leads.filter((lead) => {
    const matchesSearch =
      !normalizedSearch ||
      [lead.name, lead.location, lead.propertyType].some((value) =>
        value?.toLowerCase().includes(normalizedSearch),
      )

    const matchesStatus = status === 'all' || lead.status === status
    const matchesIntent = intent === 'all' || lead.intent === intent
    const matchesSource = source === 'all' || lead.source === source

    return matchesSearch && matchesStatus && matchesIntent && matchesSource
  })
}

export function LeadSearch({
  leads,
  onEditLead,
  onViewLead,
  onRestoreLead,
  onArchiveLead,
  actionLeadId = null,
  showArchived = false,
}: LeadSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [status, setStatus] = useState<LeadStatus | 'all'>('all')
  const [intent, setIntent] = useState<LeadIntent | 'all'>('all')
  const [source, setSource] = useState<LeadSource | 'all'>('all')

  const filteredLeads = useMemo(
    () => filterLeads(leads, searchTerm, status, intent, source),
    [leads, searchTerm, status, intent, source],
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 xl:flex-row">
        <div className="relative min-w-0 flex-1 xl:max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />

          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search leads..."
            aria-label="Search leads"
            className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:flex">
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as LeadStatus | 'all')
            }
            aria-label="Filter by status"
            className="h-10 rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All statuses</option>

            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={intent}
            onChange={(event) =>
              setIntent(event.target.value as LeadIntent | 'all')
            }
            aria-label="Filter by intent"
            className="h-10 rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All intents</option>

            {intentOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={source}
            onChange={(event) =>
              setSource(event.target.value as LeadSource | 'all')
            }
            aria-label="Filter by source"
            className="h-10 rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All sources</option>

            {sourceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <LeadTable
        leads={filteredLeads}
        onEditLead={onEditLead}
        onViewLead={onViewLead}
        onRestoreLead={onRestoreLead}
        onArchiveLead={onArchiveLead}
        actionLeadId={actionLeadId}
        showArchived={showArchived}
      />
    </div>
  )
}