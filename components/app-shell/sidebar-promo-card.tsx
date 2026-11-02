import { Sparkles } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function SidebarPromoCard() {
  return (
    <Card
      size="sm"
      className="relative overflow-hidden bg-[linear-gradient(135deg,var(--sidebar)_0%,var(--sidebar)_58%,color-mix(in_srgb,var(--sidebar)_62%,var(--primary))_100%)] shadow-none ring-sidebar-border group-data-[collapsible=icon]:hidden [@media(max-height:600px)]:hidden"
    >
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-25"
        viewBox="0 0 320 180"
        preserveAspectRatio="none"
      >
        <path
          d="M-30 145 C45 85 85 175 155 112 S275 55 350 105"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          className="text-primary"
        />

        <path
          d="M-35 160 C40 100 92 185 165 125 S282 72 355 118"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
          className="text-primary"
        />

        <path
          d="M-25 125 C50 65 105 150 170 92 S280 40 345 88"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.7"
          className="text-foreground"
        />

        <path
          d="M35 205 C95 135 145 190 205 135 S290 92 350 125"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.6"
          className="text-foreground"
        />
      </svg>

      <CardHeader className="relative z-10 gap-2">
        <span
          aria-hidden="true"
          className="flex size-7 items-center justify-center rounded-md bg-primary/15 text-primary"
        >
          <Sparkles className="size-3.5" />
        </span>

        <CardTitle className="text-sm font-semibold leading-snug text-foreground text-balance">
          Smarter real estate.
          <br />
          Powered by AI.
        </CardTitle>

        <CardDescription className="text-xs leading-relaxed text-muted-foreground">
          AI employees that qualify leads, automate follow-ups, and handle requests around the clock.
        </CardDescription>
      </CardHeader>
    </Card>
  )
}