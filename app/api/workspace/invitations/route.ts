
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const allowedPermissions = new Set([
    'leads',
    'properties',
    'conversations',
    'appointments',
    'aiEmployees',
    'analytics',
    'teamManagement',
    'billing',
    'viewTeam',
    'inviteMembers',
    'removeMembers',
  ])

// Creates a workspace invitation through the backend without exposing the session cookie.
export async function POST(request: Request) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('aviaai_session')

  if (!sessionCookie?.value) {
    return NextResponse.json(
      { detail: 'Authentication required.' },
      { status: 401 },
    )
  }

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
  const permissions = invitation.permissions

  if (
    typeof invitation.full_name !== 'string' ||
    !invitation.full_name.trim() ||
    invitation.full_name.trim().length > 200 ||
    typeof invitation.email !== 'string' ||
    invitation.email.trim().length > 320 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invitation.email.trim()) ||
    (invitation.role !== 'manager' && invitation.role !== 'agent') ||
    typeof permissions !== 'object' ||
    permissions === null ||
    Array.isArray(permissions) ||
    Object.keys(permissions).length === 0 ||
    Object.entries(permissions).some(
      ([key, value]) =>
        !allowedPermissions.has(key) || typeof value !== 'boolean',
    )
  ) {
    return NextResponse.json(
      { detail: 'Please provide valid invitation details and permissions.' },
      { status: 400 },
    )
  }

  try {
    const response = await fetch(
      'http://localhost:8000/workspace/invitations',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `aviaai_session=${sessionCookie.value}`,
        },
        body: JSON.stringify({
          email: invitation.email.trim(),
          full_name: invitation.full_name.trim(),
          role: invitation.role,
          permissions,
        }),
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
