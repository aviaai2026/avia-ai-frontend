'use client'

import { useEffect, useState } from 'react'
import { archiveLead, restoreLead } from '@/lib/api/leads-client'

import type {
  Lead,
  LeadActivity,
  PropertyCurrency,
} from '@/lib/types'
import { AddLeadButton } from './add-lead-button'
import { EditLeadDialog } from './edit-lead-dialog'
import { LeadDetailsDialog } from './lead-details-dialog'
import { LeadSearch } from './lead-search'

type LeadsContentProps = {
  initialLeads: Lead[]
  defaultCurrency: PropertyCurrency
}

// Creates the initial activity history for the existing leads.
function createInitialActivities(
  leads: Lead[],
): LeadActivity[] {
  return leads.flatMap((lead) => {
    const activities: LeadActivity[] = [
      {
        id: `activity_created_${lead.id}`,
        leadId: lead.id,
        type: 'created',
        description: `Lead created from ${lead.source}.`,
        createdAt: lead.createdAt,
        actor: 'system',
      },
    ]

    if (lead.updatedAt !== lead.createdAt) {
      activities.push({
        id: `activity_updated_${lead.id}`,
        leadId: lead.id,
        type: 'updated',
        description: 'Lead information was updated.',
        createdAt: lead.updatedAt,
        actor: 'user',
      })
    }

    return activities
  })
}

