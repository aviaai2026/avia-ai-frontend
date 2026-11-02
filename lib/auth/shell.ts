import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { ShellContext } from '@/lib/types'

type AuthMeResponse = {
  user: {
    id: string
    email: string
    full_name: string
    email_verified_at: string | null
    workspace: {
      id: string
      name: string
      default_currency: 'USD' | 'NGN' | 'AED'
      business_type: string | null
      operating_location: string | null
    }
    membership: {
      id: string
      role: 'owner' | 'manager' | 'agent'
      permissions: Record<string, boolean>
    }
  }
}

// Converts the backend workspace role into the human-readable role used by the AVIAAI shell.
function formatUserRole(role: 'owner' | 'manager' | 'agent'): string {
  const roleLabels = {
    owner: 'Workspace Owner',
    manager: 'Manager',
    agent: 'Agent',
  }

  return roleLabels[role]
}

// Loads the authenticated user's real workspace and identity from the FastAPI backend.
export async function getShellContext(): Promise<ShellContext> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('aviaai_session')

  if (!sessionCookie?.value) {
    redirect('/login')
  }

  const response = await fetch('http://localhost:8000/auth/me', {
    method: 'GET',
    headers: {
      Cookie: `aviaai_session=${sessionCookie.value}`,
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    console.error(
      '[AVIAAI auth] /auth/me failed:',
      response.status,
    )

    redirect('/login')
  }

  const data: AuthMeResponse = await response.json()
  const authenticatedUser = data.user

  return {
    workspace: {
      id: authenticatedUser.workspace.id,
      name: authenticatedUser.workspace.name,
      defaultCurrency: authenticatedUser.workspace.default_currency,
      businessType: authenticatedUser.workspace.business_type,
      operatingLocation: authenticatedUser.workspace.operating_location,
    },
    user: {
      id: authenticatedUser.id,
      name: authenticatedUser.full_name,
      email: authenticatedUser.email,
      role: formatUserRole(authenticatedUser.membership.role),
      workspaceRole: authenticatedUser.membership.role,
    },
  }
}