
import type {
  Lead,
  LeadIntent,
  LeadSource,
  PropertyCurrency,
} from '@/lib/types'

// Extracts a safe, actionable error message from an API response.
async function getApiErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  const responseBody = await response.text()

  try {
    const parsed = JSON.parse(responseBody) as {
      detail?: unknown
      message?: unknown
    }

    if (typeof parsed.detail === 'string') {
      return parsed.detail
    }

    if (typeof parsed.message === 'string') {
      return parsed.message
    }

    if (Array.isArray(parsed.detail)) {
      const messages = parsed.detail
        .map((item) =>
          typeof item?.msg === 'string' ? item.msg : null,
        )
        .filter((message): message is string => Boolean(message))

      if (messages.length > 0) {
        return messages.join('. ')
      }
    }
  } catch {
    // Keep the fallback when the response isn't valid JSON.
  }

  return fallback
}

type CreateLeadInput = {
  name: string
  phone: string
  phoneCountry: 'US' | 'NG' | 'AE' | 'GB'
  email?: string
  intent: LeadIntent
  source: LeadSource
  propertyType?: string
  location?: string
  budget?: number
  budgetCurrency?: PropertyCurrency
  timeline?: string
}

// Defines the lead fields returned by the backend API.
type LeadApiResponse = {
  lead: {
    id: string
    workspace_id: string
    name: string
    phone: string
    intent: LeadIntent
    location: string | null
    budget: number | null
    budget_currency: PropertyCurrency | null
    property_type: string | null
    timeline: string | null
    status: Lead['status']
    source: string | null
    created_at: string
    updated_at: string
  }
}

// Converts a backend lead response into the frontend Lead type.
function mapApiLeadToLead(data: LeadApiResponse['lead']): Lead {
  return {
    id: data.id,
    workspaceId: data.workspace_id,
    name: data.name,
    phone: data.phone,
    source: (data.source as LeadSource) ?? 'other',
    status: data.status,
    intent: data.intent,
    propertyType: data.property_type ?? undefined,
    location: data.location ?? undefined,
    budget: data.budget ?? undefined,
    budgetCurrency: data.budget_currency,
    timeline: data.timeline ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

// Creates a lead through the authenticated AVIAAI Next.js API route.
export async function createLead(input: CreateLeadInput): Promise<Lead> {
  const response = await fetch('/api/leads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: input.name,
      phone: input.phone,
      phone_country: input.phoneCountry,
      intent: input.intent,
      location: input.location ?? null,
      budget: input.budget ?? null,
      budget_currency: input.budgetCurrency ?? null,
      property_type: input.propertyType ?? null,
      timeline: input.timeline ?? null,
      status: 'new',
      source: input.source,
    }),
  })

  if (!response.ok) {
    const errorMessage = await getApiErrorMessage(
      response,
      'Failed to create lead.',
    )

    console.error(
      '[AVIAAI leads] Failed to create lead:',
      response.status,
      errorMessage,
    )

    throw new Error(errorMessage)
  }

  const data = (await response.json()) as LeadApiResponse

  return mapApiLeadToLead(data.lead)
}

// Updates an existing lead through the authenticated AVIAAI Next.js API route.
export async function updateLead(
  leadId: string,
  input: {
    name: string
    phone?: string
    phoneCountry?: 'US' | 'NG' | 'AE' | 'GB'
    intent: LeadIntent
    source: LeadSource
    status: Lead['status']
    propertyType?: string
    location?: string
    budget?: number
    budgetCurrency?: PropertyCurrency
    timeline?: string
  },
): Promise<Lead> {
  const response = await fetch(
    `/api/leads/${encodeURIComponent(leadId)}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: input.name,
        phone: input.phone,
        phone_country: input.phoneCountry,
        intent: input.intent,
        source: input.source,
        status: input.status,
        property_type: input.propertyType ?? null,
        location: input.location ?? null,
        budget: input.budget ?? null,
        budget_currency: input.budgetCurrency,
        timeline: input.timeline ?? null,
      }),
    },
  )

  if (!response.ok) {
    const errorMessage = await getApiErrorMessage(
      response,
      'Failed to update lead.',
    )

    console.error(
      '[AVIAAI leads] Failed to update lead:',
      response.status,
      errorMessage,
    )

    throw new Error(errorMessage)
  }

  const data = (await response.json()) as LeadApiResponse

  return mapApiLeadToLead(data.lead)
}

// Archives a lead through the authenticated AVIAAI Next.js API route.
export async function archiveLead(
  leadId: string,
): Promise<Lead> {
  const response = await fetch(
    `/api/leads/${encodeURIComponent(leadId)}/archive`,
    {
      method: 'PATCH',
    },
  )

  if (!response.ok) {
    const errorBody = await response.text()

    console.error(
      '[AVIAAI leads] Failed to archive lead:',
      response.status,
      errorBody,
    )

    throw new Error('Failed to archive lead.')
  }

  const data = (await response.json()) as LeadApiResponse

  return mapApiLeadToLead(data.lead)
}

// Restores an archived lead through the authenticated AVIAAI Next.js API route.
export async function restoreLead(
  leadId: string,
): Promise<Lead> {
  const response = await fetch(
    `/api/leads/${encodeURIComponent(leadId)}/restore`,
    {
      method: 'PATCH',
    },
  )

  if (!response.ok) {
    const errorBody = await response.text()

    console.error(
      '[AVIAAI leads] Failed to restore lead:',
      response.status,
      errorBody,
    )

    throw new Error('Failed to restore lead.')
  }

  const data = (await response.json()) as LeadApiResponse

  return mapApiLeadToLead(data.lead)
}
