
'use client'

import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type {
  Appointment,
  AppointmentStatus,
  AppointmentType,
} from '@/lib/mock/appointments'
import type { AppointmentInput } from '@/lib/api/appointments-browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type AppointmentFormDialogProps = {
  appointment: Appointment | null
  isOpen: boolean
  onClose: () => void
  onSave: (appointment: AppointmentInput) => Promise<void>
}

// Converts an ISO appointment date into the format required by datetime-local inputs.
function toDateTimeLocal(date: string) {
  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return ''
  }

  const offset = parsedDate.getTimezoneOffset() * 60000

  return new Date(parsedDate.getTime() - offset)
    .toISOString()
    .slice(0, 16)
}

// Converts a datetime-local value into an ISO timestamp.
function toISOString(value: string) {
  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return ''
  }

  return parsedDate.toISOString()
}

export function AppointmentFormDialog({
  appointment,
  isOpen,
  onClose,
  onSave,
}: AppointmentFormDialogProps) {
  const isEditing = Boolean(appointment)

  const [customerName, setCustomerName] = useState('')
  const [propertyTitle, setPropertyTitle] = useState('')
  const [agentName, setAgentName] = useState('')
  const [type, setType] =
    useState<AppointmentType>('property_viewing')
  const [status, setStatus] =
    useState<AppointmentStatus>('scheduled')
  const [scheduledAt, setScheduledAt] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('60')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    if (appointment) {
      setCustomerName(appointment.customerName)
      setPropertyTitle(appointment.propertyTitle ?? '')
      setAgentName(appointment.agentName)
      setType(appointment.type)
      setStatus(appointment.status)
      setScheduledAt(toDateTimeLocal(appointment.scheduledAt))
      setDurationMinutes(String(appointment.durationMinutes))
      setLocation(appointment.location ?? '')
      setNotes(appointment.notes ?? '')
    } else {
      setCustomerName('')
      setPropertyTitle('')
      setAgentName('')
      setType('property_viewing')
      setStatus('scheduled')
      setScheduledAt('')
      setDurationMinutes('60')
      setLocation('')
      setNotes('')
    }

    setError('')
    setIsSaving(false)
  }, [appointment, isOpen])

  // Validates the form and submits only editable appointment fields to the API.
  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (isSaving) {
      return
    }

    const trimmedCustomerName = customerName.trim()
    const trimmedAgentName = agentName.trim()
    const parsedDuration = Number(durationMinutes)

    if (!trimmedCustomerName) {
      setError('Customer name is required.')
      return
    }

    if (!trimmedAgentName) {
      setError('Agent name is required.')
      return
    }

    if (!scheduledAt) {
      setError('Date and time are required.')
      return
    }

    if (
      !Number.isInteger(parsedDuration) ||
      parsedDuration < 1 ||
      parsedDuration > 1440
    ) {
      setError('Duration must be between 1 and 1440 whole minutes.')
      return
    }

    const isoDate = toISOString(scheduledAt)

    if (!isoDate) {
      setError('Please enter a valid appointment date and time.')
      return
    }

    const input: AppointmentInput = {
      customerName: trimmedCustomerName,
      propertyTitle: propertyTitle.trim() || undefined,
      agentName: trimmedAgentName,
      type,
      status,
      scheduledAt: isoDate,
      durationMinutes: parsedDuration,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
    }

    setError('')
    setIsSaving(true)

    try {
      await onSave(input)
      onClose()
    } catch (saveError) {
      console.error('[AVIAAI appointments] Form submission failed:', saveError)
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Could not save the appointment. Please try again.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) {
          onClose()
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="appointment-form-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div>
            <p className="text-sm font-medium text-primary">
              Operations
            </p>

            <h2
              id="appointment-form-title"
              className="mt-1 text-xl font-semibold text-foreground"
            >
              {isEditing ? 'Edit appointment' : 'Create appointment'}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {isEditing
                ? 'Update the appointment details or reschedule the meeting.'
                : 'Create a new customer appointment.'}
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close appointment form"
          >
            <X className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 p-6">
            {error ? (
              <div
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {error}
              </div>
            ) : null}

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="appointment-customer"
                  className="text-sm font-medium text-foreground"
                >
                  Customer
                </label>
                <Input
                  id="appointment-customer"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  placeholder="Customer name"
                  maxLength={200}
                  required
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="appointment-agent"
                  className="text-sm font-medium text-foreground"
                >
                  Agent
                </label>
                <Input
                  id="appointment-agent"
                  value={agentName}
                  onChange={(event) => setAgentName(event.target.value)}
                  placeholder="Assigned agent"
                  maxLength={200}
                  required
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="appointment-property"
                  className="text-sm font-medium text-foreground"
                >
                  Property
                </label>
                <Input
                  id="appointment-property"
                  value={propertyTitle}
                  onChange={(event) => setPropertyTitle(event.target.value)}
                  placeholder="Property title"
                  maxLength={200}
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="appointment-type"
                  className="text-sm font-medium text-foreground"
                >
                  Appointment type
                </label>
                <select
                  id="appointment-type"
                  value={type}
                  onChange={(event) =>
                    setType(event.target.value as AppointmentType)
                  }
                  disabled={isSaving}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="property_viewing">Property Viewing</option>
                  <option value="consultation">Consultation</option>
                  <option value="follow_up">Follow-up</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="appointment-date"
                  className="text-sm font-medium text-foreground"
                >
                  Date &amp; time
                </label>
                <Input
                  id="appointment-date"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(event) => setScheduledAt(event.target.value)}
                  required
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="appointment-duration"
                  className="text-sm font-medium text-foreground"
                >
                  Duration
                </label>
                <Input
                  id="appointment-duration"
                  type="number"
                  min="1"
                  max="1440"
                  step="1"
                  value={durationMinutes}
                  onChange={(event) => setDurationMinutes(event.target.value)}
                  placeholder="60"
                  required
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="appointment-status"
                  className="text-sm font-medium text-foreground"
                >
                  Status
                </label>
                <select
                  id="appointment-status"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as AppointmentStatus)
                  }
                  disabled={isSaving}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="appointment-location"
                  className="text-sm font-medium text-foreground"
                >
                  Location
                </label>
                <Input
                  id="appointment-location"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Property or office location"
                  maxLength={500}
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="appointment-notes"
                className="text-sm font-medium text-foreground"
              >
                Notes
              </label>
              <textarea
                id="appointment-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Add appointment notes..."
                rows={4}
                maxLength={5000}
                disabled={isSaving}
                className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isSaving}>
              {isSaving
                ? 'Saving...'
                : isEditing
                  ? 'Save changes'
                  : 'Create appointment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
