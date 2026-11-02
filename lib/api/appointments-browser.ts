
import type {
    Appointment,
    AppointmentStatus,
    AppointmentType,
  } from '@/lib/mock/appointments'

  export type AppointmentInput = {
    leadId?: string
    propertyId?: string
    customerName: string
    propertyTitle?: string
    agentName: string
    type: AppointmentType
    status: AppointmentStatus
    scheduledAt: string
    durationMinutes: number
    location?: string
    notes?: string
  }

  type AppointmentApiRecord = {
    id: string
    workspace_id: string
    lead_id: string | null
    property_id: string | null
    customer_name: string
    property_title: string | null
    agent_name: string
    type: AppointmentType
    status: AppointmentStatus
    scheduled_at: string
    duration_minutes: number
    location: string | null
    notes: string | null
    created_at: string
    updated_at: string
  }

  type AppointmentApiResponse = {
    appointment: AppointmentApiRecord
  }

  // Converts a backend appointment record into the frontend format.
  function mapAppointment(record: AppointmentApiRecord): Appointment {
    return {
      id: record.id,
      workspaceId: record.workspace_id,
      leadId: record.lead_id ?? undefined,
      propertyId: record.property_id ?? undefined,
      customerName: record.customer_name,
      propertyTitle: record.property_title ?? undefined,
      agentName: record.agent_name,
      type: record.type,
      status: record.status,
      scheduledAt: record.scheduled_at,
      durationMinutes: record.duration_minutes,
      location: record.location ?? undefined,
      notes: record.notes ?? undefined,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    }
  }

 // Sends only the supplied fields for PATCH requests and all required fields for POST requests.
async function sendAppointmentRequest(
  url: string,
  method: 'POST' | 'PATCH',
  input: AppointmentInput | Partial<AppointmentInput>,
): Promise<Appointment> {
  const payload: Record<string, unknown> = {}

  // Maps frontend fields to backend field names without overwriting omitted fields.
  const fieldMap = {
    customerName: 'customer_name',
    propertyTitle: 'property_title',
    agentName: 'agent_name',
    type: 'type',
    status: 'status',
    scheduledAt: 'scheduled_at',
    durationMinutes: 'duration_minutes',
    location: 'location',
    notes: 'notes',
    leadId: 'lead_id',
    propertyId: 'property_id',
  } as const

  for (const [frontendKey, backendKey] of Object.entries(fieldMap)) {
    const value = input[frontendKey as keyof typeof input]

    if (value !== undefined) {
      payload[backendKey] =
        value === '' && (frontendKey === 'leadId' || frontendKey === 'propertyId')
          ? null
          : value ?? null
    }
  }

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const body = await response.text()
    console.error(
      '[AVIAAI appointments] Save failed:',
      response.status,
      body,
    )
    throw new Error('Could not save the appointment. Please try again.')
  }

  const data = (await response.json()) as AppointmentApiResponse
  return mapAppointment(data.appointment)
}

 // Creates a new appointment.
export async function createAppointment(
  input: AppointmentInput,
): Promise<Appointment> {
  return sendAppointmentRequest('/api/appointments', 'POST', input)
}

// Updates only the supplied appointment fields.
export async function updateAppointment(
  appointmentId: string,
  input: Partial<AppointmentInput>,
): Promise<Appointment> {
  return sendAppointmentRequest(
    `/api/appointments/${encodeURIComponent(appointmentId)}`,
    'PATCH',
    input,
  )
}