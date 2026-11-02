
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ conversationId: string }>
}

// Retrieves message history through the authenticated AVIA.AI backend.
export async function GET(
  request: Request,
  context: RouteContext,
) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('aviaai_session')

  if (!sessionCookie?.value) {
    return NextResponse.json(
      { detail: 'Authentication required.' },
      { status: 401 },
    )
  }

  const { conversationId } = await context.params

  if (!conversationId) {
    return NextResponse.json(
      { detail: 'Conversation ID is required.' },
      { status: 400 },
    )
  }

  try {
    const response = await fetch(
      `http://localhost:8000/conversations/${encodeURIComponent(conversationId)}/messages`,
      {
        method: 'GET',
        headers: {
          Cookie: `aviaai_session=${sessionCookie.value}`,
        },
        cache: 'no-store',
      },
    )

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
// Sends a conversation reply through the authenticated backend session.
export async function POST(
  request: Request,
  context: RouteContext,
) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('aviaai_session')

  if (!sessionCookie?.value) {
    return NextResponse.json(
      { detail: 'Authentication required.' },
      { status: 401 },
    )
  }

  const { conversationId } = await context.params

  if (!conversationId) {
    return NextResponse.json(
      { detail: 'Conversation ID is required.' },
      { status: 400 },
    )
  }

  try {
    const requestBody = await request.text()

    const response = await fetch(
      `http://localhost:8000/conversations/${encodeURIComponent(conversationId)}/messages`,
      {
        method: 'POST',
        headers: {
          Cookie: `aviaai_session=${sessionCookie.value}`,
          'Content-Type': 'application/json',
        },
        body: requestBody,
        cache: 'no-store',
      },
    )

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