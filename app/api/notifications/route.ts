
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const BACKEND_URL = 'http://localhost:8000'

// Forwards notification queries using the current user's session cookie.
export async function GET(request: Request) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('aviaai_session')

  if (!sessionCookie?.value) {
    return NextResponse.json(
      { detail: 'Authentication required.' },
      { status: 401 },
    )
  }

  const requestUrl = new URL(request.url)
  const backendUrl = new URL('/notifications', BACKEND_URL)

  for (const key of ['category', 'limit', 'offset']) {
    const value = requestUrl.searchParams.get(key)
    if (value !== null) backendUrl.searchParams.set(key, value)
  }

  try {
    const response = await fetch(backendUrl, {
      headers: {
        Cookie: `aviaai_session=${sessionCookie.value}`,
      },
      cache: 'no-store',
    })

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
