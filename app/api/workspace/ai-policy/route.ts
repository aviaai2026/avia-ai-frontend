
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Forwards a policy read to the backend using the current session cookie.
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
    const response = await fetch('http://localhost:8000/workspace/ai-policy', {
      headers: {
        Cookie: `aviaai_session=${sessionCookie.value}`,
      },
      cache: 'no-store',
    })

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

// Validates the toggle value before forwarding the update to the backend.
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
      !('human_escalation_enabled' in body) ||
      typeof body.human_escalation_enabled !== 'boolean'
    ) {
      return NextResponse.json(
        { detail: 'A boolean human_escalation_enabled value is required.' },
        { status: 400 },
      )
    }

    const response = await fetch('http://localhost:8000/workspace/ai-policy', {
      method: 'PATCH',
      headers: {
        Cookie: `aviaai_session=${sessionCookie.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        human_escalation_enabled: body.human_escalation_enabled,
      }),
      cache: 'no-store',
    })

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
