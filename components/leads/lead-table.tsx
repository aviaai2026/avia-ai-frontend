
import {
  Archive,
  ArchiveRestore,
  Eye,
  Loader2,
  Pencil,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type {
  Lead,
  LeadStatus,
  PropertyCurrency,
} from '@/lib/types'

type LeadTableProps = {
  leads: Lead[]
  onEditLead: (lead: Lead) => void
  onViewLead: (lead: Lead) => void
  onRestoreLead?: (leadId: string) => void
  onArchiveLead?: (leadId: string) => void
  actionLeadId?: string | null
  showArchived?: boolean
}

const statusVariants: Record<
  LeadStatus,
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'ghost'
  | 'accent'
  | 'success'
  | 'warning'
  | 'info'
> = {
  new: 'info',
  contacted: 'accent',
  qualified: 'success',
  viewing: 'warning',
  negotiating: 'warning',
  won: 'success',
  lost: 'destructive',
  archived: 'secondary',
}

const statusLabels: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  viewing: 'Viewing',
  negotiating: 'Negotiating',
  won: 'Won',
  lost: 'Lost',
  archived: 'Archived',
}

const intentLabels = {
  buy: 'Buy',
  rent: 'Rent',
  sell: 'Sell',
  invest: 'Invest',
}

// Formats a lead budget using its recorded currency without guessing unknown currencies.
function formatBudget(
  budget?: number,
  currency?: PropertyCurrency | null,
) {
  if (budget === undefined || budget === null) {
    return '—'
  }

  if (!currency) {
    return new Intl.NumberFormat('en').format(budget)
  }

  const locale =
    currency === 'NGN'
      ? 'en-NG'
      : currency === 'AED'
        ? 'en-AE'
        : 'en-US'

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(budget)
}

// Formats an ISO date into a short date shown in the lead table.
function formatUpdatedAt(date: string) {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function LeadTable({
  leads,
  onEditLead,
  onViewLead,
  onRestoreLead,
  onArchiveLead,
  actionLeadId = null,
  showArchived = false,
}: LeadTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Leads</CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="border-y border-border bg-muted/40">
              <tr className="text-left text-xs font-medium text-muted-foreground">
                <th className="px-6 py-3">Lead</th>
                <th className="px-4 py-3">Intent</th>
                <th className="px-4 py-3">Property</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Budget</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {leads.length > 0 ? (
                leads.map((lead) => {
                  const isActioning = actionLeadId === lead.id

                  return (
                    <tr
                      key={lead.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-6 py-4">
                        <div className="min-w-0">
                          <p className="font-medium text-foreground">
                            {lead.name}
                          </p>

                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {lead.source}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-muted-foreground">
                        {intentLabels[lead.intent]}
                      </td>

                      <td className="px-4 py-4 text-muted-foreground">
                        {lead.propertyType ?? '—'}
                      </td>

                      <td className="px-4 py-4 text-muted-foreground">
                        {lead.location ?? '—'}
                      </td>

                      <td className="px-4 py-4 font-medium text-foreground">
                        {formatBudget(
                          lead.budget,
                          lead.budgetCurrency,
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <Badge variant={statusVariants[lead.status]}>
                          {statusLabels[lead.status]}
                        </Badge>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                        {formatUpdatedAt(lead.updatedAt)}
                      </td>

                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onViewLead(lead)}
                            disabled={isActioning}
                            aria-label={`View ${lead.name}`}
                            className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                          >
                            <Eye
                              className="size-4"
                              aria-hidden="true"
                            />
                            View
                          </button>

                          {showArchived ? (
                            <button
                              type="button"
                              onClick={() =>
                                onRestoreLead?.(lead.id)
                              }
                              disabled={isActioning}
                              aria-label={`Restore ${lead.name}`}
                              className="inline-flex h-9 items-center gap-2 rounded-lg border border-primary/40 px-3 text-sm font-medium text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                            >
                              {isActioning ? (
                                <Loader2
                                  className="size-4 animate-spin"
                                  aria-hidden="true"
                                />
                              ) : (
                                <ArchiveRestore
                                  className="size-4"
                                  aria-hidden="true"
                                />
                              )}
                              {isActioning
                                ? 'Restoring...'
                                : 'Restore'}
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => onEditLead(lead)}
                                disabled={isActioning}
                                aria-label={`Edit ${lead.name}`}
                                className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                              >
                                <Pencil
                                  className="size-4"
                                  aria-hidden="true"
                                />
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  onArchiveLead?.(lead.id)
                                }
                                disabled={
                                  isActioning ||
                                  !onArchiveLead
                                }
                                aria-label={`Archive ${lead.name}`}
                                className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                              >
                                {isActioning ? (
                                  <Loader2
                                    className="size-4 animate-spin"
                                    aria-hidden="true"
                                  />
                                ) : (
                                  <Archive
                                    className="size-4"
                                    aria-hidden="true"
                                  />
                                )}
                                {isActioning
                                  ? 'Archiving...'
                                  : 'Archive'}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center"
                  >
                    <p className="font-medium text-foreground">
                      No leads found
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Try adjusting your search or filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
