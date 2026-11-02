
'use client'

import { useState } from 'react'
import type {
  Lead,
  LeadIntent,
  LeadSource,
  LeadStatus,
  PropertyCurrency,
} from '@/lib/types'
import { updateLead } from '@/lib/api/leads-client'
import { PhoneNumberField } from '@/components/leads/phone-number-field'

type EditLeadDialogProps = {
  lead: Lead | null
  onClose: () => void
  onLeadUpdated: (lead: Lead) => void
  defaultCurrency: PropertyCurrency
}

export function EditLeadDialog({
  lead,
  onClose,
  onLeadUpdated,
  defaultCurrency,
}: EditLeadDialogProps) {
  const [intent, setIntent] = useState<LeadIntent>(
    lead?.intent ?? 'rent',
  )

  const [source, setSource] = useState<LeadSource>(
    lead?.source ?? 'website',
  )

  const [status, setStatus] = useState<LeadStatus>(
    lead?.status ?? 'new',
  )

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!lead) {
    return null
  }

  // Submits the edited lead while preserving unchanged phone records.
  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!lead || isSubmitting) {
      return
    }

    setError('')

    const formData = new FormData(event.currentTarget)

    const name = String(formData.get('name') ?? '').trim()
    const phone = String(formData.get('phone') ?? '').trim()
    const phoneChanged = phone !== lead.phone

    const phoneCountry = String(
      formData.get('phone_country') ?? 'US',
    ) as 'US' | 'NG' | 'AE' | 'GB'

    if (!name || !phone) {
      setError('Full name and phone are required.')
      return
    }

    const budgetValue = String(
      formData.get('budget') ?? '',
    ).trim()

    const budget = budgetValue
      ? Number(budgetValue)
      : undefined

    if (
      budgetValue &&
      (budget === undefined ||
        !Number.isFinite(budget) ||
        budget < 0)
    ) {
      setError('Please enter a valid budget.')
      return
    }

    const budgetCurrencyValue = String(
      formData.get('budgetCurrency') ?? '',
    ).trim()

    const budgetChanged = budget !== (lead.budget ?? undefined)

    if (
      budget !== undefined &&
      budgetChanged &&
      !budgetCurrencyValue
    ) {
      setError('Please select a currency for the updated budget.')
      return
    }

    const budgetCurrency = budgetCurrencyValue
      ? (budgetCurrencyValue as PropertyCurrency)
      : undefined

    setIsSubmitting(true)

    try {
      const updatedLead = await updateLead(lead.id, {
        name,
        ...(phoneChanged
          ? {
              phone,
              phoneCountry,
            }
          : {}),
        intent,
        source,
        status,
        propertyType:
          String(formData.get('propertyType') ?? '').trim() ||
          undefined,
        location:
          String(formData.get('location') ?? '').trim() ||
          undefined,
        budget,
        budgetCurrency,
        timeline:
          String(formData.get('timeline') ?? '').trim() ||
          undefined,
      })

      onLeadUpdated({
        ...updatedLead,
        email:
          String(formData.get('email') ?? '').trim() ||
          undefined,
      })

      onClose()
    } catch (error) {
      console.error(
        '[AVIAAI leads] Update lead failed:',
        error,
      )

      setError(
        error instanceof Error
          ? error.message
          : 'Unable to update lead. Please try again.',
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
      aria-labelledby="edit-lead-title"
    >
      <div className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div>
            <h2
              id="edit-lead-title"
              className="text-lg font-semibold text-foreground"
            >
              Edit Lead
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Update the lead information.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close edit lead dialog"
            className="rounded-md px-2 py-1 text-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
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
                htmlFor="edit-lead-name"
                className="text-sm font-medium text-foreground"
              >
                Full name
              </label>

              <input
                id="edit-lead-name"
                name="name"
                type="text"
                required
                defaultValue={lead.name}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="edit-lead-status"
                className="text-sm font-medium text-foreground"
              >
                Status
              </label>

              <select
                id="edit-lead-status"
                name="status"
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as LeadStatus,
                  )
                }
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="viewing">Viewing</option>
                <option value="negotiating">Negotiating</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="edit-lead-phone"
                className="text-sm font-medium text-foreground"
              >
                Phone
              </label>

              <PhoneNumberField
                 key={lead.id}
                id="edit-lead-phone"
                defaultValue={lead.phone}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="edit-lead-email"
              className="text-sm font-medium text-foreground"
            >
              Email
            </label>

            <input
              id="edit-lead-email"
              name="email"
              type="email"
              defaultValue={lead.email ?? ''}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <label
                htmlFor="edit-lead-intent"
                className="text-sm font-medium text-foreground"
              >
                Intent
              </label>

              <select
                id="edit-lead-intent"
                name="intent"
                value={intent}
                onChange={(event) =>
                  setIntent(
                    event.target.value as LeadIntent,
                  )
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
                htmlFor="edit-lead-source"
                className="text-sm font-medium text-foreground"
              >
                Source
              </label>

              <select
                id="edit-lead-source"
                name="source"
                value={source}
                onChange={(event) =>
                  setSource(
                    event.target.value as LeadSource,
                  )
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
                htmlFor="edit-lead-property-type"
                className="text-sm font-medium text-foreground"
              >
                Property type
              </label>

              <input
                id="edit-lead-property-type"
                name="propertyType"
                type="text"
                defaultValue={lead.propertyType ?? ''}
                placeholder="e.g. Apartment"
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="edit-lead-location"
                className="text-sm font-medium text-foreground"
              >
                Preferred location
              </label>

              <input
                id="edit-lead-location"
                name="location"
                type="text"
                defaultValue={lead.location ?? ''}
                placeholder="e.g. Maitama"
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <label
                htmlFor="edit-lead-budget"
                className="text-sm font-medium text-foreground"
              >
                Budget
              </label>

              <input
                id="edit-lead-budget"
                name="budget"
                type="number"
                min="0"
                defaultValue={lead.budget ?? ''}
                placeholder="e.g. 8000000"
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />

              <label
                htmlFor="edit-lead-budget-currency"
                className="text-sm font-medium text-foreground"
              >
                Budget Currency
              </label>

              <select
                id="edit-lead-budget-currency"
                name="budgetCurrency"
                defaultValue={
                  lead.budget !== undefined && lead.budget !== null
                    ? lead.budgetCurrency ?? ''
                    : defaultCurrency
                }
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {lead.budget !== undefined &&
                  lead.budget !== null &&
                  !lead.budgetCurrency && (
                    <option value="">
                      Currency not recorded
                    </option>
                  )}

                <option value="USD">USD — US Dollar</option>
                <option value="NGN">NGN — Nigerian Naira</option>
                <option value="AED">AED — UAE Dirham</option>
              </select>

              {lead.budget !== undefined &&
                lead.budget !== null &&
                !lead.budgetCurrency && (
                  <p className="text-xs text-muted-foreground">
                    This lead's original budget currency is unknown.
                    Select a currency if you change its budget.
                  </p>
                )}
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="edit-lead-timeline"
                className="text-sm font-medium text-foreground"
              >
                Timeline
              </label>

              <input
                id="edit-lead-timeline"
                name="timeline"
                type="text"
                defaultValue={lead.timeline ?? ''}
                placeholder="e.g. Within 30 days"
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          {error && (
            <p
              className="text-sm text-destructive"
              role="alert"
            >
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
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
