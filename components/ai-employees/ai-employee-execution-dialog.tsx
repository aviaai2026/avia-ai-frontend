
'use client'

import { Bot, ShieldCheck, X } from 'lucide-react'

type AIEmployeeExecutionDialogProps = {
  employee: {
    id: string
    name: string
  } | null
  onClose: () => void
}

export function AIEmployeeExecutionDialog({
  employee,
  onClose,
}: AIEmployeeExecutionDialogProps) {
  if (!employee) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between gap-5 border-b border-border p-6">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
              <Bot className="size-5" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-primary">
                Employee execution
              </p>

              <h2 className="mt-1 text-xl font-semibold text-foreground sm:text-2xl">
                {employee.name}
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Execution records will appear here when this employee
                is connected to the backend execution system.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close execution view"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <section className="rounded-xl border border-border bg-background/30 p-8 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl border border-border bg-secondary text-muted-foreground">
                <Bot className="size-6" />
              </div>

              <h3 className="mt-4 text-base font-semibold text-foreground">
                No recorded executions yet
              </h3>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                This is where AVIA.AI will display verified employee
                activity, completed tasks, and items awaiting human
                review. No execution history is available yet.
              </p>
            </section>

            <section className="rounded-xl border border-border bg-background/30 p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />

                <h3 className="text-sm font-semibold text-foreground">
                  Execution boundaries
                </h3>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <p className="text-xs leading-5 text-muted-foreground">
                  • Every production action must pass backend
                  authorization.
                </p>

                <p className="text-xs leading-5 text-muted-foreground">
                  • Property information must come from approved data.
                </p>

                <p className="text-xs leading-5 text-muted-foreground">
                  • Sensitive commercial decisions require human
                  involvement.
                </p>

                <p className="text-xs leading-5 text-muted-foreground">
                  • Production executions must be recorded in an
                  audit trail.
                </p>
              </div>
            </section>
          </div>
        </div>

        <div className="flex justify-end border-t border-border p-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
