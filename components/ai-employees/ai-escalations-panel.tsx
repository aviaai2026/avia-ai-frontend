'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  cancelEscalation,
  claimEscalation,
  getEscalation,
  getEscalations,
  resolveEscalation,
} from '@/lib/api/ai-escalations'
import type {
  Escalation,
  EscalationEmployee,
  EscalationStatus,
} from '@/lib/api/ai-escalations'
import type { WorkspaceRole } from '@/lib/types'

type AIEscalationsPanelProps = {
  workspaceRole: WorkspaceRole
  currentUserId: string
}

type EscalationSection = {
  title: string
  status: EscalationStatus
  emptyMessage: string
}

const employeeLabels: Record<EscalationEmployee, string> = {
  'lead-employee': 'LEE — Lead Employee',
  'lead-revival-employee': 'REVA — Lead Revival Employee',
}

const escalationSections: EscalationSection[] = [
  {
    title: 'New',
    status: 'open',
    emptyMessage: 'No new escalations need to be claimed.',
  },
  {
    title: 'Open',
    status: 'claimed',
    emptyMessage: 'No escalations are currently in progress.',
  },
  {
    title: 'Resolved',
    status: 'resolved',
    emptyMessage: 'No resolved escalations to display.',
  },
  {
    title: 'Cancelled',
    status: 'cancelled',
    emptyMessage: 'No cancelled escalations to display.',
  },
]

// Formats backend timestamps for readable display in the user's locale.
function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

// Converts backend error messages into a readable panel message.
function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Something went wrong. Please try again.'
}

