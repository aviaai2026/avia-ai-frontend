import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          <div className="mb-10 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
              <img
                src="/avia-logo.png"
                alt="AVIA.AI"
                className="h-9 w-9 rounded-xl"
              />
            </div>
          </div>

          <div className="text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI-powered real estate operations
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Welcome to AVIAAI
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Let&apos;s get your business ready. It only takes a few simple
              steps, and AVIA will guide you through everything you need.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-3 text-sm font-semibold text-foreground">
                01
              </div>

              <h2 className="font-medium text-foreground">
                Tell us about your business
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                A few basic details so AVIA understands your operation.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-3 text-sm font-semibold text-foreground">
                02
              </div>

              <h2 className="font-medium text-foreground">
                Bring your data
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Import properties and existing leads instead of entering them
                one by one.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-3 text-sm font-semibold text-foreground">
                03
              </div>

              <h2 className="font-medium text-foreground">
                Connect your channels
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Give AVIA the channels your customers already use.
              </p>
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <Link href="/onboarding/business">
              <Button className="h-11 gap-2 px-6">
                Get started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            You can change your settings later.
          </p>
        </div>
      </div>
    </main>
  )
}