'use client'
import { formatPropertyPrice } from '@/lib/utils/format-property-price'
import { useMemo, useState } from 'react'
import { AddPropertyDialog } from './add-property-dialog'
import { EditPropertyDialog } from './edit-property-dialog'
import { PropertyDetailsDialog } from './property-details-dialog'
import type {
  Property,
  PropertyIntent,
  PropertyStatus,
} from '@/lib/types'

type PropertiesContentProps = {
  initialProperties: Property[]
}

type PropertyTypeFilter = 'all' | string
type LocationFilter = 'all' | string
type BedroomsFilter = 'all' | '2' | '3' | '4' | '5+'

export function PropertiesContent({
  initialProperties,
}: PropertiesContentProps) {
  const [properties, setProperties] =
    useState<Property[]>(initialProperties)

  const [viewingProperty, setViewingProperty] =
    useState<Property | null>(null)

  const [showAddProperty, setShowAddProperty] =
    useState(false)

  const [editingProperty, setEditingProperty] =
    useState<Property | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [activeIntent, setActiveIntent] =
  useState<PropertyIntent>('sale')


  const [propertyTypeFilter, setPropertyTypeFilter] =
    useState<PropertyTypeFilter>('all')

  const [locationFilter, setLocationFilter] =
    useState<LocationFilter>('all')

  const [statusFilter, setStatusFilter] =
    useState<'all' | PropertyStatus>('all')

  const [bedroomsFilter, setBedroomsFilter] =
    useState<BedroomsFilter>('all')

  const propertyTypes = useMemo(
    () =>
      Array.from(
        new Set(
          properties.map(
            (property) => property.propertyType,
          ),
        ),
      ),
    [properties],
  )

  const locations = useMemo(
    () =>
      Array.from(
        new Set(
          properties.map(
            (property) => property.location,
          ),
        ),
      ),
    [properties],
  )

  const filteredProperties = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase()

    return properties.filter((property) => {
      const matchesSearch =
        !normalizedSearch ||
        property.title.toLowerCase().includes(normalizedSearch) ||
        property.location.toLowerCase().includes(normalizedSearch) ||
        property.propertyType
          .toLowerCase()
          .includes(normalizedSearch)

          const matchesIntent = property.intent === activeIntent

      const matchesPropertyType =
        propertyTypeFilter === 'all' ||
        property.propertyType === propertyTypeFilter

      const matchesLocation =
        locationFilter === 'all' ||
        property.location === locationFilter

      const matchesStatus =
        statusFilter === 'all' ||
        property.status === statusFilter

      const matchesBedrooms =
        bedroomsFilter === 'all' ||
        (bedroomsFilter === '5+'
          ? (property.bedrooms ?? 0) >= 5
          : property.bedrooms === Number(bedroomsFilter))

      return (
        matchesSearch &&
        matchesIntent &&
        matchesPropertyType &&
        matchesLocation &&
        matchesStatus &&
        matchesBedrooms
      )
    })
  }, [
    properties,
    activeIntent,
    searchQuery,
    propertyTypeFilter,
    locationFilter,
    statusFilter,
    bedroomsFilter,
  ])

