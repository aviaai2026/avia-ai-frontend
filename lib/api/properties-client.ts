
import type { PropertyCurrency } from '@/lib/types'

// Creates a property through the AVIAAI Next.js API route from the browser.
export async function createProperty(
  property: {
    title: string
    propertyType: string
    intent: 'sale' | 'rent' | 'lease'
    status:
      | 'available'
      | 'reserved'
      | 'sold'
      | 'rented'
      | 'unavailable'
    location: string
    bedrooms?: number
    bathrooms?: number
    price: number
    currency?: PropertyCurrency
    description?: string
  },
) {
  const response = await fetch('/api/properties', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: property.title,
      property_type: property.propertyType,
      intent: property.intent,
      status: property.status,
      location: property.location,
      bedrooms: property.bedrooms ?? null,
      bathrooms: property.bathrooms ?? null,
      price: property.price,
      ...(property.currency ? { currency: property.currency } : {}),
      description: property.description ?? null,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()

    console.error(
      '[AVIAAI properties] Failed to create property:',
      response.status,
      errorBody,
    )

    throw new Error('Failed to create property.')
  }

  const data = (await response.json()) as {
    property: {
      id: string
      workspace_id: string
      title: string
      property_type: string
      intent: 'sale' | 'rent' | 'lease'
      status:
        | 'available'
        | 'reserved'
        | 'sold'
        | 'rented'
        | 'unavailable'
      location: string
      bedrooms: number | null
      bathrooms: number | null
      price: number
      currency: PropertyCurrency | null
      description: string | null
      created_at: string
      updated_at: string
    }
  }

  return {
    id: data.property.id,
    workspaceId: data.property.workspace_id,
    title: data.property.title,
    propertyType: data.property.property_type,
    intent: data.property.intent,
    status: data.property.status,
    location: data.property.location,
    bedrooms: data.property.bedrooms ?? undefined,
    bathrooms: data.property.bathrooms ?? undefined,
    price: data.property.price,
    currency: data.property.currency,
    description: data.property.description ?? undefined,
    createdAt: data.property.created_at,
    updatedAt: data.property.updated_at,
  }
}

// Updates an existing property through the AVIAAI Next.js API route.
export async function updateProperty(
  propertyId: string,
  property: {
    title: string
    propertyType: string
    intent: 'sale' | 'rent' | 'lease'
    status:
      | 'available'
      | 'reserved'
      | 'sold'
      | 'rented'
      | 'unavailable'
    location: string
    bedrooms?: number
    bathrooms?: number
    price: number
    currency?: PropertyCurrency
    description?: string
  },
) {
  const response = await fetch(
    `/api/properties/${encodeURIComponent(propertyId)}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: property.title,
        property_type: property.propertyType,
        intent: property.intent,
        status: property.status,
        location: property.location,
        bedrooms: property.bedrooms ?? null,
        bathrooms: property.bathrooms ?? null,
        price: property.price,
        ...(property.currency ? { currency: property.currency } : {}),
        description: property.description ?? null,
      }),
    },
  )

  if (!response.ok) {
    const errorBody = await response.text()

    console.error(
      '[AVIAAI properties] Failed to update property:',
      response.status,
      errorBody,
    )

    throw new Error('Failed to update property.')
  }

  const data = (await response.json()) as {
    property: {
      id: string
      workspace_id: string
      title: string
      property_type: string
      intent: 'sale' | 'rent' | 'lease'
      status:
        | 'available'
        | 'reserved'
        | 'sold'
        | 'rented'
        | 'unavailable'
      location: string
      bedrooms: number | null
      bathrooms: number | null
      price: number
      currency: PropertyCurrency | null
      description: string | null
      created_at: string
      updated_at: string
    }
  }

  return {
    id: data.property.id,
    workspaceId: data.property.workspace_id,
    title: data.property.title,
    propertyType: data.property.property_type,
    intent: data.property.intent,
    status: data.property.status,
    location: data.property.location,
    bedrooms: data.property.bedrooms ?? undefined,
    bathrooms: data.property.bathrooms ?? undefined,
    price: data.property.price,
    currency: data.property.currency,
    description: data.property.description ?? undefined,
    createdAt: data.property.created_at,
    updatedAt: data.property.updated_at,
  }
}
