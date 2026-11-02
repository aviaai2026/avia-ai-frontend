import Link from 'next/link'
import { ArrowLeft, ArrowRight, Globe, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ChannelsOnboardingPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-10">
        <div className="flex items-center justify-between">
          <Link
            href="/onboarding/data"
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
                Step 3 of 3
              </p>

              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Where do your customers reach you?
              </h1>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Connect the channels your business already uses. You can add
                more channels later.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MessageCircle className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="font-medium text-foreground">WhatsApp</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Manage customer conversations through WhatsApp.
                  </p>
                </div>

                <Button type="button" variant="outline">
                  Connect
                </Button>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Globe className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="font-medium text-foreground">Instagram</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Handle customer messages from Instagram.
                  </p>
                </div>

                <Button type="button" variant="outline">
                  Connect
                </Button>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Globe className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="font-medium text-foreground">Website</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Connect your website lead and contact forms.
                  </p>
                </div>

                <Button type="button" variant="outline">
                  Connect
                </Button>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-dashed border-border px-5 py-4">
              <p className="text-sm font-medium text-foreground">
                Not ready to connect yet?
              </p>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                You can finish setup now and connect your channels from
                Settings later.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <Link
                href="/onboarding/data"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Back
              </Link>

              <Link href="/onboarding/ready">
                <Button className="h-11 gap-2 px-6">
                  Finish setup
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