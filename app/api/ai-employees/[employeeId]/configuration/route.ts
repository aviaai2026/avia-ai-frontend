import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const allowedEmployeeIds = [
  'lead-employee',
  'lead-revival-employee',
] as const

type RouteContext = {
  params: Promise<{ employeeId: string }>
}

// Validates the employee ID before forwarding the request.
async function getEmployeeId(context: RouteContext) {
  const { employeeId } = await context.params

  if (
    !allowedEmployeeIds.includes(
      employeeId as (typeof allowedEmployeeIds)[number],
    )
  ) {
    return null
  }

  return employeeId
}

// Forwards an authenticated request to the FastAPI backend.
async function forwardConfigurationRequest(
  employeeId: string,
  method: 'GET' | 'PUT',
  body?: string,
) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('aviaai_session')

  if (!sessionCookie?.value) {
    return NextResponse.json(
      { detail: 'Authentication required.' },
      { status: 401 },
    )
  }

  try {
    const response = await fetch(
      `http://localhost:8000/ai-employees/${employeeId}/configuration`,
      {
        method,
        headers: {
          Cookie: `aviaai_session=${sessionCookie.value}`,
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(body ? { body } : {}),
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

// Loads configuration through the authenticated backend.
export async function GET(
  _request: Request,
  context: RouteContext,
) {
  const employeeId = await getEmployeeId(context)

  if (!employeeId) {
    return NextResponse.json(
      { detail: 'Invalid employee ID.' },
      { status: 400 },
    )
  }

  return forwardConfigurationRequest(employeeId, 'GET')
}

// Saves configuration through the authenticated backend.
export async function PUT(
  request: Request,
  context: RouteContext,
) {
  const employeeId = await getEmployeeId(context)

  if (!employeeId) {
    return NextResponse.json(
      { detail: 'Invalid employee ID.' },
      { status: 400 },
    )
  }

  let body: string

  try {
    body = JSON.stringify(await request.json())
  } catch {
    return NextResponse.json(
      { detail: 'Invalid JSON request body.' },
      { status: 400 },
    )
  }

  return forwardConfigurationRequest(employeeId, 'PUT', body)
}