import Link from 'next/link'
import { primaryNavigation, secondaryNavigation } from '@/config/navigation'
import type { Workspace } from '@/lib/types'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { BrandMark } from './brand-mark'
import { SidebarNavList } from './sidebar-nav-list'
import { SidebarPromoCard } from './sidebar-promo-card'

export function AppSidebar({ workspace }: { workspace: Workspace }) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-14 justify-center border-b border-sidebar-border px-3 group-data-[collapsible=icon]:px-2">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <BrandMark />
          <span className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold tracking-tight text-foreground">
              AVIAAI
            </span>
            <span className="truncate text-xs text-muted-foreground">{workspace.name}</span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <nav aria-label="Primary">
              <SidebarNavList
                itemIds={[...primaryNavigation, ...secondaryNavigation].map((item) => item.id)}
              />
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 group-data-[collapsible=icon]:hidden [@media(max-height:600px)]:hidden">
        <SidebarPromoCard />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
