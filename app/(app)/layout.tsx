import { AppShell } from '@/components/app-shell/app-shell'
import { ConversationsProvider } from '@/components/conversations/conversations-provider'
import { getShellContext } from '@/lib/auth/shell'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { workspace, user } = await getShellContext()

  return (
    <ConversationsProvider>
      <AppShell workspace={workspace} user={user}>
        {children}
      </AppShell>
    </ConversationsProvider>
  )
}