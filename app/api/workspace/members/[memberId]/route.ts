import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Forwards member removal through the authenticated server-side session.
export async function DELETE(
  _request: Request,
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

  try {
    const response = await fetch(
      `http://localhost:8000/workspace/members/${encodeURIComponent(memberId)}`,
      {
        method: 'DELETE',
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
