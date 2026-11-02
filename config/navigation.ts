import {
  BarChart3,
  Bot,
  Building2,
  CalendarClock,
  LayoutDashboard,
  MessagesSquare,
  Settings,
  UserRoundSearch,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  id: string
  title: string
  href: string
  icon: LucideIcon
  description: string
}

export const primaryNavigation: NavItem[] = [
      {
        id: 'overview',
        title: 'Overview',
        href: '/',
        icon: LayoutDashboard,
        description: 'A snapshot of portfolio activity, pipeline, and operations.',
      },
      {
        id: 'leads',
        title: 'Leads',
        href: '/leads',
        icon: UserRoundSearch,
        description: 'Track prospective tenants and buyers through your pipeline.',
      },
      {
        id: 'properties',
        title: 'Properties',
        href: '/properties',
        icon: Building2,
        description: 'Manage buildings, units, availability, and listings.',
      },
      {
        id: 'ai-employees',
        title: 'AI Employees',
        href: '/ai-employees',
        icon: Bot,
        description: 'Configure and monitor the AI agents working for your team.',
      },
      {
        id: 'conversations',
        title: 'Conversations',
        href: '/conversations',
        icon: MessagesSquare,
        description: 'Review messages across channels with leads and residents.',
      },
      {
        id: 'appointments',
        title: 'Appointments',
        href: '/appointments',
        icon: CalendarClock,
        description: 'Schedule and manage tours, showings, and inspections.',
      },
      {
        id: 'maintenance',
        title: 'Maintenance',
        href: '/maintenance',
        icon: Wrench,
        description: 'Coordinate work orders, vendors, and resident requests.',
      },
      {
        id: 'analytics',
        title: 'Analytics',
        href: '/analytics',
        icon: BarChart3,
        description: 'Measure performance across leasing, operations, and AI activity.',
      },
]

export const secondaryNavigation: NavItem[] = [
  {
    id: 'settings',
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Manage your workspace, team members, and preferences.',
  },
]

const allNavItems = [
  ...primaryNavigation,
  ...secondaryNavigation,
]

export function getNavItem(id: string): NavItem {
  const item = allNavItems.find((navItem) => navItem.id === id)
  if (!item) throw new Error(`Unknown navigation item: ${id}`)
  return item
}

export function isNavItemActive(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function findActiveNavItem(pathname: string): NavItem | undefined {
  return allNavItems.find((item) => isNavItemActive(item.href, pathname))
}
