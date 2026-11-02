import Link from 'next/link'
import { ArrowLeft, ArrowRight, FileSpreadsheet, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DataOnboardingPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-10">
        <div className="flex items-center justify-between">
          <Link
            href="/onboarding/business"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <div className="flex items-center gap-2">
            <img
              src="/avia-logo.png"
              alt="AVIAAI"
              className="h-8 w-8 rounded-lg"
            />

            <span className="text-sm font-semibold text-foreground">
              AVIAAI
            </span>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center py-16">
          <div className="w-full max-w-xl">
            <div className="mb-8">
              <p className="mb-3 text-sm font-medium text-primary">
                Step 2 of 3
              </p>

              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Bring your existing data
              </h1>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                If you already have properties or leads, bring them into
                AVIAAI instead of entering everything manually.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="font-medium text-foreground">
                      Properties
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Import your existing property information so AVIAAI can
                      use real inventory when helping leads.
                    </p>

                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4 gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Import properties
                    </Button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="font-medium text-foreground">
                      Existing leads
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Bring your old leads so the REVA can
                      eventually help reconnect with them.
                    </p>

                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4 gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Import leads
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-dashed border-border px-5 py-4">
              <p className="text-sm font-medium text-foreground">
                Don&apos;t have your data ready?
              </p>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                No problem. You can skip this step and add your data later.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <Link
                href="/onboarding/business"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Back
              </Link>

              <Link href="/onboarding/channels">
                <Button className="h-11 gap-2 px-6">
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}