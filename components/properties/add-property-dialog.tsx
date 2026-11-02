'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { createProperty } from '@/lib/api/properties-client'
import type {
  PropertyCurrency,
  PropertyIntent,
  PropertyStatus,
} from '@/lib/types'

type AddPropertyDialogProps = {
  onClose: () => void
  onAddProperty: (property: Awaited<ReturnType<typeof createProperty>>) => void
}

type PropertyFormState = {
  title: string
  propertyType: string
  intent: PropertyIntent
  location: string
  price: string
  currency: PropertyCurrency | ''
  bedrooms: string
  bathrooms: string
  status: PropertyStatus
  description: string
}

const initialFormState: PropertyFormState = {
  title: '',
  propertyType: '',
  intent: 'sale',
  location: '',
  price: '',
  currency: '',
  bedrooms: '',
  bathrooms: '',
  status: 'available',
  description: '',
}

export function AddPropertyDialog({
  onClose,
  onAddProperty,
}: AddPropertyDialogProps) {
  const [form, setForm] =
    useState<PropertyFormState>(initialFormState)

  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Updates one property form field while preserving the other values.
  function updateField(
    field: keyof PropertyFormState,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))

    if (error) {
      setError('')
    }
  }

  // Validates the property form and saves the property to the AVIAAI backend.
  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const title = form.title.trim()
    const propertyType = form.propertyType.trim()
    const location = form.location.trim()
    const description = form.description.trim()

    const price = Number(form.price)

    const bedrooms =
      form.bedrooms.trim() === ''
        ? undefined
        : Number(form.bedrooms)

    const bathrooms =
      form.bathrooms.trim() === ''
        ? undefined
        : Number(form.bathrooms)

    if (!title || !propertyType || !location) {
      setError(
        'Please complete the title, property type, and location.',
      )
      return
    }

    if (!form.price || !Number.isFinite(price) || price <= 0) {
      setError('Please enter a valid price.')
      return
    }

    if (
      bedrooms !== undefined &&
      (!Number.isInteger(bedrooms) || bedrooms < 0)
    ) {
      setError('Bedrooms must be a valid whole number.')
      return
    }

    if (
      bathrooms !== undefined &&
      (!Number.isInteger(bathrooms) || bathrooms < 0)
    ) {
      setError('Bathrooms must be a valid whole number.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const savedProperty = await createProperty({
        title,
        propertyType,
        intent: form.intent,
        status: form.status,
        location,
        bedrooms,
        bathrooms,
        price,
        ...(form.currency ? { currency: form.currency } : {}),
        description: description || undefined,
      })

      onAddProperty(savedProperty)
      onClose()
    } catch (submissionError) {
      console.error(
        '[AVIAAI properties] Create property failed:',
        submissionError,
      )

      setError(
        'We could not save this property. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose()
        }
      }}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-property-title"
      >
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div>
            <h2
              id="add-property-title"
              className="text-xl font-semibold text-foreground"
            >
              Add property
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Add a property to your inventory.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close add property dialog"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="size-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto"
        >
          <div className="grid gap-5 p-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="property-title"
                className="text-sm font-medium text-foreground"
              >
                Property title
              </label>

              <input
                id="property-title"
                type="text"
                value={form.title}
                onChange={(event) =>
                  updateField('title', event.target.value)
                }
                placeholder="e.g. Modern 4-Bedroom Detached Duplex"
                disabled={isSubmitting}
                className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="property-type"
                className="text-sm font-medium text-foreground"
              >
                Property type
              </label>

              <input
                id="property-type"
                type="text"
                value={form.propertyType}
                onChange={(event) =>
                  updateField(
                    'propertyType',
                    event.target.value,
                  )
                }
                placeholder="House, Apartment, Land..."
                disabled={isSubmitting}
                className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="property-location"
                className="text-sm font-medium text-foreground"
              >
                Location
              </label>

              <input
                id="property-location"
                type="text"
                value={form.location}
                onChange={(event) =>
                  updateField('location', event.target.value)
                }
                placeholder="e.g. Maitama"
                disabled={isSubmitting}
                className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="property-intent"
                className="text-sm font-medium text-foreground"
              >
                Intent
              </label>

              <select
                id="property-intent"
                value={form.intent}
                onChange={(event) =>
                  updateField(
                    'intent',
                    event.target.value as PropertyIntent,
                  )
                }
                disabled={isSubmitting}
                className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
              >
                <option value="sale">For sale</option>
                <option value="rent">For rent</option>
                <option value="lease">For lease</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="property-status"
                className="text-sm font-medium text-foreground"
              >
                Status
              </label>

              <select
                id="property-status"
                value={form.status}
                onChange={(event) =>
                  updateField(
                    'status',
                    event.target.value as PropertyStatus,
                  )
                }
                disabled={isSubmitting}
                className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
              >
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="property-price"
                className="text-sm font-medium text-foreground"
              >
                Price
              </label>

              <input
                id="property-price"
                type="number"
                min="1"
                step="1"
                value={form.price}
                onChange={(event) =>
                  updateField('price', event.target.value)
                }
                placeholder="e.g. 185000000"
                disabled={isSubmitting}
                className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="property-currency"
                className="text-sm font-medium text-foreground"
              >
                Currency
              </label>

              <select
                id="property-currency"
                value={form.currency}
                onChange={(event) =>
                  updateField(
                    'currency',
                    event.target.value as PropertyCurrency | '',
                  )
                }
                disabled={isSubmitting}
                className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
              >
                <option value="">Use workspace default</option>
                <option value="USD">USD — US Dollar</option>
                <option value="NGN">NGN — Nigerian Naira</option>
                <option value="AED">AED — UAE Dirham</option>
              </select>

              <p className="mt-1 text-xs text-muted-foreground">
                Leave the default selected to use your workspace currency.
              </p>
            </div>

            <div>
              <label
                htmlFor="property-bedrooms"
                className="text-sm font-medium text-foreground"
              >
                Bedrooms
              </label>

              <input
                id="property-bedrooms"
                type="number"
                min="0"
                step="1"
                value={form.bedrooms}
                onChange={(event) =>
                  updateField('bedrooms', event.target.value)
                }
                placeholder="Optional"
                disabled={isSubmitting}
                className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="property-bathrooms"
                className="text-sm font-medium text-foreground"
              >
                Bathrooms
              </label>

              <input
                id="property-bathrooms"
                type="number"
                min="0"
                step="1"
                value={form.bathrooms}
                onChange={(event) =>
                  updateField('bathrooms', event.target.value)
                }
                placeholder="Optional"
                disabled={isSubmitting}
                className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="property-description"
                className="text-sm font-medium text-foreground"
              >
                Description
              </label>

              <textarea
                id="property-description"
                value={form.description}
                onChange={(event) =>
                  updateField(
                    'description',
                    event.target.value,
                  )
                }
                placeholder="Brief description of the property..."
                rows={4}
                disabled={isSubmitting}
                className="mt-2 w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
              />
            </div>
          </div>

          {error && (
            <div className="mx-6 mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Saving...' : 'Add property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}