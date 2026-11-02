'use client'

import { useEffect, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import type { OverviewWelcome } from '@/lib/mock/overview'

type OverviewWelcomeHeaderProps = {
  welcome: OverviewWelcome
}

export function OverviewWelcomeHeader({
  welcome,
}: OverviewWelcomeHeaderProps) {
  const [greeting, setGreeting] = useState('Good morning')
  const [isNight, setIsNight] = useState(false)

  // Keeps the initial server and client render identical before browser time is available.
  const [currentDate, setCurrentDate] = useState<Date | null>(null)

  // Updates the greeting, emoji, and current date using the user's browser time.
  useEffect(() => {
    function updateCurrentTime() {
      const now = new Date()
      const hour = now.getHours()

      setCurrentDate(now)

      if (hour < 12) {
        setGreeting('Good morning')
        setIsNight(false)
      } else if (hour < 18) {
        setGreeting('Good afternoon')
        setIsNight(false)
      } else {
        setGreeting('Good evening')
        setIsNight(true)
      }
    }

    updateCurrentTime()

    const interval = window.setInterval(
      updateCurrentTime,
      60 * 1000,
    )

    return () => {
      window.clearInterval(interval)
    }
  }, [])

  const displayDate = currentDate ?? new Date(welcome.businessDate)

  const weekday = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone: welcome.timeZone,
  }).format(displayDate)

  const fullDate = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: welcome.timeZone,
  }).format(displayDate)

  return (
    <header className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex min-w-0 flex-col gap-1">
      <h1 className="text-xl font-semibold tracking-tight text-balance text-foreground md:text-2xl">
          {greeting}, {welcome.firstName}{' '}
          <span aria-hidden="true">
            {isNight ? '🌙' : '☀️'}
          </span>
        </h1>

        <p className="text-sm text-pretty text-muted-foreground md:text-base">
          {"Here's what's happening with your real estate business today."}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3 self-start rounded-lg border border-border bg-card px-4 py-3 sm:self-auto">
        <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
          <CalendarDays
            className="size-4"
            aria-hidden="true"
          />
        </div>

        <time
          dateTime={
            currentDate
              ? currentDate.toISOString()
              : welcome.businessDate
          }
          className="flex flex-col leading-tight"
        >
          <span className="text-xs font-medium text-muted-foreground">
            {weekday}
          </span>

          <span className="text-sm font-semibold text-foreground">
            {fullDate}
          </span>
        </time>
      </div>
    </header>
  )
}