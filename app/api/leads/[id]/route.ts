import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Updates a lead through the authenticated AVIAAI FastAPI backend.
export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      id: string
    }>
  },
) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('aviaai_session')

  if (!sessionCookie?.value) {
    return NextResponse.json(
      { detail: 'Authentication required.' },
      { status: 401 },
    )
  }

  const { id } = await context.params

  if (!id) {
    return NextResponse.json(
      { detail: 'Lead ID is required.' },
      { status: 400 },
    )
  }

  const body = await request.json()

  const response = await fetch(
    `http://localhost:8000/leads/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `aviaai_session=${sessionCookie.value}`,
      },
      body: JSON.stringify(body),
    },
  )

  const responseBody = await response.text()

  return new NextResponse(responseBody, {
    status: response.status,
    headers: {
      'Content-Type':
        response.headers.get('Content-Type') ??
        'application/json',
    },
  })
}