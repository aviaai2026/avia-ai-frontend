
import { NextResponse } from 'next/server'

// Validates an invitation acceptance request before forwarding it to FastAPI.
export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { detail: 'A valid JSON request is required.' },
      { status: 400 },
    )
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    Array.isArray(body)
  ) {
    return NextResponse.json(
      { detail: 'Invalid invitation details.' },
      { status: 400 },
    )
  }

  const invitation = body as Record<string, unknown>

  if (
    typeof invitation.token !== 'string' ||
    invitation.token.length < 32 ||
    invitation.token.length > 256 ||
    typeof invitation.password !== 'string' ||
    invitation.password.length < 8 ||
    invitation.password.length > 128 ||
    typeof invitation.full_name !== 'string' ||
    !invitation.full_name.trim() ||
    invitation.full_name.trim().length > 200
  ) {
    return NextResponse.json(
      {
        detail:
          'Enter your full name and a password between 8 and 128 characters.',
      },
      { status: 400 },
    )
  }

  try {
    const response = await fetch(
      'http://localhost:8000/workspace/invitations/accept',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: invitation.token,
          password: invitation.password,
          full_name: invitation.full_name.trim(),
        }),
        cache: 'no-store',
      },
    )

    const responseBody = await response.text()
    const headers = new Headers({
      'Content-Type':
        response.headers.get('Content-Type') ?? 'application/json',
      'Cache-Control': 'no-store',
    })

    // For successful acceptance, forward the HttpOnly session cookie without exposing its value in JSON.
    if (response.ok) {
      const sessionCookie = response.headers.get('set-cookie')

      if (!sessionCookie) {
        return NextResponse.json(
          { detail: 'Invitation accepted, but a login session could not be established. Please contact support.' },
          { status: 502 },
        )
      }

      headers.set('Set-Cookie', sessionCookie)
    }

    return new NextResponse(responseBody, {
      status: response.status,
      headers,
    })
  } catch {
    return NextResponse.json(
      { detail: 'Could not connect to the AVIA.AI backend.' },
      { status: 502 },
    )
  }
}
