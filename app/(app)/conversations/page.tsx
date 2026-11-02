import type { Metadata } from 'next'
import { ConversationsContent } from '@/components/conversations/conversations-content'
import { PageContainer, PageHeader } from '@/components/layout/page'
import { getLeads } from '@/lib/api/leads'
import { getShellContext } from '@/lib/auth/shell'

export const metadata: Metadata = {
  title: 'Conversations',
}

export default async function Page() {
  const [leads, shellContext] = await Promise.all([
    getLeads(),
    getShellContext(),
  ])

  return (
    <PageContainer>
      <PageHeader
        title="Conversations"
        description="Manage customer conversations and communication across your leads."
      />

      <ConversationsContent
        leads={leads}
        currentUserId={shellContext.user.id}
      />
    </PageContainer>
  )
}