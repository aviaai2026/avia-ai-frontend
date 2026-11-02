import {
  Activity,
  Bot,
  CheckCircle2,
  Clock3,
  MessageCircle as MessageIcon,
  Search as SearchIcon,
  Users,
} from 'lucide-react'

import { getLeads } from '@/lib/api/leads'
import type { LeadStatus } from '@/lib/types'

type Metric = {
  label: string
  value: string
  icon: typeof Users
}

type PipelineStage = {
  label: string
  count: number
  percentage: number
}

type LeadSource = {
  label: string
  count: number
  percentage: number
}

type EmployeeActivity = {
  label: string
  icon: typeof Bot
}

type RecentActivity = {
  title: string
  description: string
  time: string
  icon: typeof Activity
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

const sourceLabels: Record<string, string> = {
  whatsapp: 'WhatsApp',
  website: 'Website',
  instagram: 'Instagram',
  referral: 'Referral',
  manual: 'Manual',
}

// Formats a number with thousands separators for analytics values.
function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

// Calculates the percentage of qualified leads in the current lead dataset.
function getQualificationRate(
  totalLeads: number,
  qualifiedLeads: number,
) {
  if (totalLeads === 0) {
    return 0
  }

  return (qualifiedLeads / totalLeads) * 100
}

// Counts leads grouped by their current pipeline status.
function getPipelineStages(
  leads: Awaited<ReturnType<typeof getLeads>>,
): PipelineStage[] {
  const activeLeads = leads.filter(
    (lead) => lead.status !== 'archived',
  )

  const counts = activeLeads.reduce<Record<string, number>>(
    (result, lead) => {
      result[lead.status] =
        (result[lead.status] ?? 0) + 1

      return result
    },
    {},
  )

  const maxCount = Math.max(
    ...activeLeads.map((lead) => counts[lead.status] ?? 0),
    1,
  )

  const stages: LeadStatus[] = [
    'new',
    'contacted',
    'qualified',
    'viewing',
    'negotiating',
  ]

  return stages.map((status) => ({
    label: statusLabels[status],
    count: counts[status] ?? 0,
    percentage:
      ((counts[status] ?? 0) / maxCount) * 100,
  }))
}

// Counts lead sources represented in the current workspace data.
function getLeadSources(
  leads: Awaited<ReturnType<typeof getLeads>>,
): LeadSource[] {
  const activeLeads = leads.filter(
    (lead) => lead.status !== 'archived',
  )

  const counts = activeLeads.reduce<Record<string, number>>(
    (result, lead) => {
      result[lead.source] =
        (result[lead.source] ?? 0) + 1

      return result
    },
    {},
  )

  const totalLeads = activeLeads.length

  return Object.entries(counts)
    .map(([source, count]) => ({
      label: sourceLabels[source] ?? source,
      count,
      percentage:
        totalLeads === 0
          ? 0
          : (count / totalLeads) * 100,
    }))
    .sort((a, b) => b.count - a.count)
}

// Builds lead metrics from the authenticated workspace's lead records.
function getAnalyticsMetrics(
  leads: Awaited<ReturnType<typeof getLeads>>,
): Metric[] {
  const activeLeads = leads.filter(
    (lead) => lead.status !== 'archived',
  )

  const qualifiedLeads = activeLeads.filter(
    (lead) => lead.status === 'qualified',
  ).length

  const qualificationRate = getQualificationRate(
    activeLeads.length,
    qualifiedLeads,
  )

  return [
    {
      label: 'Total Leads',
      value: formatNumber(activeLeads.length),
      icon: Users,
    },
    {
      label: 'Qualified Leads',
      value: formatNumber(qualifiedLeads),
      icon: CheckCircle2,
    },
    {
      label: 'Qualification Rate',
      value: `${qualificationRate.toFixed(1)}%`,
      icon: CheckCircle2,
    },
    {
      label: 'Active Conversations',
      value: 'Not connected',
      icon: MessageIcon,
    },
  ]
}

// Lists activity categories without inventing execution totals.
function getEmployeeActivities(): EmployeeActivity[] {
  return [
    { label: 'Lead qualification', icon: CheckCircle2 },
    { label: 'Property searches', icon: SearchIcon },
    { label: 'Customer messages', icon: MessageIcon },
    { label: 'Lead updates', icon: Activity },
    { label: 'Human escalations', icon: Users },
  ]
}

// Returns no fabricated activity while verified execution records are unavailable.
function getRecentActivities(): RecentActivity[] {
  return []
}

export async function AnalyticsContent() {
  const leads = await getLeads()
  const metrics = getAnalyticsMetrics(leads)
  const employeeActivities = getEmployeeActivities()
  const recentActivities = getRecentActivities()
  const pipelineStages = getPipelineStages(leads)
  const leadSources = getLeadSources(leads)

  return (
    <div className="space-y-8">
      <div className="max-w-3xl">
        <p className="text-sm font-medium text-primary">
          AVIA Analytics
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Understand what is happening across your operations.
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
          Monitor lead performance and pipeline distribution. Conversation
          metrics and AI Employee activity will become available when their
          verified data sources are connected.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          const isConnected = metric.value !== 'Not connected'

          return (
            <div
              key={metric.label}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-background/50 text-primary">
                  <Icon className="size-5" />
                </div>

                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    isConnected
                      ? 'bg-primary/10 text-primary'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {isConnected ? 'Current' : 'Unavailable'}
                </span>
              </div>

              <p className="mt-5 text-sm text-muted-foreground">
                {metric.label}
              </p>

              <p
                className={`mt-1 font-semibold tracking-tight text-foreground ${
                  isConnected ? 'text-2xl' : 'text-lg'
                }`}
              >
                {metric.value}
              </p>
            </div>
          )
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Lead Pipeline
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Current distribution of opportunities across the sales process.
            </p>
          </div>

          <div className="mt-6 space-y-5">
            {pipelineStages.map((stage) => (
              <div key={stage.label}>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="font-medium text-foreground">
                    {stage.label}
                  </span>
                  <span className="text-muted-foreground">
                    {formatNumber(stage.count)}
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${stage.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Lead Sources
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Where current opportunities are coming from.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {leadSources.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No active lead sources to display yet.
              </p>
            ) : (
              leadSources.map((source) => (
                <div
                  key={source.label}
                  className="flex items-center gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-foreground">
                        {source.label}
                      </span>
                      <span className="text-muted-foreground">
                        {source.count}
                      </span>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary/80"
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                  </div>

                  <span className="w-10 text-right text-xs text-muted-foreground">
                    {source.percentage.toFixed(0)}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-background/50 text-primary">
              <Bot className="size-5" />
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground">
                AI Employee Activity
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Activity totals will appear when verified execution logs are connected.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {employeeActivities.map((activity) => {
              const Icon = activity.icon

              return (
                <div
                  key={activity.label}
                  className="flex items-center gap-3 rounded-xl border border-border bg-background/30 px-3 py-3"
                >
                  <div className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary">
                    <Icon className="size-4" />
                  </div>

                  <span className="min-w-0 flex-1 text-sm text-foreground">
                    {activity.label}
                  </span>

                  <span className="text-sm font-semibold text-muted-foreground">
                    Not recorded
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-background/50 text-primary">
              <Clock3 className="size-5" />
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground">
                Recent Operational Activity
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Verified actions across the AVIA workspace.
              </p>
            </div>
          </div>

          <div className="mt-6">
            {recentActivities.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
                <p className="text-sm font-medium text-foreground">
                  No recorded activity yet
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Completed AI Employee actions will appear here after execution logging is connected.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon

                  return (
                    <div
                      key={`${activity.title}-${activity.time}`}
                      className="flex gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                        <Icon className="size-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-medium text-foreground">
                            {activity.title}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {activity.time}
                          </span>
                        </div>

                        <p className="mt-1 text-sm leading-5 text-muted-foreground">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}