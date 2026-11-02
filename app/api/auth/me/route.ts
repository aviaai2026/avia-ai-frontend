
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Returns the authenticated user and workspace without exposing the session cookie to browser JavaScript.
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
    const response = await fetch('http://localhost:8000/auth/me', {
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
