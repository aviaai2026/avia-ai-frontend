
type LegacyMockProperty = {
  id: string
  workspaceId: string
  title: string
  propertyType: string
  intent: 'sale' | 'rent' | 'lease'
  status: 'available' | 'reserved' | 'sold' | 'rented' | 'unavailable'
  location: string
  bedrooms?: number
  bathrooms?: number
  price: number
  description?: string
  createdAt: string
  updatedAt: string
}

export const mockProperties: LegacyMockProperty[] = [
  {
    id: 'property_demo_001',
    workspaceId: 'ws_demo',
    title: 'Modern 4-Bedroom Detached Duplex',
    propertyType: 'House',
    intent: 'sale',
    status: 'available',
    location: 'Maitama',
    bedrooms: 4,
    bathrooms: 5,
    price: 185000000,
    description:
      'Modern detached duplex with spacious living areas and private parking.',
    createdAt: '2026-09-20T09:00:00Z',
    updatedAt: '2026-09-28T10:30:00Z',
  },
  {
    id: 'property_demo_002',
    workspaceId: 'ws_demo',
    title: 'Luxury 3-Bedroom Apartment',
    propertyType: 'Apartment',
    intent: 'rent',
    status: 'available',
    location: 'Wuse 2',
    bedrooms: 3,
    bathrooms: 3,
    price: 12500000,
    description:
      'Contemporary apartment in a secure and well-connected location.',
    createdAt: '2026-09-18T11:00:00Z',
    updatedAt: '2026-09-27T14:20:00Z',
  },
  {
    id: 'property_demo_003',
    workspaceId: 'ws_demo',
    title: 'Premium 5-Bedroom Residence',
    propertyType: 'House',
    intent: 'sale',
    status: 'reserved',
    location: 'Asokoro',
    bedrooms: 5,
    bathrooms: 6,
    price: 240000000,
    description:
      'Large family residence with premium finishes and extensive outdoor space.',
    createdAt: '2026-09-15T08:30:00Z',
    updatedAt: '2026-09-29T09:15:00Z',
  },
  {
    id: 'property_demo_004',
    workspaceId: 'ws_demo',
    title: '2-Bedroom Serviced Apartment',
    propertyType: 'Apartment',
    intent: 'rent',
    status: 'available',
    location: 'Maitama',
    bedrooms: 2,
    bathrooms: 2,
    price: 8000000,
    description:
      'Fully serviced two-bedroom apartment suitable for professionals or small families.',
    createdAt: '2026-09-22T12:00:00Z',
    updatedAt: '2026-09-30T08:45:00Z',
  },
  {
    id: 'property_demo_005',
    workspaceId: 'ws_demo',
    title: 'Residential Land Parcel',
    propertyType: 'Land',
    intent: 'sale',
    status: 'available',
    location: 'Katampe',
    price: 45000000,
    description:
      'Residential land parcel in a growing premium district.',
    createdAt: '2026-09-10T10:00:00Z',
    updatedAt: '2026-09-25T16:00:00Z',
  },
]

// Returns legacy demo fixtures; production properties are loaded from the backend.
export async function getProperties(): Promise<LegacyMockProperty[]> {
  return mockProperties
}
