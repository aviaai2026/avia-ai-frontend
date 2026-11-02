'use client'

import { AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

type AppointmentConfirmDialogProps = {
  title: string
  description: string
  confirmLabel: string
  isDestructive?: boolean
  onConfirm: () => void
  onClose: () => void
}

// Renders a reusable confirmation dialog for appointment actions.
export function AppointmentConfirmDialog({
  title,
  description,
  confirmLabel,
  isDestructive = false,
  onConfirm,
  onClose,
}: AppointmentConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="appointment-confirm-title"
        className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl"
      >
        <div className="flex items-start gap-4 p-6">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary">
            <AlertTriangle
              className="size-5 text-muted-foreground"
              aria-hidden="true"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h2
              id="appointment-confirm-title"
              className="text-base font-semibold text-foreground"
            >
              {title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close confirmation"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Keep appointment
          </Button>

          <Button
            type="button"
            variant={isDestructive ? 'destructive' : 'default'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}