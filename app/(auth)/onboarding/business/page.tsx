'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type BusinessType =
  | 'real_estate_agency'
  | 'property_management'
  | 'real_estate_developer'
  | 'property_broker'
  | 'other'

type PropertyCurrency = 'USD' | 'NGN' | 'AED'

type WorkspaceSetupResponse = {
  workspace: {
    id: string
    name: string
    business_type: string
    operating_location: string
  }
}

// Saves the business onboarding information to the authenticated workspace.
async function saveBusinessSetup(
  businessName: string,
  businessType: BusinessType,
  businessLocation: string,
): Promise<WorkspaceSetupResponse> {
  const response = await fetch('http://localhost:8000/workspace/setup', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      business_name: businessName.trim(),
      business_type: businessType,
      operating_location: businessLocation.trim(),
    }),
  })

  if (!response.ok) {
    let message = 'We could not save your business information.'

    try {
      const data = await response.json()

      if (typeof data.detail === 'string') {
        message = data.detail
      }
    } catch {
      // Keep the default message when the backend does not return JSON.
    }

    throw new Error(message)
  }

  return (await response.json()) as WorkspaceSetupResponse
}

// Saves the workspace default currency through the authenticated backend endpoint.
async function saveWorkspaceCurrency(
  defaultCurrency: PropertyCurrency,
): Promise<void> {
  const response = await fetch('http://localhost:8000/workspace/currency', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      default_currency: defaultCurrency,
    }),
  })

  if (!response.ok) {
    let message =
      'Your business details were saved, but the default currency could not be saved.'

    try {
      const data = await response.json()

      if (typeof data.detail === 'string') {
        message = `Your business details were saved, but the currency could not be saved: ${data.detail}`
      }
    } catch {
      // Keep the default message when the backend does not return JSON.
    }

    throw new Error(message)
  }
}

// Renders the first business setup step of AVIAAI onboarding.
export default function BusinessOnboardingPage() {
  const router = useRouter()

  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState<BusinessType | ''>('')
  const [businessLocation, setBusinessLocation] = useState('')
  const [defaultCurrency, setDefaultCurrency] =
    useState<PropertyCurrency>('USD')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Validates the form and saves business details and currency before continuing.
  async function handleContinue() {
    if (isSaving) {
      return
    }

    setError('')

    if (!businessName.trim()) {
      setError('Please enter your business name.')
      return
    }

    if (!businessType) {
      setError('Please select your business type.')
      return
    }

    if (!businessLocation.trim()) {
      setError('Please enter where your business operates.')
      return
    }

    setIsSaving(true)

    try {
      await saveBusinessSetup(
        businessName,
        businessType,
        businessLocation,
      )

      await saveWorkspaceCurrency(defaultCurrency)

      router.push('/onboarding/data')
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'We could not complete your business setup.',
      )
      setIsSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-10">
        <div className="flex items-center justify-between">
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <div className="flex items-center gap-2">
            <img
              src="/avia-logo.png"
              alt="AVIAAI"
              className="h-8 w-8 rounded-lg"
            />

            <span className="text-sm font-semibold text-foreground">
              AVIAAI
            </span>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center py-16">
          <div className="w-full max-w-xl">
            <div className="mb-8">
              <p className="mb-3 text-sm font-medium text-primary">
                Step 1 of 3
              </p>

              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Tell us about your business
              </h1>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Just the basics. We&apos;ll use this information to understand
                your operation and personalize AVIAAI.
              </p>
            </div>

            <div className="space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
              <div className="space-y-2">
                <label
                  htmlFor="business-name"
                  className="text-sm font-medium text-foreground"
                >
                  Business name
                </label>

                <Input
                  id="business-name"
                  name="businessName"
                  type="text"
                  value={businessName}
                  onChange={(event) => setBusinessName(event.target.value)}
                  placeholder="e.g. Harborview Properties"
                  className="h-11 bg-background/50"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="business-type"
                  className="text-sm font-medium text-foreground"
                >
                  What does your business do?
                </label>

                <select
                  id="business-type"
                  name="businessType"
                  value={businessType}
                  onChange={(event) =>
                    setBusinessType(event.target.value as BusinessType | '')
                  }
                  disabled={isSaving}
                  className="h-11 w-full rounded-md border border-input bg-background/50 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="" disabled>
                    Select your business type
                  </option>
                  <option value="real_estate_agency">
                    Real estate agency
                  </option>
                  <option value="property_management">
                    Property management
                  </option>
                  <option value="real_estate_developer">
                    Real estate developer
                  </option>
                  <option value="property_broker">
                    Property broker
                  </option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="business-location"
                  className="text-sm font-medium text-foreground"
                >
                  Where does your business operate?
                </label>

                <Input
                  id="business-location"
                  name="businessLocation"
                  type="text"
                  value={businessLocation}
                  onChange={(event) =>
                    setBusinessLocation(event.target.value)
                  }
                  placeholder="e.g. City, Country"
                  className="h-11 bg-background/50"
                  disabled={isSaving}
                />

                <p className="text-xs text-muted-foreground">
                  You can add more locations later.
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="default-currency"
                  className="text-sm font-medium text-foreground"
                >
                  Default property currency
                </label>

                <select
                  id="default-currency"
                  name="defaultCurrency"
                  value={defaultCurrency}
                  onChange={(event) =>
                    setDefaultCurrency(
                      event.target.value as PropertyCurrency,
                    )
                  }
                  disabled={isSaving}
                  className="h-11 w-full rounded-md border border-input bg-background/50 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="USD">USD — US Dollar</option>
                  <option value="NGN">NGN — Nigerian Naira</option>
                  <option value="AED">AED — UAE Dirham</option>
                </select>

                <p className="text-xs leading-5 text-muted-foreground">
                  New properties will use this currency unless you choose
                  another. Existing property prices and currencies will not
                  be changed.
                </p>
              </div>
            </div>

            {error && (
              <p className="mt-4 text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                onClick={handleContinue}
                disabled={isSaving}
                className="h-11 gap-2 px-6"
              >
                {isSaving ? 'Saving...' : 'Continue'}
                {!isSaving && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}