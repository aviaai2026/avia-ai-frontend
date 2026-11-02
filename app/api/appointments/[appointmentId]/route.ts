import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ appointmentId: string }>
}

// Forwards a single-appointment request while preserving session authentication.
async function forwardAppointmentRequest(
  request: Request,
  appointmentId: string,
  method: 'GET' | 'PATCH' | 'DELETE',
) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('aviaai_session')

  if (!sessionCookie?.value) {
    return NextResponse.json(
      { detail: 'Authentication required.' },
      { status: 401 },
    )
  }

  let body: string | undefined

  if (method === 'PATCH') {
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
    const response = await fetch(
      `http://localhost:8000/appointments/${encodeURIComponent(appointmentId)}`,
      {
        method,
        headers: {
          Cookie: `aviaai_session=${sessionCookie.value}`,
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(body ? { body } : {}),
        cache: 'no-store',
      },
    )

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

// Retrieves one appointment through the authenticated backend.
export async function GET(
  request: Request,
  context: RouteContext,
) {
  const { appointmentId } = await context.params
  return forwardAppointmentRequest(request, appointmentId, 'GET')
}

// Updates an appointment through the authenticated backend.
export async function PATCH(
  request: Request,
  context: RouteContext,
) {
  const { appointmentId } = await context.params
  return forwardAppointmentRequest(request, appointmentId, 'PATCH')
}

// Deletes an appointment through the authenticated backend.
export async function DELETE(
  request: Request,
  context: RouteContext,
) {
  const { appointmentId } = await context.params
  return forwardAppointmentRequest(request, appointmentId, 'DELETE')
}
