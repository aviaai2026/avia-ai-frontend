
import Image from 'next/image'
import { ArrowUpRight, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { getLeads } from '@/lib/api/leads'
import type { Lead } from '@/lib/types'

// Calculates the qualification rate using active sales opportunities only.
function getQualificationRate(leads: Lead[]): number {
  const activeStatuses = [
    'new',
    'contacted',
    'qualified',
    'viewing',
    'negotiating',
  ]

  const activeLeads = leads.filter((lead) =>
    activeStatuses.includes(lead.status),
  )

  if (activeLeads.length === 0) {
    return 0
  }

  const qualifiedLeads = activeLeads.filter(
    (lead) => lead.status === 'qualified',
  ).length

  return (qualifiedLeads / activeLeads.length) * 100
}

export async function LeadAnalytics() {
  let leads: Lead[]

  // Loads real leads and handles backend failures without displaying a false metric.
  try {
    leads = await getLeads()
  } catch (error) {
    console.error(
      '[AVIAAI overview] Failed to load lead analytics.',
      error,
    )

    return (
      <Card className="relative min-h-44 overflow-hidden">
        <div className="flex min-h-44 flex-col justify-between gap-4 p-5">
          <div>
            <p className="text-sm font-medium text-foreground">
              Lead Analytics
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Current pipeline performance
            </p>
          </div>

          <div className="flex items-end justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Unable to load qualification rate.
            </p>

            <Link
              href="/analytics"
              className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              View analytics
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Card>
    )
  }

  const qualificationRate = getQualificationRate(leads)

  return (
    <Card className="relative min-h-44 overflow-hidden">
      <Image
        src="/avia-analytic-image.jpg"
        alt=""
        fill
        className="object-cover object-right"
        aria-hidden="true"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20"
      />

      <div className="relative flex h-full min-h-44 flex-col justify-between p-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
              <TrendingUp className="size-4" aria-hidden="true" />
            </span>

            <div>
              <p className="text-sm font-medium text-foreground">
                Lead Analytics
              </p>

              <p className="text-xs text-muted-foreground">
                Current pipeline performance
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-2xl font-semibold tracking-tight text-foreground">
              {qualificationRate.toFixed(1)}%
            </p>

            <p className="text-xs text-muted-foreground">
              Qualification rate
            </p>
          </div>

          <Link
            href="/analytics"
            className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            View analytics
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </Card>
  )
}
