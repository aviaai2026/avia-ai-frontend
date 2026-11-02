
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Cancels an escalation through the authenticated AVIA.AI backend.
export async function PATCH(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params

  if (!id) {
    return NextResponse.json(
      { detail: 'Escalation ID is required.' },
      { status: 400 },
    )
  }

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
      `http://localhost:8000/ai-escalations/${encodeURIComponent(id)}/cancel`,
      {
        method: 'PATCH',
        headers: {
          Cookie: `aviaai_session=${sessionCookie.value}`,
        },
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
