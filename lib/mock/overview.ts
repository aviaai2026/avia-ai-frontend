import { getShellContext } from '@/lib/auth/shell'

export type OverviewWelcome = {
  firstName: string
  businessDate: string
  timeZone: string
}

// Loads the real signed-in user's name and supplies the current date for the Overview.
export async function getOverviewWelcome(): Promise<OverviewWelcome> {
  const { user } = await getShellContext()
  const firstName = user.name.trim().split(/\s+/)[0] || 'there'

  return {
    firstName,
    businessDate: new Date().toISOString(),
    timeZone: 'UTC',
  }
}