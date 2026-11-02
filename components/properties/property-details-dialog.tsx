'use client'
import { formatPropertyPrice } from '@/lib/utils/format-property-price'
import { X } from 'lucide-react'
import { useState } from 'react'
import type { Property } from '@/lib/types'

type PropertyDetailsDialogProps = {
  property: Property | null
  onClose: () => void
  onEdit: () => void
}

export function PropertyDetailsDialog({
  property,
  onClose,
  onEdit,
}: PropertyDetailsDialogProps) {
  const [showDescription, setShowDescription] = useState(true)

  if (!property) {
    return null
  }

  // Formats a property's amount using its confirmed currency.
function formatPrice(price: number, currency: Property['currency']) {
  return formatPropertyPrice(price, currency)
}

  // Formats property timestamps for the dashboard.
  function formatDate(date: string) {
    return new Date(date).toLocaleString('en-NG', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold text-foreground">
                {property.title}
              </h2>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
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

            <p className="mt-1 text-sm text-muted-foreground">
              {property.location}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close property details"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Property information
              </h3>

              <div className="mt-4 rounded-xl border border-border bg-background/40 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Property type
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {property.propertyType}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Intent
                    </p>
                    <p className="mt-1 text-sm capitalize text-foreground">
                      {property.intent}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Location
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {property.location}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Status
                    </p>
                    <p className="mt-1 text-sm capitalize text-foreground">
                      {property.status}
                    </p>
                  </div>

                  {property.bedrooms !== undefined && (
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Bedrooms
                      </p>
                      <p className="mt-1 text-sm text-foreground">
                        {property.bedrooms}
                      </p>
                    </div>
                  )}

                  {property.bathrooms !== undefined && (
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Bathrooms
                      </p>
                      <p className="mt-1 text-sm text-foreground">
                        {property.bathrooms}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Pricing
              </h3>

              <div className="mt-4 rounded-xl border border-border bg-background/40 p-5">
                <p className="text-xs text-muted-foreground">
                  Listed price
                </p>

                <p className="mt-2 text-2xl font-semibold text-primary">
                {formatPrice(property.price, property.currency)}
                </p>

                <p className="mt-2 text-xs capitalize text-muted-foreground">
                  {property.intent}
                </p>
              </div>
            </section>
          </div>

          <section className="mt-6">
            <button
              type="button"
              onClick={() =>
                setShowDescription((current) => !current)
              }
              className="text-sm font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
            >
              Description
            </button>

            {showDescription && (
              <div className="mt-3 rounded-xl border border-border bg-background/40 p-4">
                <p className="text-sm leading-6 text-muted-foreground">
                  {property.description ||
                    'No description provided.'}
                </p>
              </div>
            )}
          </section>

          <section className="mt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Record information
            </h3>

            <div className="mt-4 grid gap-4 rounded-xl border border-border bg-background/40 p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">
                  Created
                </p>

                <p className="mt-1 text-sm text-foreground">
                  {formatDate(property.createdAt)}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Last updated
                </p>

                <p className="mt-1 text-sm text-foreground">
                  {formatDate(property.updatedAt)}
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="flex justify-between gap-3 border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Edit Property
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}