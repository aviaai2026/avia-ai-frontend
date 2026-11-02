'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  Bell,
  Bot,
  Clock3,
  Moon,
  Search,
  Sun,
  UserRound,
} from 'lucide-react'

import { findActiveNavItem } from '@/config/navigation'
import type { CurrentUser, Workspace } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { UserMenu } from './user-menu'

type SearchResult = {
  id: string
  title: string
  description: string
  href: string
}

type AppHeaderProps = {
  user: CurrentUser
  workspace: Workspace
}

type NotificationCategory = 'new_lead' | 'system' | 'ai_escalation'

type AppNotification = {
  id: string
  category: NotificationCategory
  title: string
  message: string
  lead_id: string | null
  escalation_id: string | null
  created_at: string
  read_at: string | null
}

type NotificationsResponse = {
  notifications: AppNotification[]
  unread_counts: Record<NotificationCategory, number>
  unread_total: number
}

// Formats a timestamp into a compact relative time for future real notifications.
function formatNotificationTime(createdAt: string) {
  const createdTime = new Date(createdAt).getTime()
  const difference = Date.now() - createdTime

  if (!Number.isFinite(difference) || difference < 0) {
    return 'Just now'
  }

  const minutes = Math.floor(difference / 60000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  return `${Math.floor(hours / 24)}d ago`
}

export function AppHeader({ user, workspace }: AppHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const activeItem = findActiveNavItem(pathname)

  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [searchQuery, setSearchQuery] = useState('')

  const [notificationCategory, setNotificationCategory] =
    useState<NotificationCategory>('new_lead')
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCounts, setUnreadCounts] = useState<
    Record<NotificationCategory, number>
  >({
    new_lead: 0,
    system: 0,
    ai_escalation: 0,
  })
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [notificationsError, setNotificationsError] = useState('')
  const [markingReadIds, setMarkingReadIds] = useState<string[]>([])

  const unreadCount = Object.values(unreadCounts).reduce(
    (total, count) => total + count,
    0,
  )
    // Navigates to the exact lead or escalation referenced by a notification.
    function handleNotificationOpen(notification: AppNotification) {
      if (
        notification.category === 'new_lead' &&
        notification.lead_id
      ) {
        router.push(
          `/leads?leadId=${encodeURIComponent(notification.lead_id)}`,
        )
        return
      }

      if (
        notification.category === 'ai_escalation' &&
        notification.escalation_id
      ) {
        router.push(
          `/ai-employees?escalationId=${encodeURIComponent(notification.escalation_id)}`,
        )
      }
    }

    // Loads the selected notification category without marking anything as read.
    useEffect(() => {
      if (!notificationsOpen) return

      const controller = new AbortController()

      async function loadNotifications() {
        setNotificationsLoading(true)
        setNotificationsError('')

        try {
          const response = await fetch(
            `/api/notifications?category=${notificationCategory}&limit=30`,
            {
              method: 'GET',
              credentials: 'same-origin',
              cache: 'no-store',
              signal: controller.signal,
            },
          )

          if (!response.ok) {
            throw new Error(
              response.status === 401
                ? 'Your session has expired. Please sign in again.'
                : 'Could not load notifications.',
            )
          }

          const data = (await response.json()) as NotificationsResponse

          setNotifications(data.notifications)
          setUnreadCounts(data.unread_counts)
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') return

          setNotificationsError(
            error instanceof Error
              ? error.message
              : 'Could not load notifications.',
          )
        } finally {
          if (!controller.signal.aborted) {
            setNotificationsLoading(false)
          }
        }
      }

      void loadNotifications()

      // Reloads the visible category when another part of the header requests a refresh.
      const handleNotificationRefresh = () => {
        void loadNotifications()
      }

      window.addEventListener(
        'avia:refresh-notifications',
        handleNotificationRefresh,
      )

      return () => {
        controller.abort()

        window.removeEventListener(
          'avia:refresh-notifications',
          handleNotificationRefresh,
        )
      }
    }, [notificationsOpen, notificationCategory])
      // Keeps the bell's unread counts current even while the dropdown is closed.
  useEffect(() => {
    let active = true

    // Fetches unread counts without replacing the currently displayed notification list.
    async function refreshUnreadCounts() {
      if (document.visibilityState === 'hidden') return

      try {
        const response = await fetch('/api/notifications?limit=1', {
          method: 'GET',
          credentials: 'same-origin',
          cache: 'no-store',
        })

        if (!response.ok) return

        const data = (await response.json()) as NotificationsResponse

        if (active) {
          setUnreadCounts(data.unread_counts)
        }
      } catch {
        // Keep the last known counts if a temporary network error occurs.
      }
    }

    void refreshUnreadCounts()

    const intervalId = window.setInterval(() => {
      void refreshUnreadCounts()

      // Refreshes the visible list while the notification dropdown is open.
      if (notificationsOpen) {
        window.dispatchEvent(new Event('avia:refresh-notifications'))
      }
    }, 5000)
    window.addEventListener('focus', refreshUnreadCounts)
    document.addEventListener('visibilitychange', refreshUnreadCounts)

    return () => {
      active = false
      window.clearInterval(intervalId)
      window.removeEventListener('focus', refreshUnreadCounts)
      document.removeEventListener('visibilitychange', refreshUnreadCounts)
    }
  }, [user.id, workspace.id])

  // Searches only the two currently supported AI Employee entries, never demo records.
  const searchResults = useMemo<SearchResult[]>(() => {
    const query = searchQuery.trim().toLowerCase()

    if (!query) return []

    const employees = [
      {
        id: 'lead-employee',
        title: 'LEE',
        description: 'Lead Employee · Lead qualification',
        href: '/ai-employees',
      },
      {
        id: 'lead-revival',
        title: 'REVA',
        description: 'Lead Revival Employee · Inactive lead re-engagement',
        href: '/ai-employees',
      },
    ]

    return employees
      .filter((employee) =>
        `${employee.title} ${employee.description}`
          .toLowerCase()
          .includes(query),
      )
      .map(({ id, title, description, href }) => ({
        id,
        title,
        description,
        href,
      }))
  }, [searchQuery])

  // Navigates to a selected search result and clears the search input.
  function handleSearchResultSelect(result: SearchResult) {
    setSearchQuery('')
    router.push(result.href)
  }

  // Opens the first matching search result when the search form is submitted.
  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const firstResult = searchResults[0]
    if (firstResult) handleSearchResultSelect(firstResult)
  }

  // Restores the saved AVIA theme preference after the header mounts.
  useEffect(() => {
    const savedTheme = window.localStorage.getItem('avia-theme')
    const initialTheme = savedTheme === 'light' ? 'light' : 'dark'

    setTheme(initialTheme)
    document.documentElement.classList.toggle(
      'dark',
      initialTheme === 'dark',
    )
  }, [])

  // Switches the theme and saves the user's preference locally.
  function handleThemeToggle() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'

    setTheme(nextTheme)
    window.localStorage.setItem('avia-theme', nextTheme)
    document.documentElement.classList.toggle('dark', nextTheme === 'dark')
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4 md:px-6">
      <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />

      <Separator orientation="vertical" className="h-5 self-center" />

      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
        <ol className="flex items-center gap-2 text-sm">
          <li className="hidden truncate text-muted-foreground sm:block">
            {workspace.name}
          </li>

          {activeItem ? (
            <>
              <li
                aria-hidden="true"
                className="hidden text-muted-foreground/50 sm:block"
              >
                /
              </li>
              <li
                aria-current="page"
                className="truncate font-medium text-foreground"
              >
                {activeItem.title}
              </li>
            </>
          ) : null}
        </ol>
      </nav>

      <div className="flex items-center gap-1.5 md:gap-2">
        <div className="relative hidden md:block">
          <form
            role="search"
            className="relative"
            onSubmit={handleSearchSubmit}
          >
            <label htmlFor="global-search" className="sr-only">
              Search AVIA
            </label>

            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />

            <Input
              id="global-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search AVIA…"
              autoComplete="off"
              className="h-9 w-56 bg-card pl-8 lg:w-72"
            />
          </form>

          {searchQuery.trim() ? (
            <div className="absolute right-0 top-11 z-50 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
              {searchResults.length > 0 ? (
                <div className="py-1">
                  <div className="px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Search results
                  </div>

                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      type="button"
                      onClick={() => handleSearchResultSelect(result)}
                      className="flex w-full items-start gap-3 px-3 py-2.5 text-left outline-none transition-colors hover:bg-muted focus-visible:bg-muted"
                    >
                      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                        <Bot className="size-4" aria-hidden="true" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {result.title}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {result.description}
                        </p>
                        <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground/70">
                          AI Employee
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-5 py-8 text-center">
                  <Search className="mx-auto mb-2 size-5 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">
                    No results found
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Search for LEE or REVA. Lead and property search is not connected yet.
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Search is available on larger screens"
          title="Search is available on larger screens"
          disabled
        >
          <Search />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleThemeToggle}
          className="size-9 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={
            theme === 'dark'
              ? 'Switch to light theme'
              : 'Switch to dark theme'
          }
          title={
            theme === 'dark'
              ? 'Switch to light theme'
              : 'Switch to dark theme'
          }
        >
          {theme === 'dark' ? (
            <Sun className="size-4.5" aria-hidden="true" />
          ) : (
            <Moon className="size-4.5" aria-hidden="true" />
          )}
        </Button>

        <DropdownMenu onOpenChange={setNotificationsOpen}>
          <DropdownMenuTrigger
            className="relative inline-flex size-9 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={
              unreadCount > 0
                ? `Notifications, ${unreadCount} unread`
                : 'Notifications'
            }
          >
            <Bell aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-[380px] max-w-[calc(100vw-2rem)] p-0"
          >
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Notifications
                </p>
                <p className="text-xs text-muted-foreground">
                  {unreadCount} unread
                </p>
              </div>
            </div>

            <DropdownMenuSeparator />

            <div
              className="grid grid-cols-3 gap-1 px-2 pt-2"
              role="tablist"
              aria-label="Notification categories"
            >
              {(
                [
                  ['new_lead', 'New leads'],
                  ['system', 'System'],
                  ['ai_escalation', 'AI escalations'],
                ] as const
              ).map(([category, label]) => (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={notificationCategory === category}
                  onClick={() => setNotificationCategory(category)}
                  className={`rounded-md px-2 py-2 text-xs font-medium transition-colors ${
                    notificationCategory === category
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  }`}
                >
                  {label}
                  {unreadCounts[category] > 0 && (
                    <span className="ml-1">
                      {unreadCounts[category] > 99
                        ? '99+'
                        : unreadCounts[category]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="max-h-[420px] overflow-y-auto px-2 pb-2 pt-2">
              {notificationsLoading ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Loading notifications…
                </p>
              ) : notificationsError ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-destructive">
                    {notificationsError}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => {
                      setNotificationsOpen(false)
                      requestAnimationFrame(() => setNotificationsOpen(true))
                    }}
                  >
                    Try again
                  </Button>
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-muted">
                    <Bell
                      className="size-5 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    No {notificationCategory === 'new_lead'
                      ? 'new lead'
                      : notificationCategory === 'system'
                        ? 'system'
                        : 'AI escalation'} notifications
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Notifications will appear here when an event needs your attention.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`rounded-md border p-3 ${
                        notification.read_at
                          ? 'border-transparent'
                          : 'border-border bg-muted/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                            <button
                             type="button"
                            onClick={() => handleNotificationOpen(notification)}
                            className="min-w-0 flex-1 text-left"
                             >
                          <p className="text-sm font-medium text-foreground">
                            {notification.title}
                          </p>
                          <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-muted-foreground">
                            {notification.message}
                          </p>
                          <p className="mt-2 text-[11px] text-muted-foreground">
                            {formatNotificationTime(notification.created_at)}
                          </p>
                        </button>

                        {!notification.read_at && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={markingReadIds.includes(notification.id)}
                            className="shrink-0 text-xs"
                            onClick={async () => {
                              setMarkingReadIds((current) => [
                                ...current,
                                notification.id,
                              ])

                              try {
                                const response = await fetch(
                                  `/api/notifications/${encodeURIComponent(notification.id)}/read`,
                                  {
                                    method: 'PATCH',
                                    credentials: 'same-origin',
                                    cache: 'no-store',
                                  },
                                )

                                if (!response.ok) {
                                  throw new Error(
                                    'Could not mark this notification as read.',
                                  )
                                }

                                const data = (await response.json()) as {
                                  notification: AppNotification
                                }

                                setNotifications((current) =>
                                  current.map((item) =>
                                    item.id === notification.id
                                      ? data.notification
                                      : item,
                                  ),
                                )

                                setUnreadCounts((current) => ({
                                  ...current,
                                  [notification.category]: Math.max(
                                    0,
                                    current[notification.category] - 1,
                                  ),
                                }))
                              } catch {
                                setNotificationsError(
                                  'Could not mark this notification as read. Please try again.',
                                )
                              } finally {
                                setMarkingReadIds((current) =>
                                  current.filter(
                                    (id) => id !== notification.id,
                                  ),
                                )
                              }
                            }}
                          >
                            {markingReadIds.includes(notification.id)
                              ? 'Saving…'
                              : 'Mark read'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator
          orientation="vertical"
          className="mx-1 hidden h-5 self-center sm:block"
        />

        <UserMenu user={user} workspace={workspace} />
      </div>
    </header>
  )
}