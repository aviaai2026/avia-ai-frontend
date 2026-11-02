
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Updates the workspace name while preserving its existing business details.
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
      !('name' in body) ||
      typeof body.name !== 'string' ||
      body.name.trim().length < 2 ||
      body.name.trim().length > 200
    ) {
      return NextResponse.json(
        { detail: 'Workspace name must contain 2–200 characters.' },
        { status: 400 },
      )
    }

    const headers = {
      Cookie: `aviaai_session=${sessionCookie.value}`,
    }

    const userResponse = await fetch('http://localhost:8000/auth/me', {
      headers,
      cache: 'no-store',
    })

    if (!userResponse.ok) {
      return NextResponse.json(
        { detail: 'Could not load your authenticated workspace.' },
        { status: userResponse.status },
      )
    }

    const userData = await userResponse.json()
    const workspace = userData.user?.workspace

    if (
      !workspace ||
      typeof workspace.business_type !== 'string' ||
      typeof workspace.operating_location !== 'string'
    ) {
      return NextResponse.json(
        { detail: 'Existing workspace details are incomplete.' },
        { status: 409 },
      )
    }

    const response = await fetch('http://localhost:8000/workspace/setup', {
      method: 'PATCH',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        business_name: body.name.trim(),
        business_type: workspace.business_type,
        operating_location: workspace.operating_location,
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
