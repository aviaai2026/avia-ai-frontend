'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ChevronDown, LogOut, Settings, UserRound } from 'lucide-react'
import type { CurrentUser, Workspace } from '@/lib/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function UserMenu({
  user,
  workspace,
}: {
  user: CurrentUser
  workspace: Workspace
}) {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  // Signs the user out through the AVIAAI backend and returns them to login.
  async function handleSignOut() {
    if (isSigningOut) {
      return
    }

    setIsSigningOut(true)

    try {
      const response = await fetch(
        'http://localhost:8000/auth/logout',
        {
          method: 'POST',
          credentials: 'include',
        }
      )

      if (!response.ok) {
        throw new Error('Logout failed.')
      }

      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
      setIsSigningOut(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-1.5 outline-none transition-colors hover:bg-accent">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={user.avatarUrl ?? undefined}
            alt={user.name}
          />
          <AvatarFallback>
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>

        <div className="hidden min-w-0 text-left sm:block">
          <p className="truncate text-sm font-medium">
            {user.name}
          </p>

          <p className="truncate text-xs text-muted-foreground">
            {workspace.name}
          </p>
        </div>

        <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="truncate text-sm font-medium">
                {user.name}
              </span>

              <span className="truncate text-xs font-normal text-muted-foreground">
                {user.email}
              </span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link
              href="/settings"
              className="flex w-full items-center gap-2"
            >
              <UserRound aria-hidden="true" />
              Profile
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem>
            <Link
              href="/settings"
              className="flex w-full items-center gap-2"
            >
              <Settings aria-hidden="true" />
              Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            <LogOut aria-hidden="true" />
            {isSigningOut ? 'Signing out...' : 'Sign out'}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}