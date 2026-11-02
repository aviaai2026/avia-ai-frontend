import Link from 'next/link'
import { ArrowRight, CalendarClock } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getAppointments } from '@/lib/api/appointments-client'
import type { Appointment } from '@/lib/mock/appointments'

// Returns future appointments that are still active, ordered by scheduled time.
function getUpcomingAppointments(appointments: Appointment[]) {
  const now = new Date()

  return appointments
    .filter((appointment) => {
      const appointmentDate = new Date(appointment.scheduledAt)

      return (
        appointmentDate > now &&
        appointment.status !== 'cancelled' &&
        appointment.status !== 'completed'
      )
    })
    .sort(
      (first, second) =>
        new Date(first.scheduledAt).getTime() -
        new Date(second.scheduledAt).getTime(),
    )
    .slice(0, 3)
}

// Formats an appointment time using the current server or browser locale.
function formatAppointmentTime(scheduledAt: string) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(scheduledAt))
}

// Formats the appointment day into a compact dashboard-friendly label.
function formatAppointmentDay(scheduledAt: string) {
  const appointmentDate = new Date(scheduledAt)
  const today = new Date()

  const isToday =
    appointmentDate.getFullYear() === today.getFullYear() &&
    appointmentDate.getMonth() === today.getMonth() &&
    appointmentDate.getDate() === today.getDate()

  if (isToday) {
    return 'Today'
  }

  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const isTomorrow =
    appointmentDate.getFullYear() === tomorrow.getFullYear() &&
    appointmentDate.getMonth() === tomorrow.getMonth() &&
    appointmentDate.getDate() === tomorrow.getDate()

  if (isTomorrow) {
    return 'Tomorrow'
  }

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(appointmentDate)
}

// Returns a readable appointment title for the Overview list.
function getAppointmentTitle(appointment: Appointment) {
  switch (appointment.type) {
    case 'property_viewing':
      return 'Property viewing'
    case 'consultation':
      return 'Consultation'
    case 'follow_up':
      return 'Follow-up'
    default:
      return 'Appointment'
  }
}

// Renders upcoming appointments and displays an honest error state if loading fails.
export async function UpcomingAppointments() {
  let appointments: Appointment[]

  // Load real appointments without allowing API failures to break the Overview.
  try {
    appointments = await getAppointments()
  } catch (error) {
    console.error(
      '[AVIAAI overview] Failed to load upcoming appointments.',
      error,
    )

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Upcoming Appointments</CardTitle>

          <Link
            href="/appointments"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </CardHeader>

        <CardContent>
          <div
            role="status"
            className="rounded-lg border border-dashed border-border px-4 py-6 text-center"
          >
            <p className="text-sm font-medium text-foreground">
              Unable to load appointments.
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Please try again later.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const upcomingAppointments = getUpcomingAppointments(appointments)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Upcoming Appointments</CardTitle>

        <Link
          href="/appointments"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View all
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </CardHeader>

      <CardContent>
        {upcomingAppointments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center">
            <p className="text-sm font-medium text-foreground">
              No upcoming appointments
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Scheduled appointments will appear here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {upcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center gap-3"
              >
                <span
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20"
                >
                  <CalendarClock className="size-4" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {getAppointmentTitle(appointment)}
                    </p>

                    <span className="text-xs font-medium text-muted-foreground">
                      {formatAppointmentTime(appointment.scheduledAt)}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {appointment.customerName} ·{' '}
                    {formatAppointmentDay(appointment.scheduledAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}