'use client'

import {
  CalendarDays,
  Clock3,
  MapPin,
  Plus,
  Search,
  UserRound,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import type {
  Appointment,
  AppointmentStatus,
  AppointmentType,
} from '@/lib/mock/appointments'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AppointmentDetailsDialog } from '@/components/appointments/appointment-details-dialog'
import { AppointmentFormDialog } from '@/components/appointments/appointment-form-dialog'
import { AppointmentConfirmDialog } from '@/components/appointments/appointment-confirm-dialog'
import {
  createAppointment,
  updateAppointment,
} from '@/lib/api/appointments-browser'
import type { AppointmentInput } from '@/lib/api/appointments-browser'

type AppointmentsContentProps = {
  appointments: Appointment[]
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
  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Invalid date'
  }

  return new Intl.DateTimeFormat('en-NG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(parsedDate)
}

// Formats an appointment duration into a compact readable label.
function formatDuration(minutes: number) {
  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours} hr`
  }

  return `${hours} hr ${remainingMinutes} min`
}

export function AppointmentsContent({
  appointments: initialAppointments,
}: AppointmentsContentProps) {
  const [appointments, setAppointments] =
    useState<Appointment[]>(initialAppointments)

    const [searchQuery, setSearchQuery] = useState('')
    const [activeView, setActiveView] = useState<
      'scheduled' | 'confirmed' | 'archived'
    >('scheduled')
    const [archivedFilter, setArchivedFilter] = useState<
  'completed' | 'cancelled'
>('completed')

  const [viewingAppointment, setViewingAppointment] =
    useState<Appointment | null>(null)

  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null)

  const [isFormOpen, setIsFormOpen] = useState(false)

  const [confirmAction, setConfirmAction] = useState<
  'cancel' | 'complete' | 'reopen' | null
  >(null)

  const [pendingAppointment, setPendingAppointment] =
    useState<Appointment | null>(null)

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [statusError, setStatusError] = useState('')

  const filteredAppointments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return appointments.filter((appointment) => {
      const matchesSearch =
        !query ||
        [
          appointment.customerName,
          appointment.propertyTitle,
          appointment.agentName,
          appointment.location,
          getAppointmentTypeLabel(appointment.type),
          getStatusLabel(appointment.status),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(query)

          const matchesView =
          activeView === 'archived'
          ? appointment.status === archivedFilter
          : appointment.status === activeView

        return matchesSearch && matchesView
    })
  }, [appointments, searchQuery, activeView, archivedFilter])

  // Opens the appointment form in create mode.
  function handleCreateAppointment() {
    setEditingAppointment(null)
    setIsFormOpen(true)
  }

  // Opens the appointment form in edit mode.
  function handleEditAppointment(appointment: Appointment) {
    setViewingAppointment(null)
    setEditingAppointment(appointment)
    setIsFormOpen(true)
  }

  // Saves an appointment through the backend before updating the UI.
  async function handleSaveAppointment(
    input: AppointmentInput,
  ): Promise<void> {
    const savedAppointment = editingAppointment
      ? await updateAppointment(editingAppointment.id, input)
      : await createAppointment(input)

    setAppointments((currentAppointments) => {
      const exists = currentAppointments.some(
        (appointment) => appointment.id === savedAppointment.id,
      )

      return exists
        ? currentAppointments.map((appointment) =>
            appointment.id === savedAppointment.id
              ? savedAppointment
              : appointment,
          )
        : [savedAppointment, ...currentAppointments]
    })

    setEditingAppointment(null)
  }

  // Opens the cancellation confirmation for an appointment.
  function handleCancelRequest(appointment: Appointment) {
    setViewingAppointment(null)
    setPendingAppointment(appointment)
    setConfirmAction('cancel')
    setStatusError('')
  }

  // Opens the completion confirmation for an appointment.
  function handleCompleteRequest(appointment: Appointment) {
    setViewingAppointment(null)
    setPendingAppointment(appointment)
    setConfirmAction('complete')
    setStatusError('')
  }

  // Opens the confirmation dialog for reopening an appointment.
function handleReopenRequest(appointment: Appointment) {
  setViewingAppointment(null)
  setPendingAppointment(appointment)
  setConfirmAction('reopen')
  setStatusError('')
}

  // Closes the confirmation dialog and clears its pending action.
  function handleCloseConfirmation() {
    if (isUpdatingStatus) return

    setPendingAppointment(null)
    setConfirmAction(null)
    setStatusError('')
  }

  // Updates the appointment status through the backend before changing the UI.
  async function handleConfirmAction(): Promise<void> {
    if (!pendingAppointment || !confirmAction || isUpdatingStatus) {
      return
    }

    const nextStatus: AppointmentStatus =
  confirmAction === 'cancel'
    ? 'cancelled'
    : confirmAction === 'complete'
      ? 'completed'
      : 'scheduled'

    setIsUpdatingStatus(true)
    setStatusError('')

    try {
      const updatedAppointment = await updateAppointment(
        pendingAppointment.id,
        { status: nextStatus },
      )

      setAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          appointment.id === updatedAppointment.id
            ? updatedAppointment
            : appointment,
        ),
      )

      setPendingAppointment(null)
      setConfirmAction(null)
    } catch (error) {
      console.error(
        '[AVIAAI appointments] Status update failed:',
        error,
      )

      setStatusError(
        error instanceof Error
          ? error.message
          : 'Could not update this appointment. Please try again.',
      )
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  return (
    <>
      <section className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">
              Operations
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              Appointments
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Manage property viewings, consultations, and customer
              appointments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
              <CalendarDays
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />

              <span className="text-sm font-medium text-foreground">
                {appointments.length}
              </span>

              <span className="text-sm text-muted-foreground">
                total appointments
              </span>
            </div>

            <Button type="button" onClick={handleCreateAppointment}>
              <Plus className="size-4" />
              New appointment
            </Button>
          </div>
        </div>
        <div className="inline-flex w-fit rounded-lg border border-border bg-muted/30 p-1">
  <button
    type="button"
    onClick={() => setActiveView('scheduled')}
    className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
      activeView === 'scheduled'
        ? 'bg-card text-foreground shadow-sm'
        : 'text-muted-foreground hover:text-foreground'
    }`}
  >
    Scheduled
  </button>

  <button
    type="button"
    onClick={() => setActiveView('confirmed')}
    className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
      activeView === 'confirmed'
        ? 'bg-card text-foreground shadow-sm'
        : 'text-muted-foreground hover:text-foreground'
    }`}
  >
    Confirmed
  </button>

  <button
    type="button"
    onClick={() => setActiveView('archived')}
    className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
      activeView === 'archived'
        ? 'bg-card text-foreground shadow-sm'
        : 'text-muted-foreground hover:text-foreground'
    }`}
  >
    Archived
  </button>
