
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const BACKEND_URL = 'http://localhost:8000'

// Forwards a read request while preserving backend authorization and status.
export async function PATCH(
  _request: Request,
  context: { params: Promise<{ notificationId: string }> },
) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('aviaai_session')

  if (!sessionCookie?.value) {
    return NextResponse.json(
      { detail: 'Authentication required.' },
      { status: 401 },
    )
  }

  const { notificationId } = await context.params

  try {
    const response = await fetch(
      new URL(
        `/notifications/${encodeURIComponent(notificationId)}/read`,
        BACKEND_URL,
      ),
      {
        method: 'PATCH',
        headers: {
          Cookie: `aviaai_session=${sessionCookie.value}`,
        },
        cache: 'no-store',
      },
    )

    return new NextResponse(await response.text(), {
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
