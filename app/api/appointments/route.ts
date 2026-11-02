import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Forwards appointment list and create requests to the authenticated backend.
async function forwardAppointmentsRequest(request: Request, method: 'GET' | 'POST') {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('aviaai_session')

  if (!sessionCookie?.value) {
    return NextResponse.json(
      { detail: 'Authentication required.' },
      { status: 401 },
    )
  }

  let body: string | undefined

  if (method === 'POST') {
    try {
      body = JSON.stringify(await request.json())
    } catch {
      return NextResponse.json(
        { detail: 'Invalid JSON request body.' },
        { status: 400 },
      )
    }
  }

  try {
    const response = await fetch('http://localhost:8000/appointments', {
      method,
      headers: {
        Cookie: `aviaai_session=${sessionCookie.value}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body } : {}),
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

// Lists appointments for the authenticated workspace.
export async function GET(request: Request) {
  return forwardAppointmentsRequest(request, 'GET')
}

// Creates an appointment through the authenticated backend.
export async function POST(request: Request) {
  return forwardAppointmentsRequest(request, 'POST')
}
