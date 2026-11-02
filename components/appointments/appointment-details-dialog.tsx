'use client'

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  UserRound,
  X,
} from 'lucide-react'
import type {
  Appointment,
  AppointmentStatus,
  AppointmentType,
} from '@/lib/mock/appointments'
import { Button } from '@/components/ui/button'

type AppointmentDetailsDialogProps = {
  appointment: Appointment | null
  onClose: () => void
  onEdit: (appointment: Appointment) => void
  onCancel: (appointment: Appointment) => void
  onComplete: (appointment: Appointment) => void
  onReopen: (appointment: Appointment) => void
}

// Returns a readable label for an appointment status.
function getStatusLabel(status: AppointmentStatus) {
  switch (status) {
    case 'scheduled':
      return 'Scheduled'
    case 'confirmed':
      return 'Confirmed'
    case 'completed':
      return 'Completed'
    case 'cancelled':
      return 'Cancelled'
  }
}

// Returns the visual treatment used for each appointment status.
function getStatusStyles(status: AppointmentStatus) {
  switch (status) {
    case 'scheduled':
      return 'bg-primary/10 text-primary'
    case 'confirmed':
      return 'bg-success/10 text-success'
    case 'completed':
      return 'bg-secondary text-secondary-foreground'
    case 'cancelled':
      return 'bg-destructive/10 text-destructive'
  }
}

// Returns a readable label for an appointment type.
function getAppointmentTypeLabel(type: AppointmentType) {
  switch (type) {
    case 'property_viewing':
      return 'Property Viewing'
    case 'consultation':
      return 'Consultation'
    case 'follow_up':
      return 'Follow-up'
    case 'other':
      return 'Other'
  }
}

// Formats an appointment date and time for the AVIA interface.
function formatAppointmentDate(date: string) {
  return new Intl.DateTimeFormat('en-NG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date))
}

// Formats an appointment duration into a readable label.
function formatDuration(minutes: number) {
  if (minutes < 60) {
    return `${minutes} minutes`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours} hour${hours === 1 ? '' : 's'}`
  }

  return `${hours} hour${hours === 1 ? '' : 's'} ${remainingMinutes} minutes`
}

export function AppointmentDetailsDialog({
  appointment,
  onClose,
  onEdit,
  onCancel,
  onComplete,
  onReopen,
}: AppointmentDetailsDialogProps) {
  if (!appointment) {
    return null
  }

  const canComplete =
    appointment.status === 'scheduled' ||
    appointment.status === 'confirmed'

  const canCancel =
    appointment.status === 'scheduled' ||
    appointment.status === 'confirmed'

  const canEdit =
    appointment.status !== 'completed' &&
    appointment.status !== 'cancelled'

    const canReopen =
  appointment.status === 'completed' ||
  appointment.status === 'cancelled'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="appointment-details-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div>
            <p className="text-sm font-medium text-primary">
              Appointment
            </p>

            <h2
              id="appointment-details-title"
              className="mt-1 text-xl font-semibold text-foreground"
            >
              {appointment.customerName}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {getAppointmentTypeLabel(appointment.type)}
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close appointment details"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusStyles(
                appointment.status,
              )}`}
            >
              {getStatusLabel(appointment.status)}
            </span>

            <span className="text-sm text-muted-foreground">
              ID: {appointment.id}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-background p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="size-4" />
                <span className="text-xs font-medium uppercase tracking-wide">
                  Date & time
                </span>
              </div>

              <p className="mt-2 text-sm font-medium text-foreground">
                {formatAppointmentDate(appointment.scheduledAt)}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock3 className="size-4" />
                <span className="text-xs font-medium uppercase tracking-wide">
                  Duration
                </span>
              </div>

              <p className="mt-2 text-sm font-medium text-foreground">
                {formatDuration(appointment.durationMinutes)}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <UserRound className="size-4" />
                <span className="text-xs font-medium uppercase tracking-wide">
                  Agent
                </span>
              </div>

              <p className="mt-2 text-sm font-medium text-foreground">
                {appointment.agentName}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-4" />
                <span className="text-xs font-medium uppercase tracking-wide">
                  Location
                </span>
              </div>

              <p className="mt-2 text-sm font-medium text-foreground">
                {appointment.location ?? 'No location provided'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">
              Property
            </h3>

            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm text-foreground">
                {appointment.propertyTitle ??
                  'No property attached'}
              </p>

              {appointment.propertyId ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Property ID: {appointment.propertyId}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">
              Notes
            </h3>

            <div className="rounded-xl border border-border bg-background p-4">
              <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                {appointment.notes ?? 'No notes added.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-4">
          <div className="flex flex-wrap gap-2">
            {canCancel ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => onCancel(appointment)}
              >
                Cancel appointment
              </Button>
            ) : null}

            {canComplete ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => onComplete(appointment)}
              >
                <CheckCircle2 className="size-4" />
                Mark completed
              </Button>
            ) : null}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>

            {canEdit ? (
              <Button
                type="button"
                onClick={() => onEdit(appointment)}
              >
                Edit appointment
              </Button>
            ) : null}


            {canReopen ? (
            <Button
             variant="outline"
             onClick={() => onReopen(appointment)}
                >
               Reopen appointment
              </Button>
               ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}