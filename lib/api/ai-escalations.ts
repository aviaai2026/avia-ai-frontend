
export type EscalationStatus =
  | 'open'
  | 'claimed'
  | 'resolved'
  | 'cancelled'

export type EscalationPriority = 'normal' | 'high' | 'urgent'

export type EscalationEmployee =
  | 'lead-employee'
  | 'lead-revival-employee'


  export type Escalation = {
    id: string
    workspace_id: string
    employee_id: EscalationEmployee
    status: EscalationStatus
    priority: EscalationPriority
    reason: string
    summary: string
    context: Record<string, unknown>
    created_by_user_id: string
    claimed_by_user_id: string | null
    claimed_at: string | null
    resolved_at: string | null
    resolved_by_user_id: string | null
    cancelled_by_user_id: string | null
    cancelled_at: string | null
    created_at: string
    updated_at: string
    claimed_by_user_name: string | null
    resolved_by_user_name: string | null
    cancelled_by_user_name: string | null
  }


export type CreateEscalationInput = {
  employee_id: EscalationEmployee
  priority: EscalationPriority
  reason: string
  summary?: string
  context?: Record<string, unknown>
}

type EscalationResponse = {
  escalation: Escalation
}

type EscalationsResponse = {
  escalations: Escalation[]
}

// Sends a request to the same-origin escalation API and extracts backend errors.
async function requestEscalation<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`/api/ai-escalations${path}`, {
    ...options,
    cache: 'no-store',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })

  const responseText = await response.text()
  let responseData: unknown

  try {
    responseData = responseText ? JSON.parse(responseText) : null
  } catch {
    responseData = null
  }

  if (!response.ok) {
    const detail =
      typeof responseData === 'object' &&
      responseData !== null &&
      'detail' in responseData &&
      typeof responseData.detail === 'string'
        ? responseData.detail
        : `Escalation request failed (${response.status}).`

    throw new Error(detail)
  }

  return responseData as T
}

// Loads escalations, optionally filtered by status.
export async function getEscalations(
  status?: EscalationStatus,
): Promise<Escalation[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : ''
  const result = await requestEscalation<EscalationsResponse>(query)

  return result.escalations
}

// Loads one escalation by its ID.
export async function getEscalation(
  id: string,
): Promise<Escalation> {
  const result = await requestEscalation<EscalationResponse>(
    `/${encodeURIComponent(id)}`,
  )

  return result.escalation
}

// Creates an escalation through the authenticated API.
export async function createEscalation(
  input: CreateEscalationInput,
): Promise<Escalation> {
  const result = await requestEscalation<EscalationResponse>('', {
    method: 'POST',
    body: JSON.stringify(input),
  })

  return result.escalation
}

// Claims an open escalation for the authenticated user.
export async function claimEscalation(
  id: string,
): Promise<Escalation> {
  const result = await requestEscalation<EscalationResponse>(
    `/${encodeURIComponent(id)}/claim`,
    { method: 'POST' },
  )

  return result.escalation
}

// Resolves an escalation through the backend's permission checks.
export async function resolveEscalation(
  id: string,
): Promise<Escalation> {
  const result = await requestEscalation<EscalationResponse>(
    `/${encodeURIComponent(id)}/resolve`,
    { method: 'PATCH' },
  )

  return result.escalation
}

// Cancels an escalation through the backend's permission checks.
export async function cancelEscalation(
  id: string,
): Promise<Escalation> {
  const result = await requestEscalation<EscalationResponse>(
    `/${encodeURIComponent(id)}/cancel`,
    { method: 'PATCH' },
  )

  return result.escalation
}
