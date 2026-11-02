
'use client'

import {
  BarChart3,
  Bot,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Headphones,
  Megaphone,
  Phone,
  Settings2,
  Sparkles,
  Wrench,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

import { AIEmployeeDetailsDialog } from './ai-employee-details-dialog'
import {
  AIEmployeeConfigurationDialog,
  getDefaultConfiguration,
  type EmployeeConfiguration,
} from './ai-employee-configuration-dialog'
import { AIEmployeeExecutionDialog } from './ai-employee-execution-dialog'

import {
  getEmployeeConfiguration,
  saveEmployeeConfiguration,
} from '@/lib/api/ai-employees'
import type { WorkspaceRole } from '@/lib/types'
import { AIEscalationsPanel } from '@/components/ai-employees/ai-escalations-panel'

type EmployeeStatus = 'active' | 'coming-soon'

type EmployeePermission = {
  name: string
  description: string
  access: 'allowed' | 'restricted'
}

type AIEmployee = {
  id: string
  name: string
  description: string
  status: EmployeeStatus
  icon: typeof Bot
  capabilities: string[]
  responsibilities: string[]
  permissions: EmployeePermission[]
  connectedSystems: string[]
  humanOversight: string[]
}

// Defines the AI Employees available in the AVIA platform.
const aiEmployees: AIEmployee[] = [
  {
    id: 'lead-employee',
    name: 'LEE',
    description:
      'Qualifies leads, answers approved customer questions, finds suitable properties, coordinates viewings, and manages follow-up throughout the sales workflow.',
    status: 'active',
    icon: Sparkles,
    capabilities: [
      'Qualify incoming leads',
      'Understand customer requirements and preferences',
      'Answer customer questions using approved company information',
      'Search approved properties and check recorded availability',
      'Recommend relevant properties based on customer requirements',
      'Coordinate property viewings and appointments',
      'Create and update lead records',
      'Manage follow-up tasks and approved reminders',
      'Escalate complex or sensitive requests to a human',
    ],
    responsibilities: [
      'Understand incoming customer intent and requirements',
      'Collect and maintain important lead information',
      'Match qualified leads with suitable, approved properties',
      'Verify recorded property information before making recommendations',
      'Answer customer questions using approved company knowledge',
      'Coordinate viewings and the next appropriate sales action',
      'Keep lead records and follow-up tasks up to date',
      'Identify inactive or unresponsive leads for appropriate follow-up',
      'Escalate situations outside its authority to a human',
    ],
    permissions: [
      {
        name: 'Read lead records',
        description:
          'Can access lead information required for qualification and follow-up.',
        access: 'allowed',
      },
      {
        name: 'Create lead records',
        description:
          'Can create a lead when a new qualified inquiry is received.',
        access: 'allowed',
      },
      {
        name: 'Update lead records',
        description:
          'Can update approved lead fields during qualification and follow-up.',
        access: 'allowed',
      },
      {
        name: 'Search property inventory',
        description:
          'Can search approved property records using customer requirements and recorded availability.',
        access: 'allowed',
      },
      {
        name: 'Send customer messages',
        description:
          'Can send messages through approved connected channels and configured messaging rules.',
        access: 'allowed',
      },
      {
        name: 'Coordinate appointments',
        description:
          'Can coordinate viewing requests; confirmed bookings require an authorized, connected scheduling workflow.',
        access: 'restricted',
      },
      {
        name: 'Manage follow-up tasks',
        description:
          'Can manage follow-up only through authorized backend actions and configured task or reminder integrations.',
        access: 'restricted',
      },
      {
        name: 'Delete important records',
        description:
          'Destructive record deletion requires authorized human action.',
        access: 'restricted',
      },
      {
        name: 'Financial decisions',
        description:
          'Cannot make unauthorized financial or commercial decisions.',
        access: 'restricted',
      },
    ],
    connectedSystems: [
      'Leads',
      'Conversations',
      'Properties',
      'Appointments',
      'Company Knowledge',
      'Follow-Up Tasks',
    ],
    humanOversight: [
      'Escalate when a customer request falls outside approved rules.',
      'Escalate when property information or availability is unavailable or uncertain.',
      'Escalate sensitive commercial, financial, or contractual decisions.',
      'Require authorized scheduling workflows before confirming appointments.',
      'Never invent property information, availability, appointments, or customer records.',
      'Record production actions in the audit trail.',
    ],
  },
  {
    id: 'lead-revival-employee',
    name: 'REVA',
    description:
      'Re-engages cold and inactive leads, discovers updated requirements, and brings qualified opportunities back into the sales workflow.',
    status: 'active',
    icon: Megaphone,
    capabilities: [
      'Identify inactive leads',
      'Send approved re-engagement messages',
      'Requalify customer requirements',
      'Update lead information',
      'Return qualified leads to sales',
      'Escalate when needed',
    ],
    responsibilities: [
      'Identify leads that need re-engagement',
      'Start approved revival conversations',
      'Discover changed customer requirements',
      'Update relevant lead information',
      'Return qualified opportunities to the active pipeline',
      'Escalate sensitive or uncertain situations',
    ],
    permissions: [
      {
        name: 'Read inactive leads',
        description:
          'Can access approved inactive lead records for revival.',
        access: 'allowed',
      },
      {
        name: 'Send re-engagement messages',
        description:
          'Can send approved messages through connected channels.',
        access: 'allowed',
      },
      {
        name: 'Update lead records',
        description:
          'Can update approved qualification information.',
        access: 'allowed',
      },
      {
        name: 'Search properties',
        description:
          'Can search approved inventory when a revived lead is qualified.',
        access: 'allowed',
      },
      {
        name: 'Delete leads',
        description:
          'Lead deletion remains outside the employee scope.',
        access: 'restricted',
      },
      {
        name: 'Financial decisions',
        description:
          'Cannot make unauthorized financial or commercial decisions.',
        access: 'restricted',
      },
    ],
    connectedSystems: ['Leads', 'Conversations', 'Properties'],
    humanOversight: [
      'Respect company rules for re-engagement frequency and messaging.',
      'Escalate when a customer requests something outside approved rules.',
      'Never fabricate previous conversations or customer information.',
      'Escalate sensitive commercial decisions.',
    ],
  },
  {
    id: 'property-employee',
    name: 'Property Employee',
    description:
      'Manages property information, availability, and inventory using approved company data.',
    status: 'coming-soon',
    icon: Bot,
    capabilities: [
      'Manage property information',
      'Check availability',
      'Update inventory',
    ],
    responsibilities: [],
    permissions: [],
    connectedSystems: [],
    humanOversight: [],
  },
  {
    id: 'appointment-employee',
    name: 'Appointment Employee',
    description:
      'Coordinates property viewings and other appointments using approved calendar and availability data.',
    status: 'coming-soon',
    icon: CalendarDays,
    capabilities: [
      'Check availability',
      'Schedule appointments',
      'Reschedule appointments',
    ],
    responsibilities: [],
    permissions: [],
    connectedSystems: [],
    humanOversight: [],
  },
  {
    id: 'maintenance-employee',
    name: 'Maintenance Employee',
    description:
      'Helps coordinate maintenance requests, approvals, service providers, and issue tracking.',
    status: 'coming-soon',
    icon: Wrench,
    capabilities: [
      'Classify maintenance requests',
      'Coordinate service providers',
      'Track maintenance issues',
    ],
    responsibilities: [],
    permissions: [],
    connectedSystems: [],
    humanOversight: [],
  },
  {
    id: 'customer-support-employee',
    name: 'Customer Support Employee',
    description:
      'Handles customer questions using approved company knowledge and escalation rules.',
    status: 'coming-soon',
    icon: Headphones,
    capabilities: [
      'Answer approved questions',
      'Use company knowledge',
      'Escalate complex issues',
    ],
    responsibilities: [],
    permissions: [],
    connectedSystems: [],
    humanOversight: [],
  },
  {
    id: 'follow-up-employee',
    name: 'Follow-Up Employee',
    description:
      'Helps ensure important opportunities and customer conversations do not get forgotten.',
    status: 'coming-soon',
    icon: Clock3,
    capabilities: [
      'Monitor follow-up tasks',
      'Send approved reminders',
      'Surface overdue opportunities',
    ],
    responsibilities: [],
    permissions: [],
    connectedSystems: [],
    humanOversight: [],
  },
  {
    id: 'operations-employee',
    name: 'Operations Employee',
    description:
      'Monitors operational workflows, identifies process gaps, and helps teams keep important business tasks moving.',
    status: 'coming-soon',
    icon: Settings2,
    capabilities: [
      'Monitor operational workflows',
      'Identify process gaps',
      'Surface operational issues',
    ],
    responsibilities: [],
    permissions: [],
    connectedSystems: [],
    humanOversight: [],
  },
  {
    id: 'analytics-reporting-employee',
    name: 'Analytics/Reporting Employee',
    description:
      'Turns approved business data into useful reports, summaries, and operational insights for decision makers.',
    status: 'coming-soon',
    icon: BarChart3,
    capabilities: [
      'Generate business reports',
      'Summarize operational data',
      'Surface important trends',
    ],
    responsibilities: [],
    permissions: [],
    connectedSystems: [],
    humanOversight: [],
  },
  {
    id: 'call-employee',
    name: 'Call Employee',
    description:
      'Handles approved voice interactions and supports AI Employees during phone-based customer conversations.',
    status: 'coming-soon',
    icon: Phone,
    capabilities: [
      'Handle approved voice conversations',
      'Capture conversation information',
      'Escalate calls to humans',
    ],
    responsibilities: [],
    permissions: [],
    connectedSystems: [],
    humanOversight: [],
  },
]

// Shows only the employees included in the current MVP plan.
const visibleAiEmployees = aiEmployees.filter(
  (employee) =>
    ![
      'property-employee',
      'appointment-employee',
      'customer-support-employee',
      'follow-up-employee',
    ].includes(employee.id),
)

// Returns the visual styling for an employee's configuration availability.
function getStatusStyles(status: EmployeeStatus) {
  if (status === 'active') {
    return {
      label: 'Available to Configure',
      className: 'border-primary/20 bg-primary/10 text-primary',
    }
  }

  return {
    label: 'Coming Soon',
    className: 'border-border bg-muted text-muted-foreground',
  }
}

type AIEmployeesContentProps = {
  workspaceRole: WorkspaceRole
  currentUserId: string
}

// Renders AI Employee cards and workspace-aware operational controls.
export function AIEmployeesContent({
  workspaceRole,
  currentUserId,
}: AIEmployeesContentProps) {
  const searchParams = useSearchParams()

  const [selectedEmployee, setSelectedEmployee] =
    useState<AIEmployee | null>(null)

  const [activeView, setActiveView] = useState<
    'employees' | 'escalations'
  >('employees')

  // Opens the Escalations view when a notification links to a specific escalation.
  useEffect(() => {
    if (searchParams.get('escalationId')) {
      setActiveView('escalations')
    }
  }, [searchParams])

  const [configuringEmployee, setConfiguringEmployee] =
    useState<AIEmployee | null>(null)

  const [executingEmployee, setExecutingEmployee] =
    useState<AIEmployee | null>(null)

  const [employeeConfigurations, setEmployeeConfigurations] =
    useState<Record<string, EmployeeConfiguration>>({
      'lead-employee': getDefaultConfiguration(),
      'lead-revival-employee': getDefaultConfiguration(),
    })

  const [configurationLoadState, setConfigurationLoadState] =
    useState<'loading' | 'ready' | 'error'>('loading')

  const isConfigurationReady = configurationLoadState === 'ready'

  const [configurationLoadError, setConfigurationLoadError] =
    useState<string | null>(null)

  // Loads saved configurations for both supported employees from the backend.
  useEffect(() => {
    let cancelled = false

    // Retrieves both configurations before enabling configuration saves.
    async function loadConfigurations() {
      try {
        const [lead, revival] = await Promise.all([
          getEmployeeConfiguration('lead-employee'),
          getEmployeeConfiguration('lead-revival-employee'),
        ])

        if (cancelled) {
          return
        }

        setEmployeeConfigurations({
          'lead-employee':
            lead.configuration ?? getDefaultConfiguration(),
          'lead-revival-employee':
            revival.configuration ?? getDefaultConfiguration(),
        })

        setConfigurationLoadError(null)
        setConfigurationLoadState('ready')
      } catch (error) {
        if (cancelled) {
          return
        }

        setConfigurationLoadError(
          error instanceof Error
            ? error.message
            : 'Could not load employee configurations.',
        )
        setConfigurationLoadState('error')
      }
    }

    void loadConfigurations()

    return () => {
      cancelled = true
    }
  }, [])

  // Opens the configuration dialog only after saved settings finish loading.
  function openConfiguration(employee: AIEmployee) {
    if (!isConfigurationReady) {
      return
    }

    setConfiguringEmployee(employee)
  }

  // Saves settings on the backend before updating the displayed configuration.
  async function handleConfigurationSaved(
    employeeId: string,
    configuration: EmployeeConfiguration,
  ): Promise<void> {
    if (configurationLoadState !== 'ready') {
      throw new Error(
        'Employee settings are not ready. Refresh the page and try again.',
      )
    }

    if (
      employeeId !== 'lead-employee' &&
      employeeId !== 'lead-revival-employee'
    ) {
      throw new Error('Invalid employee ID.')
    }

    const result = await saveEmployeeConfiguration(
      employeeId,
      configuration,
    )

    if (!result.configuration) {
      throw new Error(
        'The backend did not return the saved configuration.',
      )
    }

    setEmployeeConfigurations((current) => ({
      ...current,
      [employeeId]: result.configuration!,
    }))
  }

  return (
    <div className="space-y-8">
      <div className="max-w-3xl">
        <p className="text-sm font-medium text-primary">
          AVIA AI Employees
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          AI Employees that do real operational work.
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
          Deploy specialized AI Employees with defined capabilities,
          permissions, and human oversight across your real estate
          operations.
        </p>
      </div>

      {/* Switches between employee management and escalation monitoring. */}
      <div
        role="tablist"
        aria-label="AI operations views"
        className="flex flex-wrap gap-2 border-b border-border pb-3"
      >
        <button
          type="button"
          role="tab"
          id="ai-employees-tab"
          aria-selected={activeView === 'employees'}
          aria-controls="ai-employees-view"
          onClick={() => setActiveView('employees')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            activeView === 'employees'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-accent'
          }`}
        >
          AI Employees
        </button>

        <button
          type="button"
          role="tab"
          id="ai-escalations-tab"
          aria-selected={activeView === 'escalations'}
          aria-controls="ai-escalations-view"
          onClick={() => setActiveView('escalations')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            activeView === 'escalations'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-accent'
          }`}
        >
          AI Escalations
        </button>
      </div>

      {configurationLoadState === 'loading' && (
        <p role="status" className="text-sm text-muted-foreground">
          Loading saved employee settings...
        </p>
      )}

      {configurationLoadState === 'error' && (
        <p role="alert" className="text-sm text-destructive">
          Could not load employee settings: {configurationLoadError}{' '}
          Refresh the page before editing these settings.
        </p>
      )}

      {activeView === 'employees' && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleAiEmployees.map((employee) => {
            const Icon = employee.icon
            const status = getStatusStyles(employee.status)
            const isActive = employee.status === 'active'

            return (
              <div
                key={employee.id}
                className={`w-full rounded-2xl border border-border bg-card p-5 transition-colors ${
                  isActive ? 'hover:border-primary/30' : 'opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex size-11 items-center justify-center rounded-xl border border-border bg-background/50 text-primary">
                    <Icon className="size-5" />
                  </div>

                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>

                <div className="mt-5">
                  <h2 className="text-lg font-semibold text-foreground">
                    {employee.name}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {employee.description}
                  </p>
                </div>

                <div className="mt-5 border-t border-border pt-4">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <Settings2 className="size-3.5" />
                    Capabilities
                  </div>

                  <ul className="mt-3 space-y-2">
                    {employee.capabilities.map((capability) => (
                      <li
                        key={capability}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span>{capability}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {isActive && (
                  <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
                    <button
                      type="button"
                      onClick={() => setSelectedEmployee(employee)}
                      className="rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      View details
                    </button>

                    <button
                      type="button"
                      onClick={() => setExecutingEmployee(employee)}
                      className="rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      View activity
                    </button>

                    <button
                      type="button"
                      onClick={() => openConfiguration(employee)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Settings2 className="size-3.5" />
                      Configure
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {activeView === 'escalations' && (
        <AIEscalationsPanel
          workspaceRole={workspaceRole}
          currentUserId={currentUserId}
        />
      )}

      <AIEmployeeDetailsDialog
        employee={selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
      />

      <AIEmployeeConfigurationDialog
        employee={configuringEmployee}
        configuration={
          configuringEmployee
            ? employeeConfigurations[configuringEmployee.id] ??
              getDefaultConfiguration()
            : getDefaultConfiguration()
        }
        onSaveConfiguration={handleConfigurationSaved}
        onClose={() => setConfiguringEmployee(null)}
      />

      <AIEmployeeExecutionDialog
        employee={executingEmployee}
        onClose={() => setExecutingEmployee(null)}
      />
    </div>
  )
}
