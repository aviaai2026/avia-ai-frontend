import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { Lead, LeadStatus } from '@/lib/types'
import { getLeads } from '@/lib/api/leads'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type ActiveLeadStatus = Exclude<LeadStatus, 'archived'>

type PipelineStage = {
  status: ActiveLeadStatus
  label: string
}

const pipelineStages: PipelineStage[] = [
  { status: 'new', label: 'New' },
  { status: 'contacted', label: 'Contacted' },
  { status: 'qualified', label: 'Qualified' },
  { status: 'viewing', label: 'Viewing' },
  { status: 'negotiating', label: 'Negotiating' },
  { status: 'won', label: 'Won' },
  { status: 'lost', label: 'Lost' },
]

// Counts non-archived leads by their current pipeline stage.
function countLeadsByStatus(
  leads: Lead[],
): Record<ActiveLeadStatus, number> {
  const counts: Record<ActiveLeadStatus, number> = {
    new: 0,
    contacted: 0,
    qualified: 0,
    viewing: 0,
    negotiating: 0,
    won: 0,
    lost: 0,
  }

  for (const lead of leads) {
    if (lead.status === 'archived') {
      continue
    }

    counts[lead.status] += 1
  }

  return counts
}

// Loads and displays real lead pipeline counts with a safe error state.
export async function LeadPipeline() {
  let leads: Lead[]

  try {
    leads = await getLeads()
  } catch (error) {
    console.error(
      '[AVIAAI overview] Failed to load lead pipeline.',
      error,
    )

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Lead Pipeline</CardTitle>

          <Link
            href="/leads"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View leads
            <ArrowRight
              className="size-3.5"
              aria-hidden="true"
            />
          </Link>
        </CardHeader>

        <CardContent>
          <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
            We couldn’t load your lead pipeline. Please try again later.
          </p>
        </CardContent>
      </Card>
    )
  }

  const counts = countLeadsByStatus(leads)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Lead Pipeline</CardTitle>

        <Link
          href="/leads"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View leads
          <ArrowRight
            className="size-3.5"
            aria-hidden="true"
          />
        </Link>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
          {pipelineStages.map((stage) => (
            <div
              key={stage.status}
              className="rounded-lg bg-muted/40 px-3 py-2"
            >
              <p className="truncate text-xs text-muted-foreground">
                {stage.label}
              </p>

              <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                {counts[stage.status]}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}