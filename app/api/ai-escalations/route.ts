
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const BACKEND_URL = 'http://localhost:8000'

// Forwards an authenticated request to the AI escalation backend and preserves its response.
async function forwardEscalationRequest(
  request: Request,
  method: 'GET' | 'POST',
  body?: unknown,
) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('aviaai_session')

  if (!sessionCookie?.value) {
    return NextResponse.json(
      { detail: 'Authentication required.' },
      { status: 401 },
    )
  }

  const requestUrl = new URL(request.url)
  const backendUrl = new URL('/ai-escalations', BACKEND_URL)

  if (method === 'GET') {
    const status = requestUrl.searchParams.get('status')

    if (status) {
      backendUrl.searchParams.set('status', status)
    }
  }

  try {
    const response = await fetch(backendUrl, {
      method,
      headers: {
        ...(method === 'POST'
          ? { 'Content-Type': 'application/json' }
          : {}),
        Cookie: `aviaai_session=${sessionCookie.value}`,
      },
      ...(method === 'POST' ? { body: JSON.stringify(body) } : {}),
      cache: 'no-store',
    })

    const responseBody = await response.text()

    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        'Content-Type':
          response.headers.get('Content-Type') ?? 'application/json',
      },
    })
  } catch {
    return NextResponse.json(
      { detail: 'Could not connect to the AVIA.AI backend.' },
      { status: 502 },
    )
  }
}

// Lists escalations for the authenticated user's active workspace.
export async function GET(request: Request) {
  return forwardEscalationRequest(request, 'GET')
}

// Creates an escalation through the authenticated backend.
export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { detail: 'A valid JSON request body is required.' },
      { status: 400 },
    )
  }

  return forwardEscalationRequest(request, 'POST', body)
}
