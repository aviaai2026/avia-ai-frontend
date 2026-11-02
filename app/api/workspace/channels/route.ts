import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Reads channel statuses through the backend using the current session cookie.
export async function GET() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('aviaai_session')

  if (!sessionCookie?.value) {
    return NextResponse.json(
      { detail: 'Authentication required.' },
      {
        status: 401,
        headers: { 'Cache-Control': 'no-store' },
      },
    )
  }

  try {
    const response = await fetch('http://localhost:8000/workspace/channels', {
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
      {
        status: 502,
        headers: { 'Cache-Control': 'no-store' },
      },
    )
  }
}
