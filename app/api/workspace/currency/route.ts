
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Validates and forwards the workspace default currency update using the authenticated session.
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
      !('default_currency' in body) ||
      !['USD', 'NGN', 'AED'].includes(String(body.default_currency))
    ) {
      return NextResponse.json(
        { detail: 'Choose USD, NGN, or AED.' },
        { status: 400 },
      )
    }

    const response = await fetch('http://localhost:8000/workspace/currency', {
      method: 'PATCH',
      headers: {
        Cookie: `aviaai_session=${sessionCookie.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        default_currency: body.default_currency,
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
