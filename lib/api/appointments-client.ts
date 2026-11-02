
import { cookies } from 'next/headers'
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

type AppointmentListResponse = {
  appointments: AppointmentApiRecord[]
}

// Converts the backend's snake_case appointment record into the frontend format.
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

// Extracts a useful error message from a failed API response.
async function getApiError(response: Response): Promise<string> {
  const body = await response.text()

  try {
    const parsed = JSON.parse(body) as { detail?: string }
    if (parsed.detail) return parsed.detail
  } catch {
    // Use the fallback when the response isn't JSON.
  }

  return `Appointment request failed (${response.status}).`
}

// Fetches appointments for the authenticated workspace from the backend.
// This function is for server components because it reads the session cookie.
export async function getAppointments(): Promise<Appointment[]> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('aviaai_session')

  if (!sessionCookie?.value) {
    throw new Error('Authentication required.')
  }

  const response = await fetch('http://localhost:8000/appointments', {
    method: 'GET',
    headers: {
      Cookie: `aviaai_session=${sessionCookie.value}`,
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    const errorBody = await response.text()

    console.error(
      '[AVIAAI appointments] Failed to load appointments:',
      response.status,
      errorBody,
    )

    throw new Error('Failed to load appointments.')
  }

  const data = (await response.json()) as AppointmentListResponse
  return data.appointments.map(mapAppointment)
}

// Creates an appointment through the authenticated Next.js API bridge.
export async function createAppointment(
  appointment: AppointmentInput,
): Promise<Appointment> {
  const response = await fetch('/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({
      lead_id: appointment.leadId ?? null,
      property_id: appointment.propertyId ?? null,
      customer_name: appointment.customerName,
      property_title: appointment.propertyTitle ?? null,
      agent_name: appointment.agentName,
      type: appointment.type,
      status: appointment.status,
      scheduled_at: appointment.scheduledAt,
      duration_minutes: appointment.durationMinutes,
      location: appointment.location ?? null,
      notes: appointment.notes ?? null,
    }),
  })

  if (!response.ok) {
    throw new Error(await getApiError(response))
  }

  const data = (await response.json()) as AppointmentApiResponse
  return mapAppointment(data.appointment)
}

// Updates an appointment without accepting workspace ownership from the browser.
export async function updateAppointment(
  appointmentId: string,
  updates: Partial<AppointmentInput>,
): Promise<Appointment> {
  const payload: Record<string, unknown> = {}

  if ('leadId' in updates) payload.lead_id = updates.leadId ?? null
  if ('propertyId' in updates) payload.property_id = updates.propertyId ?? null
  if ('customerName' in updates) payload.customer_name = updates.customerName
  if ('propertyTitle' in updates) payload.property_title = updates.propertyTitle ?? null
  if ('agentName' in updates) payload.agent_name = updates.agentName
  if ('type' in updates) payload.type = updates.type
  if ('status' in updates) payload.status = updates.status
  if ('scheduledAt' in updates) payload.scheduled_at = updates.scheduledAt
  if ('durationMinutes' in updates) payload.duration_minutes = updates.durationMinutes
  if ('location' in updates) payload.location = updates.location ?? null
  if ('notes' in updates) payload.notes = updates.notes ?? null

  const response = await fetch(
    `/api/appointments/${encodeURIComponent(appointmentId)}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(payload),
    },
  )

  if (!response.ok) {
    throw new Error(await getApiError(response))
  }

  const data = (await response.json()) as AppointmentApiResponse
  return mapAppointment(data.appointment)
}

// Deletes an appointment through the authenticated Next.js API bridge.
export async function deleteAppointment(
  appointmentId: string,
): Promise<void> {
  const response = await fetch(
    `/api/appointments/${encodeURIComponent(appointmentId)}`,
    {
      method: 'DELETE',
      credentials: 'same-origin',
    },
  )

  if (!response.ok) {
    throw new Error(await getApiError(response))
  }
}
