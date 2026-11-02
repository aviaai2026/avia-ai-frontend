import Link from 'next/link'
import {
  ArrowUpRight,
  CalendarClock,
  ContactRound,
  Home,
  UserRoundCheck,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { getLeads } from '@/lib/api/leads'
import { getProperties } from '@/lib/api/properties'
import { getAppointments } from '@/lib/api/appointments-client'
import type { Lead, Property } from '@/lib/types'
import type { Appointment } from '@/lib/mock/appointments'

type OverviewMetrics = {
  totalLeads: number | null
  qualifiedLeads: number | null
  activeListings: number | null
  upcomingAppointments: number | null
}
// Returns only leads that are still active sales opportunities.
function getActiveLeads(leads: Lead[]): Lead[] {
  const activeStatuses = [
    'new',
    'contacted',
    'qualified',
    'viewing',
    'negotiating',
  ]

  return leads.filter((lead) =>
    activeStatuses.includes(lead.status),
  )
}
// Calculates the number of leads currently in the qualified stage.
function countQualifiedLeads(leads: Lead[]) {
  return leads.filter((lead) => lead.status === 'qualified').length
}

// Calculates the number of properties that are actively available or reserved.
function countActiveListings(properties: Property[]) {
  return properties.filter(
    (property) =>
      property.status === 'available' ||
      property.status === 'reserved',
  ).length
}

// Calculates the number of future appointments that are still active.
function countUpcomingAppointments(appointments: Appointment[]) {
  const now = new Date()

  return appointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.scheduledAt)

    return (
      appointmentDate > now &&
      appointment.status !== 'cancelled' &&
      appointment.status !== 'completed'
    )
  }).length
}

// Loads each KPI independently so one failed API request does not hide other metrics.
async function getOverviewMetrics(): Promise<OverviewMetrics> {
  const [leadsResult, propertiesResult, appointmentsResult] =
    await Promise.allSettled([
      getLeads(),
      getProperties(),
      getAppointments(),
    ])

  if (leadsResult.status === 'rejected') {
    console.error('[AVIAAI overview] Failed to load lead metrics.')
  }

  if (propertiesResult.status === 'rejected') {
    console.error('[AVIAAI overview] Failed to load property metrics.')
  }

  if (appointmentsResult.status === 'rejected') {
    console.error('[AVIAAI overview] Failed to load appointment metrics.')
  }

  const activeLeads =
    leadsResult.status === 'fulfilled'
      ? getActiveLeads(leadsResult.value)
      : null

  return {
    totalLeads: activeLeads?.length ?? null,
    qualifiedLeads:
      activeLeads === null ? null : countQualifiedLeads(activeLeads),
    activeListings:
      propertiesResult.status === 'fulfilled'
        ? countActiveListings(propertiesResult.value)
        : null,
    upcomingAppointments:
      appointmentsResult.status === 'fulfilled'
        ? countUpcomingAppointments(appointmentsResult.value)
        : null,
  }
}
export async function OverviewKpiCards() {
  const metrics = await getOverviewMetrics()

  const overviewMetrics = [
    {
      label: 'Total Active Leads',
      value: metrics.totalLeads,
      description: 'Open opportunities in your pipeline',
      icon: ContactRound,
      href: '/leads',
    },
    {
      label: 'Qualified Leads',
      value: metrics.qualifiedLeads,
      description: 'Ready for next action',
      icon: UserRoundCheck,
      href: '/leads',
    },
    {
      label: 'Active Listings',
      value: metrics.activeListings,
      description: 'Available or reserved',
      icon: Home,
      href: '/properties',
    },
    {
      label: 'Upcoming Appointments',
      value: metrics.upcomingAppointments,
      description: 'Scheduled ahead',
      icon: CalendarClock,
      href: '/appointments',
    },
  ]

  return (
    <section aria-label="Business overview metrics">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewMetrics.map((metric) => {
          const Icon = metric.icon

          return (
            <Link
              key={metric.label}
              href={metric.href}
              className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label={`View ${metric.label}`}
            >
              <Card className="h-full transition-colors group-hover:border-primary/30 group-focus-visible:border-primary/40">
                <CardContent className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-col gap-2">
                    <span className="text-sm text-muted-foreground">
                      {metric.label}
                    </span>

                    <span className="text-2xl font-semibold tracking-tight text-foreground">
                    {metric.value ?? '—'}
                    </span>

                    <span className="text-xs text-muted-foreground">
                      {metric.description}
                    </span>
                  </div>

                  <span
                    aria-hidden="true"
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 transition-colors group-hover:bg-primary/15"
                  >
                    <Icon className="size-4" />
                  </span>

                  <ArrowUpRight
                    aria-hidden="true"
                    className="absolute sr-only"
                  />
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </section>
  )
}