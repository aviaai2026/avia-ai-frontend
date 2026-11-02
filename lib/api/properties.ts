import { cookies } from 'next/headers'
import type { Property } from '@/lib/types'

type PropertyApiResponse = {
  properties: PropertyApiRecord[]
}

type PropertyApiRecord = {
  id: string
  workspace_id: string
  title: string
  property_type: string
  intent: Property['intent']
  status: Property['status']
  location: string
  bedrooms: number | null
  bathrooms: number | null
  price: number
  currency: Property['currency']
  description: string | null
  created_at: string
  updated_at: string
}

// Converts a backend property record into the frontend Property shape.
function mapProperty(record: PropertyApiRecord): Property {
  return {
    id: record.id,
    workspaceId: record.workspace_id,
    title: record.title,
    propertyType: record.property_type,
    intent: record.intent,
    status: record.status,
    location: record.location,
    bedrooms: record.bedrooms ?? undefined,
    bathrooms: record.bathrooms ?? undefined,
    price: record.price,
    currency: record.currency,
    description: record.description ?? undefined,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  }
}

// Fetches the authenticated workspace's properties from the AVIAAI backend.
export async function getProperties(): Promise<Property[]> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('aviaai_session')

  if (!sessionCookie?.value) {
    throw new Error('Authentication required.')
  }

  const response = await fetch('http://localhost:8000/properties', {
    method: 'GET',
    headers: {
      Cookie: `aviaai_session=${sessionCookie.value}`,
    },
    cache: 'no-store',
  })

    if (!response.ok) {
    const errorBody = await response.text()

    console.error(
      '[AVIAAI properties] Failed to load properties:',
      response.status,
      errorBody,
    )

    throw new Error('Failed to load properties.')
  }

  const data = (await response.json()) as PropertyApiResponse

  console.log(
    '[AVIAAI properties] Backend returned:',
    data,
  )

return data.properties.map(mapProperty)
}
