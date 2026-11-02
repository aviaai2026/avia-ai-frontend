import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Lead, LeadStatus } from '@/lib/types'
import { getLeads } from '@/lib/api/leads'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

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

// Formats the lead's intent and location into concise display text.
function getLeadSummary(lead: Lead): string {
  const intent =
    lead.intent.charAt(0).toUpperCase() + lead.intent.slice(1)

  return lead.location
    ? `${intent} · ${lead.location}`
    : intent
}

// Returns the human-readable label for a lead's status.
function getStatusLabel(status: LeadStatus): string {
  return statusLabels[status]
}

// Renders the shared Recent Leads card header and its working navigation.
function RecentLeadsHeader() {
  return (
    <CardHeader className="flex flex-row items-center justify-between gap-4">
      <CardTitle>Recent Leads</CardTitle>

      <Link
        href="/leads"
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        View all
        <ArrowRight className="size-3.5" aria-hidden="true" />
      </Link>
    </CardHeader>
  )
}

// Loads and displays recent leads, distinguishing API failures from empty results.
export async function RecentLeads() {
  let leads: Lead[]

  try {
    leads = await getLeads()
  } catch (error) {
    console.error(
      '[AVIAAI overview] Failed to load recent leads.',
      error,
    )

    return (
      <Card>
        <RecentLeadsHeader />

        <CardContent>
          <p className="py-4 text-sm text-muted-foreground" role="status">
            We couldn’t load recent leads. Please try again later.
          </p>
        </CardContent>
      </Card>
    )
  }

  const recentLeads = leads
    .filter((lead) => lead.status !== 'archived')
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() -
        new Date(a.updatedAt).getTime(),
    )
    .slice(0, 3)

  return (
    <Card>
      <RecentLeadsHeader />

      <CardContent>
        {recentLeads.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">
            No leads yet. Add your first lead to get started.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {recentLeads.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {lead.name}
                  </p>

                  <p className="truncate text-xs text-muted-foreground">
                    {getLeadSummary(lead)}
                  </p>
                </div>

                <Badge
                  variant={statusVariants[lead.status]}
                  className="shrink-0"
                >
                  {getStatusLabel(lead.status)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}