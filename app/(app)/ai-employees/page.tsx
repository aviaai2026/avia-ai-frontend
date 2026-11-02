
import type { Metadata } from 'next'
import { AIEmployeesContent } from '@/components/ai-employees/ai-employees-content'
import { PageContainer } from '@/components/layout/page'
import { getShellContext } from '@/lib/auth/shell'

export const metadata: Metadata = {
  title: 'AI Employees',
}

// Loads the authenticated workspace role before rendering AI Employees.
export default async function Page() {
  const shellContext = await getShellContext()

  return (
    <PageContainer>
      <AIEmployeesContent
        workspaceRole={shellContext.user.workspaceRole}
        currentUserId={shellContext.user.id}
   />
    </PageContainer>
  )
}
