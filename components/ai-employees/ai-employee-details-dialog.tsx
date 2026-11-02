'use client'

import { useState } from 'react'
import {
  Activity,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Database,
  MessageSquare,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react'

type EmployeePermission = {
  name: string
  description: string
  access: 'allowed' | 'restricted'
}

type EmployeeActivity = {
  id: string
  time: string
  title: string
  description: string
  type: 'lead' | 'search' | 'message' | 'update' | 'system'
}

type AIEmployeeDetails = {
  id: string
  name: string
  description: string
  responsibilities: string[]
  capabilities: string[]
  permissions: EmployeePermission[]
  connectedSystems: string[]
  humanOversight: string[]
  activities?: EmployeeActivity[]
}

type AIEmployeeDetailsDialogProps = {
  employee: AIEmployeeDetails | null
  onClose: () => void
}

// Returns the icon used for an activity type.
function getActivityIcon(type: EmployeeActivity['type']) {
  switch (type) {
    case 'lead':
      return UserRound
    case 'search':
      return Search
    case 'message':
      return MessageSquare
    case 'update':
      return Database
    default:
      return Activity
  }
}

// Returns the visual styling used for an activity type.
function getActivityStyle(type: EmployeeActivity['type']) {
  switch (type) {
    case 'lead':
      return 'bg-blue-500/10 text-blue-400'
    case 'search':
      return 'bg-purple-500/10 text-purple-400'
    case 'message':
      return 'bg-emerald-500/10 text-emerald-400'
    case 'update':
      return 'bg-amber-500/10 text-amber-400'
    default:
      return 'bg-secondary text-muted-foreground'
  }
}

export function AIEmployeeDetailsDialog({
  employee,
  onClose,
}: AIEmployeeDetailsDialogProps) {
  const [showActivity, setShowActivity] = useState(true)

  if (!employee) {
    return null
  }

  const activities = employee.activities ?? []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border p-6">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Activity className="size-6" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold">
                  {employee.name}
                </h2>

                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  Active
                </span>
              </div>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {employee.description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            aria-label="Close employee details"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto p-6">
          <div className="space-y-8">
            {/* Overview */}
            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Overview
              </h3>

              <p className="text-sm leading-6 text-foreground/85">
                {employee.description}
              </p>
            </section>

            {/* Responsibilities */}
            {employee.responsibilities.length > 0 && (
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Responsibilities
                </h3>

                <div className="grid gap-2 sm:grid-cols-2">
                  {employee.responsibilities.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-2 rounded-lg border border-border bg-card p-3 text-sm"
                    >
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Capabilities */}
            {employee.capabilities.length > 0 && (
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Capabilities
                </h3>

                <div className="flex flex-wrap gap-2">
                  {employee.capabilities.map((capability) => (
                    <span
                      key={capability}
                      className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm"
                    >
                      {capability}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Permissions */}
            {employee.permissions.length > 0 && (
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Permissions
                </h3>

                <div className="space-y-2">
                  {employee.permissions.map((permission) => (
                    <div
                      key={permission.name}
                      className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {permission.name}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          {permission.description}
                        </p>
                      </div>

                      <span
                        className={
                          permission.access === 'allowed'
                            ? 'shrink-0 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400'
                            : 'shrink-0 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400'
                        }
                      >
                        {permission.access === 'allowed'
                          ? 'Allowed'
                          : 'Restricted'}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Connected systems */}
            {employee.connectedSystems.length > 0 && (
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Connected Systems
                </h3>

                <div className="flex flex-wrap gap-2">
                  {employee.connectedSystems.map((system) => (
                    <span
                      key={system}
                      className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
                    >
                      {system}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Human oversight */}
            {employee.humanOversight.length > 0 && (
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Human Oversight
                </h3>

                <div className="space-y-2">
                  {employee.humanOversight.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-2 text-sm text-foreground/85"
                    >
                      <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Activity and execution history */}
            <section className="border-t border-border pt-6">
              <button
                type="button"
                onClick={() =>
                  setShowActivity((current) => !current)
                }
                className="flex w-full items-center justify-between gap-4 text-left"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Clock3 className="size-4 text-primary" />

                    <h3 className="text-sm font-semibold">
                      Activity & Execution History
                    </h3>
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Recent actions performed by this AI Employee.
                  </p>
                </div>

                {showActivity ? (
                  <ChevronUp className="size-5 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronDown className="size-5 shrink-0 text-muted-foreground" />
                )}
              </button>

              {showActivity && (
                <div className="mt-5">
                  {activities.length > 0 ? (
                    <div className="relative space-y-4 pl-1">
                      {/* Timeline connector */}
                      <div className="absolute bottom-3 left-[17px] top-3 w-px bg-border" />

                      {activities.map((activity) => {
                        const Icon = getActivityIcon(activity.type)

                        return (
                          <div
                            key={activity.id}
                            className="relative flex gap-4"
                          >
                            <div
                              className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-border ${getActivityStyle(
                                activity.type,
                              )}`}
                            >
                              <Icon className="size-4" />
                            </div>

                            <div className="min-w-0 flex-1 rounded-xl border border-border bg-card p-4">
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <p className="text-sm font-medium text-foreground">
                                  {activity.title}
                                </p>

                                <span className="text-xs text-muted-foreground">
                                  {activity.time}
                                </span>
                              </div>

                              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                                {activity.description}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border p-6 text-center">
                      <Activity className="mx-auto size-6 text-muted-foreground" />

                      <p className="mt-2 text-sm font-medium">
                        No activity recorded
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Execution history will appear here when this
                        employee performs actions.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Security notice */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />

                <div>
                  <p className="text-sm font-medium">
                    Execution records are protected
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    These records are currently mock data for the V1
                    frontend. In production, the AVIA backend will
                    create, authorize, and protect the real execution
                    history.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-border p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}