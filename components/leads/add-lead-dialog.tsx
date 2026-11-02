'use client'

import { useState } from 'react'
import type {
  Lead,
  LeadIntent,
  LeadSource,
  PropertyCurrency,
} from '@/lib/types'
import { createLead } from '@/lib/api/leads-client'
import { PhoneNumberField } from '@/components/leads/phone-number-field'
type AddLeadDialogProps = {
  open: boolean
  onClose: () => void
  onLeadCreated: (lead: Lead) => void
  defaultCurrency: PropertyCurrency
}

export function AddLeadDialog({
  open,
  onClose,
  onLeadCreated,
  defaultCurrency,
}: AddLeadDialogProps) {
  const [intent, setIntent] = useState<LeadIntent>('rent')
  const [source, setSource] = useState<LeadSource>('website')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!open) {
    return null
  }

  // Submits the lead form to the real AVIAAI backend and updates the leads page.
  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    setError('')

    const formData = new FormData(event.currentTarget)

    const name = String(formData.get('name') ?? '').trim()
    const phone = String(formData.get('phone') ?? '').trim()

    const phoneCountry = String(
      formData.get('phone_country') ?? 'US',
    ) as 'US' | 'NG' | 'AE' | 'GB'
    if (!name || !phone) {
      setError('Full name and phone are required.')
      return
    }

    const budgetValue = String(formData.get('budget') ?? '').trim()
    const budget = budgetValue ? Number(budgetValue) : undefined

    if (
      budgetValue &&
      (budget === undefined ||
        !Number.isFinite(budget) ||
        budget < 0)
    ) {
      setError('Please enter a valid budget.')
      return
    }
    setIsSubmitting(true)

    try {
      const newLead = await createLead({
        name,
        phone,
        phoneCountry,
        email:
          String(formData.get('email') ?? '').trim() || undefined,
        intent,
        source,
        propertyType:
          String(formData.get('propertyType') ?? '').trim() ||
          undefined,
        location:
          String(formData.get('location') ?? '').trim() || undefined,
        budget,
        budgetCurrency:
  budget !== undefined
    ? (String(formData.get('budgetCurrency')) as PropertyCurrency)
    : undefined,
        timeline:
          String(formData.get('timeline') ?? '').trim() || undefined,
      })

      onLeadCreated(newLead)
      onClose()
    } catch (error) {
      console.error('[AVIAAI leads] Create lead failed:', error)
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to create lead. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-lead-title"
    >
      <div className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div>
            <h2
              id="add-lead-title"
              className="text-lg font-semibold text-foreground"
            >
              Add Lead
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Create a new lead for your workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close add lead dialog"
            className="rounded-md px-2 py-1 text-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-5 p-6"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <label
                htmlFor="lead-name"
                className="text-sm font-medium text-foreground"
              >
                Full name
              </label>

              <input
                id="lead-name"
                name="name"
                type="text"
                required
                placeholder="e.g. Amina Yusuf"
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="lead-phone"
                className="text-sm font-medium text-foreground"
              >
                Phone
              </label>

              <PhoneNumberField id="lead-phone" />
            </div>
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="lead-email"
              className="text-sm font-medium text-foreground"
            >
              Email
            </label>

            <input
              id="lead-email"
              name="email"
              type="email"
              placeholder="amina@example.com"
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <label
                htmlFor="lead-intent"
                className="text-sm font-medium text-foreground"
              >
                Intent
              </label>

              <select
                id="lead-intent"
                name="intent"
                value={intent}
                onChange={(event) =>
                  setIntent(event.target.value as LeadIntent)
                }
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="buy">Buy</option>
                <option value="rent">Rent</option>
                <option value="sell">Sell</option>
                <option value="invest">Invest</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="lead-source"
                className="text-sm font-medium text-foreground"
              >
                Source
              </label>

              <select
                id="lead-source"
                name="source"
                value={source}
                onChange={(event) =>
                  setSource(event.target.value as LeadSource)
                }
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="instagram">Instagram</option>
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="manual">Manual</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <label
                htmlFor="lead-property-type"
                className="text-sm font-medium text-foreground"
              >
                Property type
              </label>

              <input
                id="lead-property-type"
                name="propertyType"
                type="text"
                placeholder="e.g. Apartment"
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="lead-location"
                className="text-sm font-medium text-foreground"
              >
                Preferred location
              </label>

              <input
                id="lead-location"
                name="location"
                type="text"
                placeholder="e.g. Maitama"
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>


          <div className="grid gap-5 sm:grid-cols-2">
  <div className="grid gap-2">
    <label
      htmlFor="lead-budget"
      className="text-sm font-medium text-foreground"
    >
      Budget
    </label>

    <input
      id="lead-budget"
      name="budget"
      type="number"
      min="0"
      placeholder="e.g. 8000000"
      className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
    />

    <label
      htmlFor="lead-budget-currency"
      className="text-sm font-medium text-foreground"
    >
      Budget Currency
    </label>

    <select
      id="lead-budget-currency"
      name="budgetCurrency"
      defaultValue={defaultCurrency}
      className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <option value="USD">USD — US Dollar</option>
      <option value="NGN">NGN — Nigerian Naira</option>
      <option value="AED">AED — UAE Dirham</option>
    </select>
  </div>

  <div className="grid gap-2">
    <label
      htmlFor="lead-timeline"
      className="text-sm font-medium text-foreground"
    >
      Timeline
    </label>

    <input
      id="lead-timeline"
      name="timeline"
      type="text"
      placeholder="e.g. Within 30 days"
      className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
    />
  </div>
</div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-border pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 rounded-lg border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}