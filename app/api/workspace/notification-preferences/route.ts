
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Forwards notification preference reads using the current authenticated session.
export async function GET() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('aviaai_session')

  if (!sessionCookie?.value) {
    return NextResponse.json(
      { detail: 'Authentication required.' },
      { status: 401 },
    )
  }

  try {
    const response = await fetch(
      'http://localhost:8000/workspace/notification-preferences',
      {
        headers: {
          Cookie: `aviaai_session=${sessionCookie.value}`,
        },
        cache: 'no-store',
      },
    )

    const body = await response.text()

    return new NextResponse(body, {
      status: response.status,
      headers: {
        'Content-Type':
          response.headers.get('Content-Type') ?? 'application/json',
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    return NextResponse.json(
      { detail: 'Could not connect to the AVIA.AI backend.' },
      { status: 502 },
    )
  }
}

// Validates all four notification preference booleans before forwarding an update.
export async function PATCH(request: Request) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('aviaai_session')

  if (!sessionCookie?.value) {
    return NextResponse.json(
      { detail: 'Authentication required.' },
      { status: 401 },
    )
  }

  try {
    const body: unknown = await request.json()

    if (
      typeof body !== 'object' ||
      body === null ||
      !('notifications_enabled' in body) ||
      typeof body.notifications_enabled !== 'boolean' ||
      !('notify_new_leads' in body) ||
      typeof body.notify_new_leads !== 'boolean' ||
      !('notify_ai_escalations' in body) ||
      typeof body.notify_ai_escalations !== 'boolean' ||
      !('notify_system_alerts' in body) ||
      typeof body.notify_system_alerts !== 'boolean'
    ) {
      return NextResponse.json(
        { detail: 'All four notification preferences must be booleans.' },
        { status: 400 },
      )
    }

    const response = await fetch(
      'http://localhost:8000/workspace/notification-preferences',
      {
        method: 'PATCH',
        headers: {
          Cookie: `aviaai_session=${sessionCookie.value}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notifications_enabled: body.notifications_enabled,
          notify_new_leads: body.notify_new_leads,
          notify_ai_escalations: body.notify_ai_escalations,
          notify_system_alerts: body.notify_system_alerts,
        }),
        cache: 'no-store',
      },
    )

    const responseBody = await response.text()

    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        'Content-Type':
          response.headers.get('Content-Type') ?? 'application/json',
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    return NextResponse.json(
      { detail: 'Could not connect to the AVIA.AI backend.' },
      { status: 502 },
    )
  }
}
