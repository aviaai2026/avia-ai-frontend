'use client'

import { useState } from 'react'
import { parsePhoneNumberFromString } from 'libphonenumber-js'

type PhoneCountry = 'US' | 'NG' | 'AE' | 'GB'

type PhoneNumberFieldProps = {
  id: string
  defaultValue?: string
}

const supportedCountries: PhoneCountry[] = ['US', 'NG', 'AE', 'GB']

// Renders a phone input with a country selector and detects supported countries from existing international numbers.
export function PhoneNumberField({
  id,
  defaultValue = '',
}: PhoneNumberFieldProps) {
  const [country, setCountry] = useState<PhoneCountry>(() => {
    const detectedCountry = parsePhoneNumberFromString(defaultValue)?.country

    return supportedCountries.includes(detectedCountry as PhoneCountry)
      ? (detectedCountry as PhoneCountry)
      : 'US'
  })

  return (
    <div className="grid grid-cols-[minmax(125px,0.8fr)_minmax(0,1.5fr)] gap-2">
      <select
        name="phone_country"
        value={country}
        onChange={(event) =>
          setCountry(event.target.value as PhoneCountry)
        }
        aria-label="Phone country"
        className="h-10 rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="US">🇺🇸 +1</option>
        <option value="NG">🇳🇬 +234</option>
        <option value="AE">🇦🇪 +971</option>
        <option value="GB">🇬🇧 +44</option>
      </select>

      <input
        id={id}
        name="phone"
        type="tel"
        required
        defaultValue={defaultValue}
        placeholder="Phone number"
        autoComplete="tel"
        className="h-10 min-w-0 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  )
}