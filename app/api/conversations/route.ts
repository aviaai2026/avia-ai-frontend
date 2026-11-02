
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Forwards conversation-list requests to the authenticated AVIA.AI backend.
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
  const leadId = requestUrl.searchParams.get('lead_id')

  const backendUrl = new URL('http://localhost:8000/conversations')

  if (leadId) {
    backendUrl.searchParams.set('lead_id', leadId)
  }

  try {
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        Cookie: `aviaai_session=${sessionCookie.value}`,
      },
      cache: 'no-store',
    })

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