// Formats a property's amount using its confirmed currency.
function formatPrice(price: number, currency: Property['currency']) {
  return formatPropertyPrice(price, currency)
}

  // Adds a newly created property to the local inventory.
  function handlePropertyAdded(property: Property) {
    setProperties((currentProperties) => [
      property,
      ...currentProperties,
    ])
  }

  // Updates an existing property in the local inventory.
  function handlePropertyUpdated(updatedProperty: Property) {
    setProperties((currentProperties) =>
      currentProperties.map((property) =>
        property.id === updatedProperty.id
          ? updatedProperty
          : property,
      ),
    )
  }

  // Resets every property filter back to its default state.
  function clearFilters() {
    setSearchQuery('')
    setPropertyTypeFilter('all')
    setLocationFilter('all')
    setStatusFilter('all')
    setBedroomsFilter('all')
  }

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    propertyTypeFilter !== 'all' ||
    locationFilter !== 'all' ||
    statusFilter !== 'all' ||
    bedroomsFilter !== 'all'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Keep your property inventory organized and up to date.
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-border bg-muted/30 p-1">
  <button
    type="button"
    onClick={() => setActiveIntent('sale')}
    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      activeIntent === 'sale'
        ? 'bg-card text-foreground shadow-sm'
        : 'text-muted-foreground hover:text-foreground'
    }`}
  >
    For Sale
  </button>

  <button
    type="button"
    onClick={() => setActiveIntent('rent')}
    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      activeIntent === 'rent'
        ? 'bg-card text-foreground shadow-sm'
        : 'text-muted-foreground hover:text-foreground'
    }`}
  >
    For Rent
  </button>

  <button
    type="button"
    onClick={() => setActiveIntent('lease')}
    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      activeIntent === 'lease'
        ? 'bg-card text-foreground shadow-sm'
        : 'text-muted-foreground hover:text-foreground'
    }`}
  >
    For Lease
  </button>
</div>

        <button
          type="button"
          onClick={() => setShowAddProperty(true)}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          + Add Property
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_repeat(4,minmax(120px,auto))]">
          <input
            type="search"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
            placeholder="Search properties..."
            aria-label="Search properties"
            className="min-w-0 rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />


          <select
            value={propertyTypeFilter}
            onChange={(event) =>
              setPropertyTypeFilter(event.target.value)
            }
            aria-label="Filter by property type"
            className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All types</option>

            {propertyTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={locationFilter}
            onChange={(event) =>
              setLocationFilter(event.target.value)
            }
            aria-label="Filter by location"
            className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All locations</option>

            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | 'all'
                  | PropertyStatus,
              )
            }
            aria-label="Filter by status"
            className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All statuses</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
            <option value="rented">Rented</option>
            <option value="unavailable">Unavailable</option>
          </select>

          <select
            value={bedroomsFilter}
            onChange={(event) =>
              setBedroomsFilter(
                event.target.value as BedroomsFilter,
              )
            }
            aria-label="Filter by bedrooms"
            className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">Bedrooms</option>
            <option value="2">2 bedrooms</option>
            <option value="3">3 bedrooms</option>
            <option value="4">4 bedrooms</option>
            <option value="5+">5+ bedrooms</option>
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Showing{' '}
            <span className="font-medium text-foreground">
            {filteredProperties.length}
</span>{' '}
of {properties.filter(
  (property) => property.intent === activeIntent,
).length} properties
          </p>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {filteredProperties.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
          <h2 className="text-base font-semibold text-foreground">
            No properties found
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Try changing your search or filters.
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredProperties.map((property) => (
            <button
              key={property.id}
              type="button"
              onClick={() => setViewingProperty(property)}
              className="w-full rounded-xl border border-border bg-card p-5 text-left transition-colors hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-semibold text-foreground">
                    {property.title}
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {property.location}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                    property.status === 'available'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : property.status === 'reserved'
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {property.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Type
                  </p>

                  <p className="mt-1 text-foreground">
                    {property.propertyType}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Intent
                  </p>

                  <p className="mt-1 capitalize text-foreground">
                    {property.intent}
                  </p>
                </div>

                {property.bedrooms !== undefined && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Bedrooms
                    </p>

                    <p className="mt-1 text-foreground">
                      {property.bedrooms}
                    </p>
                  </div>
                )}

                {property.bathrooms !== undefined && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Bathrooms
                    </p>

                    <p className="mt-1 text-foreground">
                      {property.bathrooms}
                    </p>
                  </div>
                )}
              </div>

              {property.description && (
                <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {property.description}
                </p>
              )}

              <div className="mt-5 border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">
                  Price
                </p>

                <p className="mt-1 text-lg font-semibold text-primary">
                {formatPrice(property.price, property.currency)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      <PropertyDetailsDialog
        property={viewingProperty}
        onClose={() => setViewingProperty(null)}
        onEdit={() => {
          if (!viewingProperty) {
            return
          }

          setEditingProperty(viewingProperty)
          setViewingProperty(null)
        }}
      />

      {showAddProperty && (
        <AddPropertyDialog
          onClose={() => setShowAddProperty(false)}
          onAddProperty={handlePropertyAdded}
        />
      )}

      {editingProperty && (
        <EditPropertyDialog
          property={editingProperty}
          onClose={() => setEditingProperty(null)}
          onUpdateProperty={handlePropertyUpdated}
        />
      )}
    </div>
  )
}