import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OnboardingReadyPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl text-center">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-success/20 bg-success/10">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>

          <p className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-primary">
            Setup complete
          </p>

          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Your AVIAAI workspace is ready.
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground">
            Your workspace has been prepared. From your dashboard, you&apos;ll
            be able to manage your business, data, conversations, and AI
            Employees from one place.
          </p>

          <div className="mx-auto mt-10 grid max-w-xl gap-3 text-left sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <CheckCircle2 className="mb-3 h-5 w-5 text-success" />

              <p className="text-sm font-medium text-foreground">
                Business
              </p>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Your business context is ready.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <CheckCircle2 className="mb-3 h-5 w-5 text-success" />

              <p className="text-sm font-medium text-foreground">
                Data
              </p>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Your data setup is ready.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <CheckCircle2 className="mb-3 h-5 w-5 text-success" />

              <p className="text-sm font-medium text-foreground">
                Channels
              </p>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Your communication setup is ready.
              </p>
            </div>
          </div>

          <div className="mt-10">
            <Link href="/">
              <Button className="h-11 gap-2 px-6">
                Enter AVIAAI
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            You can finish connecting integrations and configure AI Employees
            from your workspace.
          </p>
        </div>
      </div>
    </main>
  )
}