// Displays and manages real escalation records returned by the backend.
export function AIEscalationsPanel({
  workspaceRole,
  currentUserId,
}: AIEscalationsPanelProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [escalations, setEscalations] = useState<Escalation[]>([])
  const [activeSection, setActiveSection] =
    useState<EscalationStatus>('open')
  const [openFilter, setOpenFilter] = useState<'all' | 'mine'>('all')
  const [targetEscalationId, setTargetEscalationId] = useState<string | null>(
    null,
  )
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [spokenAnnouncementsEnabled, setSpokenAnnouncementsEnabled] =
    useState(false)
  const [spokenPreferenceLoaded, setSpokenPreferenceLoaded] = useState(false)

  // Tracks IDs already announced across rerenders and page revisits.
  const announcedEscalationIdsRef = useRef(new Set<string>())

  // Tracks escalation IDs already seen by the polling process.
  const knownEscalationIdsRef = useRef(new Set<string>())

  // Holds newly detected escalations until spoken announcements are enabled.
  const pendingAnnouncementsRef = useRef(new Map<string, Escalation>())

  const hasEstablishedBaselineRef = useRef(false)
  const pollingInFlightRef = useRef(false)

  const canCancel =
    workspaceRole === 'owner' || workspaceRole === 'manager'

  // Restores the spoken-announcement preference saved for this user.
  useEffect(() => {
    setSpokenPreferenceLoaded(false)

    try {
      const savedPreference = window.localStorage.getItem(
        `avia-spoken-announcements-enabled:${currentUserId}`,
      )

      setSpokenAnnouncementsEnabled(savedPreference === 'true')
    } catch {
      setSpokenAnnouncementsEnabled(false)
    } finally {
      setSpokenPreferenceLoaded(true)
    }
  }, [currentUserId])

  // Persists the spoken-announcement preference after it has been restored.
  useEffect(() => {
    if (!spokenPreferenceLoaded) return

    try {
      window.localStorage.setItem(
        `avia-spoken-announcements-enabled:${currentUserId}`,
        String(spokenAnnouncementsEnabled),
      )
    } catch {
      // The preference remains available for the current visit.
    }
  }, [
    currentUserId,
    spokenAnnouncementsEnabled,
    spokenPreferenceLoaded,
  ])

  // Loads previously announced escalation IDs to prevent replay after revisits.
  useEffect(() => {
    announcedEscalationIdsRef.current = new Set()

    try {
      const savedIds = window.localStorage.getItem(
        `avia-spoken-escalations:${currentUserId}`,
      )

      if (savedIds) {
        const parsedIds: unknown = JSON.parse(savedIds)

        if (
          Array.isArray(parsedIds) &&
          parsedIds.every((id) => typeof id === 'string')
        ) {
          announcedEscalationIdsRef.current = new Set(parsedIds)
        }
      }
    } catch {
      // Keep announcements usable if browser storage is unavailable.
    }
  }, [currentUserId])

  // Speaks one new escalation exactly twice and records its ID before playback.
  const announceEscalation = useCallback(
    (escalation: Escalation) => {
      if (!('speechSynthesis' in window)) {
        return
      }

      const announcedIds = announcedEscalationIdsRef.current

      if (announcedIds.has(escalation.id)) {
        return
      }

      announcedIds.add(escalation.id)

      try {
        window.localStorage.setItem(
          `avia-spoken-escalations:${currentUserId}`,
          JSON.stringify([...announcedIds]),
        )
      } catch {
        // In-memory ID tracking still prevents duplicates during this visit.
      }

      const details = escalation.summary.trim() || escalation.reason.trim()
      const message =
        `AI escalation requires attention. ` +
        `${employeeLabels[escalation.employee_id]}. ` +
        `${details}. Priority: ${escalation.priority}.`

      for (let count = 0; count < 2; count += 1) {
        const utterance = new SpeechSynthesisUtterance(message)
        utterance.lang = 'en-NG'
        window.speechSynthesis.speak(utterance)
      }
    },
    [currentUserId],
  )

  // Detects newly created escalation records without announcing the initial list.
  useEffect(() => {
    let active = true

    async function checkForNewEscalations() {
      if (pollingInFlightRef.current) return

      pollingInFlightRef.current = true

      try {
        const result = await getEscalations()

        if (!active) return

        const currentIds = new Set(result.map((item) => item.id))

        if (!hasEstablishedBaselineRef.current) {
          knownEscalationIdsRef.current = currentIds
          hasEstablishedBaselineRef.current = true
        } else {
          for (const escalation of result) {
            if (
              !knownEscalationIdsRef.current.has(escalation.id) &&
              !announcedEscalationIdsRef.current.has(escalation.id)
            ) {
              pendingAnnouncementsRef.current.set(
                escalation.id,
                escalation,
              )
            }
          }

          knownEscalationIdsRef.current = currentIds
        }

        if (spokenAnnouncementsEnabled && spokenPreferenceLoaded) {
          for (const [id, escalation] of pendingAnnouncementsRef.current) {
            if (!announcedEscalationIdsRef.current.has(id)) {
              announceEscalation(escalation)
            }

            pendingAnnouncementsRef.current.delete(id)
          }
        }
      } catch {
        // A temporary polling failure should not interrupt the escalation panel.
      } finally {
        pollingInFlightRef.current = false
      }
    }

    void checkForNewEscalations()

    const intervalId = window.setInterval(() => {
      void checkForNewEscalations()
    }, 10_000)

    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [
    announceEscalation,
    spokenAnnouncementsEnabled,
    spokenPreferenceLoaded,
  ])

  // Reads a notification's escalation ID and cleans the URL.
  useEffect(() => {
    const escalationId = searchParams.get('escalationId')

    if (!escalationId) return

    setTargetEscalationId(escalationId)

    const url = new URL(window.location.href)
    url.searchParams.delete('escalationId')

    router.replace(`${url.pathname}${url.search}${url.hash}`, {
      scroll: false,
    })
  }, [searchParams, router])

  // Loads all statuses so the four section counts and records stay current.
  const loadEscalations = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    setError('')

    try {
      const results = await Promise.all(
        escalationSections.map((section) => getEscalations(section.status)),
      )

      const uniqueEscalations = new Map<string, Escalation>()

      for (const result of results) {
        for (const escalation of result) {
          uniqueEscalations.set(escalation.id, escalation)
        }
      }

      setEscalations(
        [...uniqueEscalations.values()].sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime(),
        ),
      )
    } catch (loadError) {
      setError(getErrorMessage(loadError))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void loadEscalations()
  }, [loadEscalations])

  // Finds the notification's exact escalation, switches to its section, and scrolls to it.
  useEffect(() => {
    const escalationId = targetEscalationId

    if (loading || !escalationId) return

    const validEscalationId: string = escalationId

    let cancelled = false
    let animationFrameId: number | null = null

    async function findTargetEscalation() {
      const existingEscalation = escalations.find(
        (escalation) => escalation.id === validEscalationId,
      )

      let targetEscalation: Escalation | undefined = existingEscalation

      if (!targetEscalation) {
        try {
          targetEscalation = await getEscalation(validEscalationId)
        } catch {
          if (!cancelled) {
            setActionError('The linked escalation could not be found.')
          }
          return
        }
      }

      if (cancelled || !targetEscalation) return

      if (
        !escalations.some(
          (escalation) => escalation.id === targetEscalation.id,
        )
      ) {
        setEscalations((current) => {
          if (
            current.some(
              (escalation) => escalation.id === targetEscalation.id,
            )
          ) {
            return current
          }

          return [...current, targetEscalation]
        })
      }

      if (activeSection !== targetEscalation.status) {
        setActiveSection(targetEscalation.status)
        return
      }

      animationFrameId = window.requestAnimationFrame(() => {
        if (cancelled) return

        document
          .getElementById(`escalation-${targetEscalation.id}`)
          ?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
      })
    }

    void findTargetEscalation()

    return () => {
      cancelled = true

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId)
      }
    }
  }, [activeSection, escalations, loading, targetEscalationId])

  // Runs one backend action and reloads records after a successful response.
  async function runAction(
    id: string,
    action: () => Promise<unknown>,
    successMessage: string,
  ) {
    setBusyId(id)
    setActionError('')
    setNotice('')

    try {
      await action()
      setNotice(successMessage)
      await loadEscalations(true)
    } catch (actionFailure) {
      setActionError(getErrorMessage(actionFailure))
    } finally {
      setBusyId(null)
    }
  }

  // Renders one escalation card while preserving role and ownership checks.
  function renderEscalationCard(escalation: Escalation) {
    return (
      <article
        key={escalation.id}
        id={`escalation-${escalation.id}`}
        className={`rounded-xl border p-4 ${
          escalation.id === targetEscalationId
            ? 'border-primary bg-primary/5 ring-2 ring-primary/60'
            : 'border-border'
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium">
              {employeeLabels[escalation.employee_id]}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {escalation.reason}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-muted px-2.5 py-1 capitalize">
              {escalation.status}
            </span>
            <span className="rounded-full bg-muted px-2.5 py-1 capitalize">
              {escalation.priority}
            </span>
          </div>
        </div>

        {escalation.summary && (
          <p className="mt-3 whitespace-pre-wrap text-sm">
            {escalation.summary}
          </p>
        )}

        <p className="mt-3 text-xs text-muted-foreground">
          Created {formatDate(escalation.created_at)}
        </p>

        {escalation.status === 'claimed' && (
          <p className="mt-1 text-xs text-muted-foreground">
            Claimed by {escalation.claimed_by_user_name || 'Team member'}
            {escalation.claimed_at
              ? ` · ${formatDate(escalation.claimed_at)}`
              : ''}
          </p>
        )}

        {escalation.status === 'resolved' && (
          <p className="mt-1 text-xs text-muted-foreground">
            Resolved by {escalation.resolved_by_user_name || 'Team member'}
            {escalation.resolved_at
              ? ` · ${formatDate(escalation.resolved_at)}`
              : ''}
          </p>
        )}

        {escalation.status === 'cancelled' && (
          <p className="mt-1 text-xs text-muted-foreground">
            Cancelled by {escalation.cancelled_by_user_name || 'Team member'}
            {escalation.cancelled_at
              ? ` · ${formatDate(escalation.cancelled_at)}`
              : ''}
          </p>
        )}

        {(escalation.status === 'open' ||
          escalation.status === 'claimed') && (
          <div className="mt-4 flex flex-wrap gap-2">
            {escalation.status === 'open' && (
              <button
                type="button"
                onClick={() =>
                  void runAction(
                    escalation.id,
                    () => claimEscalation(escalation.id),
                    'Escalation claimed.',
                  )
                }
                disabled={busyId === escalation.id}
                className="rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-50"
              >
                {busyId === escalation.id ? 'Working…' : 'Claim'}
              </button>
            )}

            {escalation.status === 'claimed' && (
              <button
                type="button"
                disabled
                title="Available when messaging is connected"
                className="rounded-lg border border-border px-3 py-2 text-sm opacity-60"
              >
                Open Conversation
              </button>
            )}

            {escalation.status === 'claimed' &&
              (escalation.claimed_by_user_id === currentUserId ||
                canCancel) && (
                <button
                  type="button"
                  onClick={() =>
                    void runAction(
                      escalation.id,
                      () => resolveEscalation(escalation.id),
                      'Escalation resolved.',
                    )
                  }
                  disabled={busyId === escalation.id}
                  className="rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-50"
                >
                  {busyId === escalation.id ? 'Working…' : 'Resolve'}
                </button>
              )}

            {canCancel && (
              <button
                type="button"
                onClick={() => {
                  const confirmed = window.confirm(
                    'Are you sure you want to cancel this escalation? This action cannot be undone.',
                  )

                  if (!confirmed) return

                  void runAction(
                    escalation.id,
                    () => cancelEscalation(escalation.id),
                    'Escalation cancelled.',
                  )
                }}
                disabled={busyId === escalation.id}
                className="rounded-lg border border-destructive/40 px-3 py-2 text-sm text-destructive disabled:opacity-50"
              >
                {busyId === escalation.id ? 'Working…' : 'Cancel'}
              </button>
            )}
          </div>
        )}
      </article>
    )
  }

  const activeSectionDetails = escalationSections.find(
    (section) => section.status === activeSection,
  )

  const activeEscalations = escalations.filter((escalation) => {
    if (escalation.status !== activeSection) return false

    if (activeSection === 'claimed' && openFilter === 'mine') {
      return escalation.claimed_by_user_id === currentUserId
    }

    return true
  })

  return (
    <section className="mt-8 rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">AI Escalations</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Review issues that need human attention.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void loadEscalations(true)}
            disabled={loading || refreshing}
            className="rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-50"
          >
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>

          <button
            type="button"
            onClick={() =>
              setSpokenAnnouncementsEnabled((enabled) => !enabled)
            }
            disabled={!spokenPreferenceLoaded}
            className="rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-50"
            aria-pressed={spokenAnnouncementsEnabled}
          >
            {spokenAnnouncementsEnabled
              ? 'Spoken announcements on'
              : 'Enable spoken announcements'}
          </button>
        </div>
      </div>

      {notice && (
        <p role="status" className="mt-4 rounded-lg bg-muted p-3 text-sm">
          {notice}
        </p>
      )}

      {(error || actionError) && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-destructive/30 p-3 text-sm text-destructive"
        >
          {actionError || error}
        </p>
      )}

      {!error && (
        <div
          className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4"
          role="group"
          aria-label="Escalation sections"
        >
          {escalationSections.map((section) => {
            const count = escalations.filter(
              (escalation) => escalation.status === section.status,
            ).length
            const isActive = activeSection === section.status

            return (
              <button
                key={section.status}
                type="button"
                onClick={() => setActiveSection(section.status)}
                aria-pressed={isActive}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  isActive
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/40'
                    : 'border-border hover:bg-muted/60'
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{section.title}</span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {loading ? '—' : count}
                  </span>
                </span>
                <span className="mt-2 block text-xs text-muted-foreground">
                  {section.status === 'open' &&
                    'Awaiting someone to claim'}
                  {section.status === 'claimed' && 'Being handled'}
                  {section.status === 'resolved' && 'Completed'}
                  {section.status === 'cancelled' && 'Cancelled records'}
                </span>
              </button>
            )
          })}
        </div>
      )}

      <div className="mt-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">
              {activeSectionDetails?.title} escalations
            </h3>
          </div>

          {!loading && !error && (
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              {activeEscalations.length}{' '}
              {activeEscalations.length === 1 ? 'record' : 'records'}
            </span>
          )}
        </div>

        {activeSection === 'claimed' && (
          <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label="Filter open escalations"
          >
            <button
              type="button"
              onClick={() => setOpenFilter('all')}
              aria-pressed={openFilter === 'all'}
              className={`rounded-lg border px-3 py-2 text-sm ${
                openFilter === 'all'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted/60'
              }`}
            >
              All Open
            </button>

            <button
              type="button"
              onClick={() => setOpenFilter('mine')}
              aria-pressed={openFilter === 'mine'}
              className={`rounded-lg border px-3 py-2 text-sm ${
                openFilter === 'mine'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted/60'
              }`}
            >
              Claimed by me
            </button>
          </div>
        )}

        {loading ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            Loading escalations…
          </p>
        ) : error ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            Escalations could not be loaded. Check the error above and retry.
          </p>
        ) : activeEscalations.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            {activeSectionDetails?.emptyMessage}
          </p>
        ) : (
          <div className="space-y-3">
            {activeEscalations.map(renderEscalationCard)}
          </div>
        )}
      </div>
    </section>
  )
}