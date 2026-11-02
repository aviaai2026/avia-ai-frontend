
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

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
// Forwards validated permission changes through the server-side session to the authorized backend.
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
    !('permissions' in body) ||
    typeof body.permissions !== 'object' ||
    body.permissions === null ||
    Array.isArray(body.permissions)
  ) {
    return NextResponse.json(
      { detail: 'A permissions object is required.' },
      { status: 400 },
    )
  }

  const permissions = body.permissions as Record<string, unknown>
  const entries = Object.entries(permissions)

  if (
    entries.length === 0 ||
    entries.some(
      ([key, value]) =>
        !allowedPermissions.has(key) || typeof value !== 'boolean',
    )
  ) {
    return NextResponse.json(
      { detail: 'Permissions contain invalid keys or values.' },
      { status: 400 },
    )
  }

  try {
    const response = await fetch(
      `http://localhost:8000/workspace/members/${encodeURIComponent(memberId)}/permissions`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `aviaai_session=${sessionCookie.value}`,
        },
        body: JSON.stringify({ permissions }),
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
