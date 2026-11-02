'use client'

import Link from 'next/link'
import { FormEvent, Suspense, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const CODE_LENGTH = 6
const RESEND_COOLDOWN_SECONDS = 60

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''

  const [code, setCode] = useState<string[]>(
    Array(CODE_LENGTH).fill('')
  )
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  // Moves focus to the next OTP input after a digit is entered.
  function focusNextInput(index: number) {
    if (index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Moves focus to the previous OTP input when needed.
  function focusPreviousInput(index: number) {
    if (index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // Updates an OTP digit and advances the input automatically.
  function handleCodeChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    const nextCode = [...code]

    nextCode[index] = digit

    setCode(nextCode)
    setError('')

    if (digit) {
      focusNextInput(index)
    }
  }

  // Handles OTP keyboard navigation.
  function handleCodeKeyDown(
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === 'Backspace' && !code[index]) {
      focusPreviousInput(index)
    }

    if (event.key === 'ArrowLeft') {
      focusPreviousInput(index)
    }

    if (event.key === 'ArrowRight') {
      focusNextInput(index)
    }
  }

  // Handles pasted verification codes across all six inputs.
  function handleCodePaste(
    event: React.ClipboardEvent<HTMLInputElement>
  ) {
    event.preventDefault()

    const pastedCode = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, CODE_LENGTH)

    if (!pastedCode) {
      return
    }

    const nextCode = Array(CODE_LENGTH).fill('')

    pastedCode.split('').forEach((digit, index) => {
      nextCode[index] = digit
    })

    setCode(nextCode)
    setError('')

    const focusIndex = Math.min(
      pastedCode.length,
      CODE_LENGTH - 1
    )

    inputRefs.current[focusIndex]?.focus()
  }

  // Sends the verification code to the AVIAAI backend and completes email verification.
  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const verificationCode = code.join('')

    if (verificationCode.length !== CODE_LENGTH) {
      setError('Enter the 6-digit verification code.')
      return
    }

    if (!email) {
      setError(
        'Your verification email is missing. Please return to signup.'
      )
      return
    }

    setIsVerifying(true)

    try {
      const response = await fetch(
        'http://localhost:8000/auth/verify-email',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            code: verificationCode,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail ?? 'Email verification failed.'
        )
      }

      router.push('/login?verified=true')
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Email verification failed. Please try again.'
      )
    } finally {
      setIsVerifying(false)
    }
  }

  // Starts the resend cooldown to prevent repeated OTP requests in the UI.
  function handleResend() {
    if (resendCooldown > 0) {
      return
    }

    setError('')
    setResendCooldown(RESEND_COOLDOWN_SECONDS)
  }

  useEffect(() => {
    if (resendCooldown <= 0) {
      return
    }

    const timer = window.setInterval(() => {
      setResendCooldown((current) =>
        Math.max(current - 1, 0)
      )
    }, 1000)

    return () => window.clearInterval(timer)
  }, [resendCooldown])

  return (
    <main className="min-h-screen bg-background">
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="mb-10 flex justify-center">
            <Link
              href="/signup"
              className="flex items-center gap-3"
            >
              <img
                src="/avia-logo.png"
                alt="AVIAAI"
                className="h-10 w-10 rounded-xl"
              />

              <span className="text-lg font-semibold tracking-tight text-foreground">
                AVIAAI
              </span>
            </Link>
          </div>

          {/* Verification card */}
          <div className="rounded-2xl border border-border bg-card/60 p-7 shadow-sm sm:p-9">
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background">
                <Mail className="h-6 w-6 text-primary" />
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Check your email
              </h1>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                We&apos;ve sent a 6-digit verification code to
              </p>

              <p className="mt-1 break-all text-sm font-medium text-foreground">
                {email || 'your email address'}
              </p>
            </div>

            <form
              className="mt-8 space-y-6"
              onSubmit={handleVerify}
            >
              <div className="space-y-3">
                <label
                  htmlFor="verification-code-0"
                  className="block text-sm font-medium text-foreground"
                >
                  Verification code
                </label>

                <div className="grid grid-cols-6 gap-2 sm:gap-3">
                  {code.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(element) => {
                        inputRefs.current[index] = element
                      }}
                      id={`verification-code-${index}`}
                      type="text"
                      inputMode="numeric"
                      autoComplete={
                        index === 0
                          ? 'one-time-code'
                          : 'off'
                      }
                      maxLength={1}
                      value={digit}
                      onChange={(event) =>
                        handleCodeChange(
                          index,
                          event.target.value
                        )
                      }
                      onKeyDown={(event) =>
                        handleCodeKeyDown(index, event)
                      }
                      onPaste={handleCodePaste}
                      aria-label={`Verification digit ${
                        index + 1
                      }`}
                      className="h-12 px-0 text-center text-lg font-semibold"
                      disabled={isVerifying}
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="h-11 w-full gap-2"
                disabled={
                  isVerifying ||
                  code.join('').length !== CODE_LENGTH
                }
              >
                {isVerifying
                  ? 'Verifying...'
                  : 'Verify email'}

                {!isVerifying && (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-3 text-center text-sm">
              <p className="text-muted-foreground">
                Didn&apos;t receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  className="font-medium text-primary transition-colors hover:text-primary/80 disabled:cursor-not-allowed disabled:text-muted-foreground"
                >
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : 'Resend code'}
                </button>
              </p>

              <Link
                href="/signup"
                className="inline-flex items-center gap-2 font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Change email
              </Link>
            </div>
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
            Your verification code expires for security. Never
            share your code with anyone.
          </p>
        </div>
      </div>
    </main>
  )
}
// Provides the required Suspense boundary for query-string access during prerendering.
export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background px-6">
          <p className="text-sm text-muted-foreground">
            Loading email verification...
          </p>
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}