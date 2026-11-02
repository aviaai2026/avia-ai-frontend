
'use client'

import { FormEvent, Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Displays the invitation form and submits acceptance through the same-origin API bridge.
function InvitationAcceptanceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Validates the form and accepts the invitation without exposing the session token to JavaScript.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!token) {
      setError('This invitation link is missing its token. Ask the workspace owner for a new invitation.')
      return
    }

    if (password !== confirmPassword) {
      setError('Your passwords do not match.')
      return
    }

    if (password.length < 8 || password.length > 128) {
      setError('Your password must be between 8 and 128 characters.')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/workspace/invitations/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          full_name: fullName,
          password,
        }),
        cache: 'no-store',
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          typeof data.detail === 'string'
            ? data.detail
            : 'Unable to accept this invitation. Please try again.',
        )
      }

      router.replace('/')
      router.refresh()
    } catch (acceptanceError) {
      setError(
        acceptanceError instanceof Error
          ? acceptanceError.message
          : 'Something went wrong. Please try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
        <section className="w-full max-w-md space-y-4">
          <h1 className="text-2xl font-semibold text-foreground">
            Invitation link unavailable
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            This link does not contain an invitation token. Ask your workspace
            owner to provide a valid invitation link.
          </p>
        </section>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <section className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <img
            src="/avia-logo.png"
            alt="AVIAAI"
            className="h-10 w-10 rounded-xl"
          />
          <span className="text-lg font-semibold tracking-tight text-foreground">
            AVIAAI
          </span>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Join your workspace
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Complete your details to accept your AVIA.AI workspace invitation.
          If you already have an AVIA.AI account, enter your existing password.
          Otherwise, create a password with at least 8 characters.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="invite-full-name" className="text-sm font-medium text-foreground">
              Full name
            </label>
            <Input
              id="invite-full-name"
              name="full_name"
              autoComplete="name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              maxLength={200}
              required
              className="h-11 bg-background/50"
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="invite-password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <div className="relative">
              <Input
                id="invite-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                maxLength={128}
                required
                className="h-11 bg-background/50 pr-11"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="invite-confirm-password" className="text-sm font-medium text-foreground">
              Confirm password
            </label>
            <Input
              id="invite-confirm-password"
              name="confirm_password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={8}
              maxLength={128}
              required
              className="h-11 bg-background/50"
              placeholder="Enter the password again"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="h-11 w-full gap-2"
            disabled={isLoading}
          >
            {isLoading ? 'Accepting invitation...' : 'Accept invitation'}
            {!isLoading && <ArrowRight className="h-4 w-4" />}
          </Button>
        </form>
      </section>
    </main>
  )
}

// Provides the Suspense boundary required for useSearchParams during Next.js production builds.
export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background">
          <p className="text-sm text-muted-foreground">Loading invitation…</p>
        </main>
      }
    >
      <InvitationAcceptanceContent />
    </Suspense>
  )
}
