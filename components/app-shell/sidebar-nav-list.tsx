'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getNavItem, isNavItemActive } from '@/config/navigation'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

export function SidebarNavList({ itemIds }: { itemIds: string[] }) {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()
  const items = itemIds.map(getNavItem)

  return (
    <SidebarMenu>
      {items.map((item) => {
        const isActive = isNavItemActive(item.href, pathname)
        const Icon = item.icon
        return (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton
              isActive={isActive}
              tooltip={item.title}
              className="h-9 text-sidebar-foreground data-active:text-sidebar-accent-foreground data-active:[&_svg]:text-primary"
              render={
                <Link
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => {
                    if (isMobile) setOpenMobile(false)
                  }}
                />
              }
            >
              <Icon aria-hidden="true" />
              <span>{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