</div>
{activeView === 'archived' && (
  <div className="inline-flex w-fit rounded-lg border border-border bg-muted/30 p-1">
    <button
      type="button"
      onClick={() => setArchivedFilter('completed')}
      className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
        archivedFilter === 'completed'
          ? 'bg-card text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      Completed
    </button>

    <button
      type="button"
      onClick={() => setArchivedFilter('cancelled')}
      className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
        archivedFilter === 'cancelled'
          ? 'bg-card text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      Cancelled
    </button>
  </div>
)}

        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />

            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search customers, properties, agents..."
              className="h-10 bg-background pl-9"
            />
          </div>


        </div>

        {filteredAppointments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary">
              <CalendarDays
                className="size-6 text-muted-foreground"
                aria-hidden="true"
              />
            </div>

            <h2 className="mt-4 text-sm font-semibold text-foreground">
              No appointments found
            </h2>

            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Try changing your search or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="hidden border-b border-border px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid md:grid-cols-[1.5fr_1.5fr_1fr_1.2fr_1fr_auto] md:gap-4">
              <span>Customer</span>
              <span>Property</span>
              <span>Agent</span>
              <span>Date &amp; time</span>
              <span>Status</span>
              <span />
            </div>

            <div className="divide-y divide-border">
              {filteredAppointments.map((appointment) => (
                <article
                  key={appointment.id}
                  className="px-5 py-4 transition-colors hover:bg-muted/40"
                >
                  <div className="grid gap-4 md:grid-cols-[1.5fr_1.5fr_1fr_1.2fr_1fr_auto] md:items-center md:gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                          <UserRound
                            className="size-4 text-muted-foreground"
                            aria-hidden="true"
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {appointment.customerName}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {getAppointmentTypeLabel(appointment.type)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {appointment.propertyTitle ?? 'No property attached'}
                      </p>

                      {appointment.location ? (
                        <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
                          <MapPin
                            className="size-3 shrink-0"
                            aria-hidden="true"
                          />
                          {appointment.location}
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <p className="text-sm text-foreground">
                        {appointment.agentName}
                      </p>
                    </div>

                    <div>
                      <p className="flex items-start gap-1.5 text-sm text-foreground">
                        <Clock3
                          className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />

                        <span>
                          {formatAppointmentDate(appointment.scheduledAt)}
                        </span>
                      </p>

                      <p className="mt-1 pl-5 text-xs text-muted-foreground">
                        {formatDuration(appointment.durationMinutes)}
                      </p>
                    </div>

                    <div>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyles(
                          appointment.status,
                        )}`}
                      >
                        {getStatusLabel(appointment.status)}
                      </span>
                    </div>

                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingAppointment(appointment)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

      <AppointmentDetailsDialog
        appointment={viewingAppointment}
        onClose={() => setViewingAppointment(null)}
        onEdit={handleEditAppointment}
        onCancel={handleCancelRequest}
        onComplete={handleCompleteRequest}
        onReopen={handleReopenRequest}
      />

      <AppointmentFormDialog
        appointment={editingAppointment}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingAppointment(null)
        }}
        onSave={handleSaveAppointment}
      />

      {pendingAppointment && confirmAction ? (
        <AppointmentConfirmDialog
        title={
          confirmAction === 'cancel'
            ? 'Cancel this appointment?'
            : confirmAction === 'complete'
              ? 'Mark appointment as completed?'
              : 'Reopen this appointment?'
        }
        description={
          statusError
            ? statusError
            : confirmAction === 'cancel'
              ? 'This appointment will be marked as cancelled. You can still see it in the appointment history.'
              : confirmAction === 'complete'
                ? 'This appointment will be marked as completed.'
                : 'This appointment will return to Scheduled. Check its date and time before treating it as an upcoming appointment.'
        }
        confirmLabel={
          isUpdatingStatus
            ? 'Saving...'
            : confirmAction === 'cancel'
              ? 'Cancel appointment'
              : confirmAction === 'complete'
                ? 'Mark completed'
                : 'Reopen appointment'
        }
          isDestructive={confirmAction === 'cancel'}
          onConfirm={handleConfirmAction}
          onClose={handleCloseConfirmation}
        />
      ) : null}
    </>
  )
}