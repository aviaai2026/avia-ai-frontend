export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'completed'
  | 'cancelled'

export type AppointmentType =
  | 'property_viewing'
  | 'consultation'
  | 'follow_up'
  | 'other'

export type Appointment = {
  id: string
  workspaceId: string
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
  createdAt: string
  updatedAt: string
}