
import type { Metadata } from 'next'
import { PageContainer, PageHeader } from '@/components/layout/page'
import { LeadsContent } from '@/components/leads/leads-content'
import { getLeads } from '@/lib/api/leads'
import { getShellContext } from '@/lib/auth/shell'
export const metadata: Metadata = {
  title: 'Leads',
}

export default async function Page() {
  const [leads, shell] = await Promise.all([
    getLeads(),
    getShellContext(),
  ])

  return (
    <PageContainer>
      <PageHeader
        title="Leads"
        description="Manage, qualify, and track prospective buyers and tenants."
      />

      <LeadsContent
        initialLeads={leads}
        defaultCurrency={shell.workspace.defaultCurrency}
      />
    </PageContainer>
  )
}