import type { ShellContext } from '@/lib/types'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppHeader } from './app-header'
import { AppSidebar } from './app-sidebar'

type AppShellProps = ShellContext & {
  children: React.ReactNode
}

export function AppShell({ workspace, user, children }: AppShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar workspace={workspace} />
      <SidebarInset className="min-w-0">
        <AppHeader user={user} workspace={workspace} />
        <div className="flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
