import Link from 'next/link'
import { ArrowRight, Bot, Clock3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const employees = [
  {
    id: 'lead-employee',
    name: 'LEE',
    description: 'Qualifies incoming leads and matches them with suitable properties.',
  },
  {
    id: 'lead-revival-employee',
    name: 'REVA',
    description: 'Re-engages inactive leads and identifies renewed opportunities.',
  },
]

/**
 * Displays the two MVP AI Employees without inventing activity records.
 * Real task history can be connected when backend execution logging exists.
 */
export function AiEmployees() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>AI Employee Activity</CardTitle>

          <p className="mt-1 text-xs text-muted-foreground">
            Recent work performed by AI Employees.
          </p>
        </div>

        <Link
          href="/ai-employees"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View all
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </CardHeader>

      <CardContent>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {employees.map((employee) => (
            <div
              key={employee.id}
              className="flex items-start gap-3 rounded-xl border border-border p-4"
            >
              <span
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
              >
                <Bot className="size-5" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">
                  {employee.name}
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {employee.description}
                </p>

                <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock3 className="size-3.5" aria-hidden="true" />
                  <span>No recorded activity yet</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}