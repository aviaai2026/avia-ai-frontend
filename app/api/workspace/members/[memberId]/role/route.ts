import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Forwards a validated role change through the authenticated server-side session.
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ memberId: string }> },
) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('aviaai_session')

  if (!sessionCookie?.value) {
    return NextResponse.json(
      { detail: 'Authentication required.' },
      { status: 401 },
    )
  }

  const { memberId } = await context.params

  if (!memberId || memberId.length > 128) {
    return NextResponse.json(
      { detail: 'Invalid team member ID.' },
      { status: 400 },
    )
  }

  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { detail: 'Request body must be valid JSON.' },
      { status: 400 },
    )
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    !('role' in body) ||
    (body.role !== 'manager' && body.role !== 'agent')
  ) {
    return NextResponse.json(
      { detail: 'Role must be manager or agent.' },
      { status: 400 },
    )
  }

  try {
    const response = await fetch(
      `http://localhost:8000/workspace/members/${encodeURIComponent(memberId)}/role`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `aviaai_session=${sessionCookie.value}`,
        },
        body: JSON.stringify({ role: body.role }),
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