export function LeadsContent({
  initialLeads,
  defaultCurrency,
}: LeadsContentProps) {

  const [leads, setLeads] =
    useState<Lead[]>(initialLeads)

  const [activities, setActivities] =
    useState<LeadActivity[]>(
      () => createInitialActivities(initialLeads),
    )

  const [editingLead, setEditingLead] =
    useState<Lead | null>(null)

  const [viewingLead, setViewingLead] =
    useState<Lead | null>(null)
      // Opens a lead selected by a notification URL parameter.
  useEffect(() => {
    const url = new URL(window.location.href)
    const leadId = url.searchParams.get('leadId')

    if (!leadId) return

    const matchingLead = leads.find(
      (lead) => lead.id === leadId,
    )

    if (matchingLead) {
      setViewingLead(matchingLead)
    }

    url.searchParams.delete('leadId')
    window.history.replaceState(
      null,
      '',
      `${url.pathname}${url.search}${url.hash}`,
    )
  }, [leads])

  const [leadView, setLeadView] =
  useState<'active' | 'won' | 'archived'>('active')

  const [actionLeadId, setActionLeadId] =
    useState<string | null>(null)

  const [actionError, setActionError] =
    useState<string | null>(null)

  // Creates a new lead and records its creation in the activity history.
  function handleLeadCreated(newLead: Lead) {
    setLeads((currentLeads) => [
      newLead,
      ...currentLeads,
    ])

    setActivities((currentActivities) => [
      {
        id: `activity_created_${newLead.id}`,
        leadId: newLead.id,
        type: 'created',
        description: `Lead created from ${newLead.source}.`,
        createdAt: newLead.createdAt,
        actor: 'user',
      },
      ...currentActivities,
    ])
  }

  // Archives a lead through the backend and updates the UI after success.
  async function handleLeadArchived(
    leadId: string,
  ) {
    setActionError(null)
    setActionLeadId(leadId)

    try {
      const archivedLead = await archiveLead(leadId)

      setLeads((currentLeads) =>
        currentLeads.map((lead) =>
          lead.id === leadId
            ? archivedLead
            : lead,
        ),
      )

      setActivities((currentActivities) => [
        {
          id: `activity_archived_${leadId}_${Date.now()}`,
          leadId,
          type: 'archived',
          description: 'Lead was archived.',
          createdAt: archivedLead.updatedAt,
          actor: 'user',
        },
        ...currentActivities,
      ])

      setViewingLead(null)
    } catch (error) {
      console.error(
        '[AVIAAI leads] Failed to archive lead:',
        error,
      )

      setActionError(
        'We could not archive this lead. Please try again.',
      )
    } finally {
      setActionLeadId(null)
    }
  }

  // Restores an archived lead through the backend and updates the UI after success.
  async function handleLeadRestored(
    leadId: string,
  ) {
    setActionError(null)
    setActionLeadId(leadId)

    try {
      const restoredLead = await restoreLead(leadId)

      setLeads((currentLeads) =>
        currentLeads.map((lead) =>
          lead.id === leadId
            ? restoredLead
            : lead,
        ),
      )

      setActivities((currentActivities) => [
        {
          id: `activity_restored_${leadId}_${Date.now()}`,
          leadId,
          type: 'restored',
          description:
            'Lead was restored to active leads.',
          createdAt: restoredLead.updatedAt,
          actor: 'user',
        },
        ...currentActivities,
      ])
    } catch (error) {
      console.error(
        '[AVIAAI leads] Failed to restore lead:',
        error,
      )

      setActionError(
        'We could not restore this lead. Please try again.',
      )
    } finally {
      setActionLeadId(null)
    }
  }

  // Updates the selected lead and records the change in the local activity history.
  function handleLeadUpdated(
    updatedLead: Lead,
  ) {
    const previousLead = leads.find(
      (lead) => lead.id === updatedLead.id,
    )

    setLeads((currentLeads) =>
      currentLeads.map((lead) =>
        lead.id === updatedLead.id
          ? updatedLead
          : lead,
      ),
    )

    setActivities((currentActivities) => {
      const newActivities: LeadActivity[] = [
        {
          id: `activity_updated_${updatedLead.id}_${Date.now()}`,
          leadId: updatedLead.id,
          type: 'updated',
          description:
            'Lead information was updated.',
          createdAt: updatedLead.updatedAt,
          actor: 'user',
        },
      ]

      if (
        previousLead &&
        previousLead.status !== updatedLead.status
      ) {
        newActivities.unshift({
          id: `activity_status_${updatedLead.id}_${Date.now()}`,
          leadId: updatedLead.id,
          type: 'status_changed',
          description: `Status changed from ${previousLead.status} to ${updatedLead.status}.`,
          createdAt: updatedLead.updatedAt,
          actor: 'user',
          fromStatus: previousLead.status,
          toStatus: updatedLead.status,
          reason:
            'Lead status updated by team member.',
        })
      }

      return [
        ...newActivities,
        ...currentActivities,
      ]
    })

    setEditingLead(null)
  }


  const visibleLeads = leads.filter((lead) => {
    if (leadView === 'won') {
      return lead.status === 'won'
    }

    if (leadView === 'archived') {
      return lead.status === 'archived'
    }

    return (
      lead.status !== 'won' &&
      lead.status !== 'archived'
    )
  })

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
  <div className="inline-flex rounded-lg border border-border bg-muted/30 p-1">
    <button
      type="button"
      onClick={() => {
        setLeadView('active')
        setActionError(null)
      }}
      className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        leadView === 'active'
          ? 'bg-card text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      Active Leads
    </button>

    <button
      type="button"
      onClick={() => {
        setLeadView('won')
        setActionError(null)
      }}
      className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        leadView === 'won'
          ? 'bg-card text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      Won
    </button>

    <button
      type="button"
      onClick={() => {
        setLeadView('archived')
        setActionError(null)
      }}
      className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        leadView === 'archived'
          ? 'bg-card text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      Archived
    </button>
  </div>

  {leadView === 'active' && (
    <AddLeadButton
      onLeadCreated={handleLeadCreated}
      defaultCurrency={defaultCurrency}
    />
  )}
</div>
      {actionError && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {actionError}
        </div>
      )}

      <LeadSearch
        leads={visibleLeads}
        onEditLead={setEditingLead}
        onViewLead={setViewingLead}
        onRestoreLead={handleLeadRestored}
        showArchived={leadView === 'archived'}
        actionLeadId={actionLeadId}
        onArchiveLead={handleLeadArchived}
      />

<EditLeadDialog
  lead={editingLead}
  onClose={() => setEditingLead(null)}
  onLeadUpdated={handleLeadUpdated}
  defaultCurrency={defaultCurrency}
/>

      <LeadDetailsDialog
        lead={viewingLead}
        leads={leads}
        activities={activities.filter(
          (activity) =>
            activity.leadId === viewingLead?.id,
        )}
        onClose={() => setViewingLead(null)}
        onEditLead={setEditingLead}
        onArchiveLead={handleLeadArchived}

      />
    </>
  )
}