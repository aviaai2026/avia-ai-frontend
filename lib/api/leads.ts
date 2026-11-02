import { cookies } from 'next/headers'
import type { Lead, PropertyCurrency } from '@/lib/types'

type LeadApiResponse = {
  leads: LeadApiRecord[]
}

type LeadApiRecord = {
  id: string
  workspace_id: string
  name: string
  phone: string
  intent: Lead['intent']
  location: string | null
  budget: number | null
  budget_currency: PropertyCurrency | null
  property_type: string | null
  bedrooms: number | null
  timeline: string | null
  status: Lead['status']
  source: string | null
  created_at: string
  updated_at: string
}

// Converts a backend lead record into the frontend Lead shape.
function mapLead(record: LeadApiRecord): Lead {
  return {
    id: record.id,
    workspaceId: record.workspace_id,
    name: record.name,
    phone: record.phone,
    source: record.source ?? 'other',
    status: record.status,
    intent: record.intent,
    propertyType: record.property_type ?? undefined,
    location: record.location ?? undefined,
    budget: record.budget ?? undefined,
    budgetCurrency: record.budget_currency,
    timeline: record.timeline ?? undefined,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  }
}

// Fetches the authenticated workspace's leads from the AVIAAI backend.
export async function getLeads(): Promise<Lead[]> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('aviaai_session')

  if (!sessionCookie?.value) {
    throw new Error('Authentication required.')
  }

  const response = await fetch('http://localhost:8000/leads', {
    method: 'GET',
    headers: {
      Cookie: `aviaai_session=${sessionCookie.value}`,
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    const errorBody = await response.text()

    console.error(
      '[AVIAAI leads] Failed to load leads:',
      response.status,
      errorBody,
    )

    throw new Error('Failed to load leads.')
  }

  const data = (await response.json()) as LeadApiResponse


  return data.leads.map(mapLead)
}