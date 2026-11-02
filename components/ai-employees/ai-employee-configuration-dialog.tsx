
'use client'

import {
  AlertTriangle,
  Check,
  Globe,
  MessageCircle,
  RotateCcw,
  Save,
  ShieldCheck,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'

export type EmployeeConfiguration = {
  channels: {
    whatsapp: boolean
    instagram: boolean
    website: boolean
  }
  qualification: {
    intent: boolean
    budget: boolean
    location: boolean
    propertyType: boolean
    bedrooms: boolean
  }
  actions: {
    qualifyLeads: boolean
    searchProperties: boolean
    sendMessages: boolean
    updateLeads: boolean
  }
  escalation: {
    outsideRules: boolean
    uncertainProperty: boolean
    commercialDecision: boolean
    missingInformation: boolean
  }
}

// Returns the default configuration used when an employee has no saved settings.
export function getDefaultConfiguration(): EmployeeConfiguration {
  return {
    channels: {
      whatsapp: true,
      instagram: true,
      website: true,
    },
    qualification: {
      intent: true,
      budget: true,
      location: true,
      propertyType: true,
      bedrooms: true,
    },
    actions: {
      qualifyLeads: true,
      searchProperties: true,
      sendMessages: true,
      updateLeads: true,
    },
    escalation: {
      outsideRules: true,
      uncertainProperty: true,
      commercialDecision: true,
      missingInformation: false,
    },
  }
}

// Returns a human-readable label for each configuration option.
function getLabel(key: string) {
  const labels: Record<string, string> = {
    whatsapp: 'WhatsApp',
    instagram: 'Instagram',
    website: 'Website',
    intent: 'Buying or renting intent',
    budget: 'Budget',
    location: 'Preferred location',
    propertyType: 'Property type',
    bedrooms: 'Number of bedrooms',
    qualifyLeads: 'Qualify incoming leads',
    searchProperties: 'Search approved properties',
    sendMessages: 'Send approved customer messages',
    updateLeads: 'Update lead records',
    outsideRules: 'Requests outside company rules',
    uncertainProperty: 'Uncertain property information',
    commercialDecision: 'Sensitive commercial decisions',
    missingInformation: 'Missing qualification information',
  }

  return labels[key] ?? key
}

// Returns the description for each configuration option.
function getDescription(key: string) {
  const descriptions: Record<string, string> = {
    whatsapp: 'Allow the employee to communicate through WhatsApp.',
    instagram: 'Allow the employee to communicate through Instagram.',
    website: 'Allow the employee to handle website inquiries.',
    intent: 'Ask whether the customer wants to buy, rent, or lease.',
    budget: 'Collect the customer budget before recommending properties.',
    location: 'Collect the customer preferred area or location.',
    propertyType: 'Collect the type of property the customer wants.',
    bedrooms: 'Collect bedroom requirements when relevant.',
    qualifyLeads:
      'Automatically move a lead through the qualification process.',
    searchProperties:
      'Search only approved property inventory using customer requirements.',
    sendMessages:
      'Send messages using approved communication templates and rules.',
    updateLeads:
      'Update approved lead fields after relevant customer interactions.',
    outsideRules:
      'Stop and escalate whenever a request falls outside company rules.',
    uncertainProperty:
      'Stop when property information cannot be confidently verified.',
    commercialDecision:
      'Require human involvement for sensitive commercial or financial decisions.',
    missingInformation:
      'Escalate immediately when required qualification information is missing.',
  }

  return descriptions[key] ?? ''
}

type AIEmployeeConfigurationDialogProps = {
  employee: {
    id: string
    name: string
  } | null
  configuration: EmployeeConfiguration
  onSaveConfiguration: (
    employeeId: string,
    configuration: EmployeeConfiguration,
  ) => Promise<void>
  onClose: () => void
}

export function AIEmployeeConfigurationDialog({
  employee,
  configuration,
  onSaveConfiguration,
  onClose,
}: AIEmployeeConfigurationDialogProps) {
  const [draftConfiguration, setDraftConfiguration] =
    useState<EmployeeConfiguration>(configuration)

  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Allows LEE and REVA to use the shared employee configuration form.
const supportsConfiguration =
employee?.id === 'lead-employee' ||
employee?.id === 'lead-revival-employee'

  // Synchronizes the editable draft whenever the selected employee or loaded configuration changes.
  // Synchronizes the draft when a different employee or configuration is loaded.
useEffect(() => {
  setDraftConfiguration(configuration)
  setSaveError(null)
}, [employee?.id, configuration])
  // Updates one configuration option and marks the draft as needing to be saved.
  function updateConfiguration(
    section: keyof EmployeeConfiguration,
    key: string,
  ) {
    setSaved(false)
    setSaveError(null)

    setDraftConfiguration((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [key]: !current[section][
          key as keyof (typeof current)[typeof section]
        ],
      },
    }))
  }

  // Saves the current draft and preserves the success state until the next edit.
  async function handleSave() {
    if (!employee || saving || saved) {
      return
    }

    setSaving(true)
    setSaveError(null)

    try {
      await onSaveConfiguration(employee.id, draftConfiguration)
      setSaved(true)
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : 'Unable to save configuration. Please try again.',
      )
    } finally {
      setSaving(false)
    }
  }

  // Restores the current draft to default settings without saving automatically.
  function handleReset() {
    setDraftConfiguration(getDefaultConfiguration())
    setSaved(false)
    setSaveError(null)
  }

  if (!employee) {
    return null
  }

  if (!supportsConfiguration) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-primary">
                Employee configuration
              </p>

              <h2 className="mt-1 text-xl font-semibold text-foreground">
                {employee.name}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Close configuration"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="mt-6 rounded-xl border border-border bg-background/40 p-5">
            <p className="text-sm text-muted-foreground">
              Configuration controls for this employee will reuse the
              same AVIA configuration system once its V1 workflow is
              activated.
            </p>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  const sections = [
    {
      title: 'Connected channels',
      description:
        'Choose where this employee is allowed to handle incoming conversations.',
      section: 'channels' as const,
      keys: ['whatsapp', 'instagram', 'website'],
      icons: {
        whatsapp: MessageCircle,
        instagram: MessageCircle,
        website: Globe,
      },
    },
    {
      title: 'Required qualification',
      description:
        'Define the information the employee should collect before recommending properties.',
      section: 'qualification' as const,
      keys: ['intent', 'budget', 'location', 'propertyType', 'bedrooms'],
    },
    {
      title: 'Automatic actions',
      description:
        'Define the operational work the employee can perform automatically.',
      section: 'actions' as const,
      keys: [
        'qualifyLeads',
        'searchProperties',
        'sendMessages',
        'updateLeads',
      ],
    },
    {
      title: 'Human escalation',
      description:
        'Define situations where the employee must stop and involve a human.',
      section: 'escalation' as const,
      keys: [
        'outsideRules',
        'uncertainProperty',
        'commercialDecision',
        'missingInformation',
      ],
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between gap-5 border-b border-border p-6">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              Employee configuration
            </p>

            <h2 className="mt-1 text-xl font-semibold text-foreground sm:text-2xl">
              Configure {employee.name}
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Control the channels, qualification rules, automatic
              actions, and escalation boundaries for this employee.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close configuration"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />

              <div>
                <p className="text-sm font-medium text-foreground">
                  Configuration boundary
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  These controls define the intended employee behavior.
                  Production enforcement must happen in the AVIA backend
                  before any AI action is executed.
                </p>
              </div>
            </div>

            {sections.map((section) => (
              <section
                key={section.title}
                className="rounded-xl border border-border bg-background/30 p-5"
              >
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {section.title}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {section.description}
                  </p>
                </div>

                <div className="mt-5 divide-y divide-border">
                  {section.keys.map((key) => {
                    const sectionState =
                      draftConfiguration[section.section]

                    const enabled =
                      sectionState[
                        key as keyof typeof sectionState
                      ] as boolean

                    const Icon =
                      'icons' in section &&
                      section.icons &&
                      key in section.icons
                        ? section.icons[
                            key as keyof typeof section.icons
                          ]
                        : null

                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between gap-5 py-4 first:pt-0 last:pb-0"
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          {Icon ? (
                            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-primary">
                              <Icon className="size-4" />
                            </div>
                          ) : (
                            <div
                              className={`mt-1 flex size-2 shrink-0 rounded-full ${
                                enabled
                                  ? 'bg-primary'
                                  : 'bg-muted-foreground/40'
                              }`}
                            />
                          )}

                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {getLabel(key)}
                            </p>

                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                              {getDescription(key)}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          role="switch"
                          aria-label={getLabel(key)}
                          aria-checked={enabled}
                          disabled={saving}
                          onClick={() =>
                            updateConfiguration(section.section, key)
                          }
                          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                            enabled ? 'bg-primary' : 'bg-secondary'
                          }`}
                        >
                          <span
                            className={`absolute top-1 size-4 rounded-full bg-white transition-transform ${
                              enabled ? 'left-6' : 'left-1'
                            }`}
                          />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}

            <section className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-400" />

                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Permanent safety boundaries
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Some actions are intentionally outside the employee's
                    authority and cannot be enabled from this screen.
                  </p>

                  <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                    <p>• No unauthorized financial decisions</p>
                    <p>• No destructive record deletion</p>
                    <p>• No invented property information</p>
                    <p>• No fabricated customer information</p>
                    <p>• No actions outside backend permissions</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-5">
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RotateCcw className="size-4" />
            Reset
          </button>

          <div className="flex flex-wrap items-center justify-end gap-3">
            {saveError && (
              <p role="alert" className="max-w-xs text-xs text-destructive">
                {saveError}
              </p>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || saved}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {saved ? (
                <Check className="size-4" />
              ) : (
                <Save className="size-4" />
              )}

              {saving
                ? 'Saving...'
                : saved
                  ? 'Saved configuration'
                  : 'Save configuration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
