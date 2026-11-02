'use client'

import {
  Bell,
  Building2,
  CheckCircle2,
  ChevronRight,
  Globe,
  Lock,
  MessageCircle,
  ShieldCheck,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

type SettingsSection =
  | 'workspace'
  | 'profile'
  | 'team'
  | 'ai'
  | 'channels'
  | 'security'
  | 'notifications'

type ChannelKey = 'whatsapp' | 'instagram' | 'website'

type ChannelStatus = 'not_configured' | 'connected' | 'disconnected'

type ChannelViewStatus = ChannelStatus | 'unavailable'

type Channel = {
  id: ChannelKey
  name: string
  description: string
  icon: typeof MessageCircle
}

type TeamRole = 'Owner' | 'Manager' | 'Agent'


type TeamMember = {
  id: string
  name: string
  email: string
  role: TeamRole
  permissions: MemberPermissions
}

type MemberPermissions = {
  leads: boolean
  properties: boolean
  conversations: boolean
  appointments: boolean
  aiEmployees: boolean
  analytics: boolean
  teamManagement: boolean
  billing: boolean
  viewTeam: boolean
  inviteMembers: boolean
  removeMembers: boolean
}


// Returns visual styling based on the channel status received from the backend.
function getChannelStyles(status: ChannelViewStatus) {
  return status === 'connected'
    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
    : 'border-border bg-muted text-muted-foreground'
}

const channels: Channel[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    description:
      'Connect WhatsApp conversations so AVIA can receive and respond to approved customer messages.',
    icon: MessageCircle,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description:
      'Connect Instagram messages for lead capture and customer communication.',
    icon: MessageCircle,
  },
  {
    id: 'website',
    name: 'Website',
    description:
      'Connect your website to receive inquiries and customer conversations.',
    icon: Globe,
  },
]

// Provides safe defaults for members who have not received delegated admin powers.
const defaultPermissions: MemberPermissions = {
  leads: true,
  properties: true,
  conversations: true,
  appointments: true,
  aiEmployees: true,
  analytics: true,
  teamManagement: false,
  billing: false,
  viewTeam: false,
  inviteMembers: false,
  removeMembers: false,
}

// Returns the default permission set for a selected workspace role.
function getRolePermissions(role: TeamRole): MemberPermissions {
  if (role === 'Owner') {
    return {
      leads: true,
      properties: true,
      conversations: true,
      appointments: true,
      aiEmployees: true,
      analytics: true,
      teamManagement: true,
      billing: true,
      viewTeam: true,
      inviteMembers: true,
      removeMembers: true,
    }
  }

  if (role === 'Manager') {
    return {
      leads: true,
      properties: true,
      conversations: true,
      appointments: true,
      aiEmployees: true,
      analytics: true,
      teamManagement: true,
      billing: false,
      viewTeam: true,
      inviteMembers: false,
      removeMembers: false,
    }
  }
  return { ...defaultPermissions }
}


// Returns a human-readable label for each team permission.
function getPermissionLabel(permission: keyof MemberPermissions): string {
  const labels: Record<keyof MemberPermissions, string> = {
    leads: 'Leads',
    properties: 'Properties',
    conversations: 'Conversations',
    appointments: 'Appointments',
    aiEmployees: 'AI Employees',
    analytics: 'Analytics',
    teamManagement: 'Team Management',
    billing: 'Billing',
    viewTeam: 'View Team',
    inviteMembers: 'Invite Members',
    removeMembers: 'Remove Members',
  }

  return labels[permission]
}

// Identifies the permission settings that an Owner can configure for a member.
function isConfigurableTeamPermission(
  permission: keyof MemberPermissions,
): boolean {
  return [
    'teamManagement',
    'billing',
    'viewTeam',
    'inviteMembers',
    'removeMembers',
  ].includes(permission)
}

// Renders the AVIA settings workspace and keeps its active section synchronized with the URL.
export function SettingsContent() {
  const searchParams = useSearchParams()

  const [activeSection, setActiveSection] =
    useState<SettingsSection>('workspace')


  const [workspaceName, setWorkspaceName] = useState('')
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(true)
  const [isWorkspaceSaving, setIsWorkspaceSaving] = useState(false)
  const [workspaceMessage, setWorkspaceMessage] = useState('')
  const [workspaceError, setWorkspaceError] = useState('')
  const [defaultCurrency, setDefaultCurrency] = useState<'USD' | 'NGN' | 'AED'>('NGN')
const [isCurrencySaving, setIsCurrencySaving] = useState(false)
const [currencyMessage, setCurrencyMessage] = useState('')
const [currencyError, setCurrencyError] = useState('')
  const [profileName, setProfileName] = useState('')
  const [profileEmail, setProfileEmail] = useState('')
  const [profileRole, setProfileRole] = useState('')

  const [notificationPreferences, setNotificationPreferences] = useState({
    notifications_enabled: true,
    notify_new_leads: true,
    notify_ai_escalations: true,
    notify_system_alerts: true,
  })
  const [isNotificationLoading, setIsNotificationLoading] = useState(true)
  const [isNotificationSaving, setIsNotificationSaving] = useState(false)
  const [notificationError, setNotificationError] = useState('')
  const [notificationMessage, setNotificationMessage] = useState('')

    const [escalationEnabled, setEscalationEnabled] = useState(true)
    const [isEscalationLoading, setIsEscalationLoading] = useState(true)
    const [isEscalationSaving, setIsEscalationSaving] = useState(false)
    const [escalationError, setEscalationError] = useState('')


const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
const [isTeamLoading, setIsTeamLoading] = useState(true)
const [teamError, setTeamError] = useState('')
const [teamNotice, setTeamNotice] = useState('')
const [isSavingPermissions, setIsSavingPermissions] = useState(false)

  const [selectedMember, setSelectedMember] =
    useState<TeamMember | null>(null)

  const [selectedPermissions, setSelectedPermissions] =
    useState<MemberPermissions>(defaultPermissions)

  const [showRemoveConfirmation, setShowRemoveConfirmation] =
    useState(false)

  const [showInviteModal, setShowInviteModal] = useState(false)

  const [inviteName, setInviteName] = useState('')

  const [inviteEmail, setInviteEmail] = useState('')

  const [inviteRole, setInviteRole] = useState<TeamRole>('Agent')

  const [invitePermissions, setInvitePermissions] =
    useState<MemberPermissions>(getRolePermissions('Agent'))

  const [inviteError, setInviteError] = useState('')
  const [isSendingInvite, setIsSendingInvite] = useState(false)
const [invitationLink, setInvitationLink] = useState('')
const [inviteNotice, setInviteNotice] = useState('')

const [channelStatuses, setChannelStatuses] = useState<
  Record<ChannelKey, ChannelViewStatus>
>({
  whatsapp: 'unavailable',
  instagram: 'unavailable',
  website: 'unavailable',
})
const [isChannelLoading, setIsChannelLoading] = useState(true)
const [channelError, setChannelError] = useState('')

// Loads saved channel statuses for the authenticated workspace without caching.
useEffect(() => {
  let cancelled = false

  // Fetches channel statuses and validates the response before updating the UI.
  async function loadWorkspaceChannels() {
    try {
      const response = await fetch('/api/workspace/channels', {
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error('Could not load channel statuses.')
      }

      const data = (await response.json()) as {
        channels?: Array<{
          channel: ChannelKey
          status: ChannelStatus
        }>
      }

      if (!Array.isArray(data.channels)) {
        throw new Error('The backend returned an invalid channels response.')
      }

      const nextStatuses: Record<ChannelKey, ChannelViewStatus> = {
        whatsapp: 'unavailable',
        instagram: 'unavailable',
        website: 'unavailable',
      }

      for (const item of data.channels) {
        if (
          (item.channel === 'whatsapp' ||
            item.channel === 'instagram' ||
            item.channel === 'website') &&
          (item.status === 'not_configured' ||
            item.status === 'connected' ||
            item.status === 'disconnected')
        ) {
          nextStatuses[item.channel] = item.status
        }
      }

      if (!cancelled) {
        setChannelStatuses(nextStatuses)
        setChannelError('')
      }
    } catch {
      if (!cancelled) {
        setChannelError(
          'Could not load channel statuses. Please refresh and try again.',
        )
      }
    } finally {
      if (!cancelled) {
        setIsChannelLoading(false)
      }
    }
  }

  void loadWorkspaceChannels()

  return () => {
    cancelled = true
  }
}, [])


  // Synchronizes the visible settings section with the section requested in the URL.
  useEffect(() => {
    const requestedSection = searchParams.get('section')

    if (
      requestedSection === 'workspace' ||
      requestedSection === 'profile' ||
      requestedSection === 'team' ||
      requestedSection === 'ai' ||
      requestedSection === 'channels' ||
      requestedSection === 'security' ||
      requestedSection === 'notifications'
    ) {
      setActiveSection(requestedSection)
      return
    }

    setActiveSection('workspace')
  }, [searchParams])



// Loads the authenticated workspace name from the backend through the Next.js API bridge.
useEffect(() => {
  let cancelled = false
// Fetches the authenticated workspace name and handles loading errors.
  async function loadWorkspace() {
    try {
      const response = await fetch('/api/auth/me', {
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error('Could not load your workspace information.')
      }

      const data = await response.json()
      const user = data.user
const email = user?.email
const role = user?.membership?.role

if (typeof email !== 'string' || typeof role !== 'string') {
  throw new Error('The backend returned incomplete profile information.')
}

const roleLabel =
  role === 'owner'
    ? 'Workspace Owner'
    : role === 'manager'
      ? 'Manager'
      : role === 'agent'
        ? 'Agent'
        : 'Unknown role'
      const name = data.user?.workspace?.name
      const savedCurrency = data.user?.workspace?.default_currency

if (
  savedCurrency !== 'USD' &&
  savedCurrency !== 'NGN' &&
  savedCurrency !== 'AED'
) {
  throw new Error('The backend returned an invalid workspace currency.')
}

      if (typeof name !== 'string' || !name.trim()) {
        throw new Error('The backend returned an invalid workspace name.')
      }

      if (!cancelled) {
        setWorkspaceName(name)
        setWorkspaceError('')
        setDefaultCurrency(savedCurrency)
        setCurrencyError('')
        setProfileName(
          typeof user.full_name === 'string' ? user.full_name : 'Name unavailable',
        )
        setProfileEmail(email)
        setProfileRole(roleLabel)
      }
    } catch (error) {
      if (!cancelled) {
        setWorkspaceError(
          error instanceof Error
            ? error.message
            : 'Could not load your workspace information.',
        )
      }
    } finally {
      if (!cancelled) {
        setIsWorkspaceLoading(false)
      }
    }
  }

  void loadWorkspace()

  return () => {
    cancelled = true
  }
}, [])


  // Loads real workspace members and their saved roles and permissions from the backend.
  useEffect(() => {
    let cancelled = false

    // Fetches the member list and safely maps backend records to the settings UI.
    async function loadTeamMembers() {
      setIsTeamLoading(true)
      setTeamError('')

      try {
        const response = await fetch('/api/workspace/members', {
          cache: 'no-store',
        })

        const data = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(
            typeof data?.detail === 'string'
              ? data.detail
              : 'Could not load workspace members.',
          )
        }

        if (!Array.isArray(data?.members)) {
          throw new Error('The backend returned an invalid member list.')
        }

        const validMembers: TeamMember[] = data.members.map(
          (member: unknown) => {
            if (
              typeof member !== 'object' ||
              member === null ||
              !('id' in member) ||
              !('name' in member) ||
              !('email' in member) ||
              !('role' in member) ||
              typeof member.id !== 'string' ||
              typeof member.name !== 'string' ||
              typeof member.email !== 'string' ||
              typeof member.role !== 'string'
            ) {
              throw new Error(
                'The backend returned an invalid workspace member.',
              )
            }

            const role: TeamRole =
              member.role === 'owner'
                ? 'Owner'
                : member.role === 'manager'
                  ? 'Manager'
                  : member.role === 'agent'
                    ? 'Agent'
                    : (() => {
                        throw new Error(
                          'The backend returned an unknown member role.',
                        )
                      })()

                      const savedPermissions: Partial<MemberPermissions> =
                      'permissions' in member &&
                      typeof member.permissions === 'object' &&
                      member.permissions !== null
                        ? (member.permissions as Partial<MemberPermissions>)
                        : {}

            const permissions: MemberPermissions = {
              ...defaultPermissions,
              ...getRolePermissions(role),
            }

            for (const key of Object.keys(defaultPermissions) as Array<
              keyof MemberPermissions
            >) {
              if (
                key in savedPermissions &&
                typeof savedPermissions[key] === 'boolean'
              ) {
                permissions[key] = savedPermissions[key]
              }
            }

            return {
              id: member.id,
              name: member.name,
              email: member.email,
              role,
              permissions,
            }
          },
        )

        if (!cancelled) {
          setTeamMembers(validMembers)
          setTeamError('')
        }
      } catch (error) {
        if (!cancelled) {
          setTeamError(
            error instanceof Error
              ? error.message
              : 'Could not load workspace members.',
          )
        }
      } finally {
        if (!cancelled) {
          setIsTeamLoading(false)
        }
      }
    }

    void loadTeamMembers()

    return () => {
      cancelled = true
    }
  }, [])


  // Loads the saved workspace escalation policy without caching the response.
  useEffect(() => {
    let cancelled = false

    // Fetches the persisted policy and reports errors instead of hiding them.
    async function loadEscalationPolicy() {
      setIsEscalationLoading(true)
      setEscalationError('')

      try {
        const response = await fetch('/api/workspace/ai-policy', {
          cache: 'no-store',
        })

        const data = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(
            typeof data?.detail === 'string'
              ? data.detail
              : 'Could not load the workspace AI policy.',
          )
        }

        const enabled = data?.policy?.human_escalation_enabled

        if (typeof enabled !== 'boolean') {
          throw new Error('The backend returned an invalid AI policy.')
        }

        if (!cancelled) {
          setEscalationEnabled(enabled)
        }
      } catch (error) {
        if (!cancelled) {
          setEscalationError(
            error instanceof Error
              ? error.message
              : 'Could not load the workspace AI policy.',
          )
        }
      } finally {
        if (!cancelled) {
          setIsEscalationLoading(false)
        }
      }
    }

    void loadEscalationPolicy()

    return () => {
      cancelled = true
    }
  }, [])


    // Loads the saved notification preferences for the authenticated workspace.
    useEffect(() => {
      let cancelled = false

      // Fetches and validates all four persisted notification preferences.
      async function loadNotificationPreferences() {
        setIsNotificationLoading(true)
        setNotificationError('')
        setNotificationMessage('')

        try {
          const response = await fetch(
            '/api/workspace/notification-preferences',
            { cache: 'no-store' },
          )

          const data = await response.json().catch(() => null)

          if (!response.ok) {
            throw new Error(
              typeof data?.detail === 'string'
                ? data.detail
                : 'Could not load notification preferences.',
            )
          }

          const preferences = data?.preferences

          if (
            typeof preferences?.notifications_enabled !== 'boolean' ||
            typeof preferences?.notify_new_leads !== 'boolean' ||
            typeof preferences?.notify_ai_escalations !== 'boolean' ||
            typeof preferences?.notify_system_alerts !== 'boolean'
          ) {
            throw new Error(
              'The backend returned invalid notification preferences.',
            )
          }

          if (!cancelled) {
            setNotificationPreferences({
              notifications_enabled: preferences.notifications_enabled,
              notify_new_leads: preferences.notify_new_leads,
              notify_ai_escalations: preferences.notify_ai_escalations,
              notify_system_alerts: preferences.notify_system_alerts,
            })
          }
        } catch (error) {
          if (!cancelled) {
            setNotificationError(
              error instanceof Error
                ? error.message
                : 'Could not load notification preferences.',
            )
          }
        } finally {
          if (!cancelled) {
            setIsNotificationLoading(false)
          }
        }
      }

      void loadNotificationPreferences()

      return () => {
        cancelled = true
      }
    }, [])

// Saves the workspace name and displays feedback only after the API responds.
async function handleSaveWorkspace() {
  if (isWorkspaceSaving || isWorkspaceLoading) {
    return
  }

  const name = workspaceName.trim()

  if (name.length < 2 || name.length > 200) {
    setWorkspaceError('Workspace name must contain 2–200 characters.')
    setWorkspaceMessage('')
    return
  }

  setIsWorkspaceSaving(true)
  setWorkspaceError('')
  setWorkspaceMessage('')

  try {
    const response = await fetch('/api/workspace/setup', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(
        typeof data?.detail === 'string'
          ? data.detail
          : 'Could not save the workspace name.',
      )
    }

    const savedName = data?.workspace?.name

    if (typeof savedName !== 'string' || !savedName.trim()) {
      throw new Error('The backend response did not confirm the saved name.')
    }

    setWorkspaceName(savedName)
    setWorkspaceMessage('Workspace name saved successfully.')
  } catch (error) {
    setWorkspaceError(
      error instanceof Error
        ? error.message
        : 'Could not save the workspace name.',
    )
  } finally {
    setIsWorkspaceSaving(false)
  }
}

// Saves the workspace default currency and waits for backend confirmation.
async function handleSaveCurrency() {
  if (
    isCurrencySaving ||
    isWorkspaceLoading ||
    profileRole !== 'Workspace Owner'
  ) {
    return
  }

  setIsCurrencySaving(true)
  setCurrencyError('')
  setCurrencyMessage('')

  try {
    const response = await fetch('/api/workspace/currency', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        default_currency: defaultCurrency,
      }),
      cache: 'no-store',
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        typeof data?.detail === 'string'
          ? data.detail
          : 'Could not save the default property currency.',
      )
    }

    const savedCurrency = data?.workspace?.default_currency

    if (
      savedCurrency !== 'USD' &&
      savedCurrency !== 'NGN' &&
      savedCurrency !== 'AED'
    ) {
      throw new Error(
        'The backend did not confirm the saved workspace currency.',
      )
    }

    setDefaultCurrency(savedCurrency)
    setCurrencyMessage('Default property currency saved successfully.')
  } catch (error) {
    setCurrencyError(
      error instanceof Error
        ? error.message
        : 'Could not save the default property currency.',
    )
  } finally {
    setIsCurrencySaving(false)
  }
}


  // Opens a team member's details and initializes their saved permissions.
  function handleMemberSelect(member: TeamMember) {
    setSelectedMember(member)
    setSelectedPermissions(member.permissions)
    setShowRemoveConfirmation(false)
    setTeamNotice('')
  }


  // Updates a member's role through the backend and refreshes the selected member only after success.
  async function handleMemberRoleChange(role: TeamRole) {
    if (
      !selectedMember ||
      selectedMember.role === 'Owner' ||
      role === 'Owner' ||
      role === selectedMember.role
    ) {
      return
    }

    setTeamNotice('')

    try {
      const response = await fetch(
        `/api/workspace/members/${encodeURIComponent(selectedMember.id)}/role`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role: role.toLowerCase() }),
          cache: 'no-store',
        },
      )

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          typeof data?.detail === 'string'
            ? data.detail
            : 'Could not update this member’s role.',
        )
      }

      const updatedMember: TeamMember = {
        ...selectedMember,
        role,
        permissions: getRolePermissions(role),
      }

      setTeamMembers((currentMembers) =>
        currentMembers.map((member) =>
          member.id === selectedMember.id ? updatedMember : member,
        ),
      )

      setSelectedMember(updatedMember)
      setSelectedPermissions(updatedMember.permissions)
      setTeamNotice('Member role updated successfully.')
    } catch (error) {
      setTeamNotice(
        error instanceof Error
          ? error.message
          : 'Could not update this member’s role.',
      )
    }
  }


  // Closes the selected team member panel and any open confirmation dialog.
  function handleCloseMemberPanel() {
    setSelectedMember(null)
    setShowRemoveConfirmation(false)
  }


  // Toggles one permission for the selected team member in the UI.
  function handlePermissionToggle(
    permission: keyof MemberPermissions
  ) {
    setSelectedPermissions((current) => ({
      ...current,
      [permission]: !current[permission],
    }))
  }

// Saves permission changes through the authenticated backend and reports the actual result.
async function handleSaveMemberPermissions() {
  if (!selectedMember || isSavingPermissions) {
    return
  }

  setIsSavingPermissions(true)
  setTeamNotice('')

  try {
    const response = await fetch(
      `/api/workspace/members/${encodeURIComponent(selectedMember.id)}/permissions`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          permissions: selectedPermissions,
        }),
        cache: 'no-store',
      },
    )

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(
        typeof data?.detail === 'string'
          ? data.detail
          : 'Could not save member permissions.',
      )
    }

    setTeamMembers((currentMembers) =>
      currentMembers.map((member) =>
        member.id === selectedMember.id
          ? { ...member, permissions: { ...selectedPermissions } }
          : member,
      ),
    )

    setSelectedMember((current) =>
      current && current.id === selectedMember.id
        ? { ...current, permissions: { ...selectedPermissions } }
        : current,
    )

    setTeamNotice('Permissions saved successfully.')
  } catch (error) {
    setTeamNotice(
      error instanceof Error
        ? error.message
        : 'Could not save member permissions.',
    )
  } finally {
    setIsSavingPermissions(false)
  }
}


  // Removes the selected member through the backend before updating the UI.
  async function handleRemoveMember() {
    if (!selectedMember || selectedMember.role === 'Owner') {
      return
    }

    setTeamNotice('')

    try {
      const response = await fetch(
        `/api/workspace/members/${encodeURIComponent(selectedMember.id)}`,
        {
          method: 'DELETE',
          cache: 'no-store',
        },
      )

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          typeof data?.detail === 'string'
            ? data.detail
            : 'Could not remove this team member.',
        )
      }

      setTeamMembers((currentMembers) =>
        currentMembers.filter(
          (member) => member.id !== selectedMember.id,
        ),
      )

      handleCloseMemberPanel()
      setTeamNotice('Team member removed successfully.')
    } catch (error) {
      setTeamNotice(
        error instanceof Error
          ? error.message
          : 'Could not remove this team member.',
      )
    }
  }

  // Opens the invitation form and resets it to a clean state.
  function handleOpenInviteModal() {
    setInviteName('')
    setInviteEmail('')
    setInviteRole('Agent')
    setInvitePermissions(getRolePermissions('Agent'))
    setInviteError('')
    setInvitationLink('')
    setInviteNotice('')
    setShowInviteModal(true)
  }

  // Closes the invitation form and clears its temporary error state.
  function handleCloseInviteModal() {
    setShowInviteModal(false)
    setInviteError('')
  }

  // Updates the invitation role and applies its default permission template.
  function handleInviteRoleChange(role: TeamRole) {
    setInviteRole(role)
    setInvitePermissions(getRolePermissions(role))
  }

  // Toggles an individual permission while preparing a team invitation.
  function handleInvitePermissionToggle(
    permission: keyof MemberPermissions
  ) {
    setInvitePermissions((current) => ({
      ...current,
      [permission]: !current[permission],
    }))
  }


  // Creates a backend invitation and builds a private acceptance link only after success.
  async function handleSendInvite() {
    if (!inviteName.trim()) {
      setInviteError('Enter the member’s name.')
      return
    }

    if (!inviteEmail.trim()) {
      setInviteError('Enter the member’s email.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail.trim())) {
      setInviteError('Enter a valid email address.')
      return
    }

    setInviteError('')
    setInviteNotice('')
    setInvitationLink('')
    setIsSendingInvite(true)

    try {
      const response = await fetch('/api/workspace/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          full_name: inviteName.trim(),
          role: inviteRole.toLowerCase(),
          permissions: invitePermissions,
        }),
        cache: 'no-store',
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          typeof data?.detail === 'string'
            ? data.detail
            : 'Could not create the invitation.',
        )
      }

      const token = data?.invitation?.token

      if (typeof token !== 'string' || !token) {
        throw new Error(
          'The invitation was created, but no invitation token was returned. Check the backend response.',
        )
      }

      const link = `${window.location.origin}/invite/accept?token=${encodeURIComponent(token)}`

      setInvitationLink(link)
      setInviteNotice(
        'Invitation created. Email has not been sent; share this link privately with the intended recipient.',
      )
    } catch (error) {
      setInviteError(
        error instanceof Error
          ? error.message
          : 'Could not create the invitation.',
      )
    } finally {
      setIsSendingInvite(false)
    }
  }


  // Saves a requested toggle change and updates the UI only after backend confirmation.
  async function handleEscalationToggle() {
    if (
      isEscalationLoading ||
      isEscalationSaving ||
      profileRole !== 'Workspace Owner'
    ) {
      return
    }

    const nextValue = !escalationEnabled
    setIsEscalationSaving(true)
    setEscalationError('')

    try {
      const response = await fetch('/api/workspace/ai-policy', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          human_escalation_enabled: nextValue,
        }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          typeof data?.detail === 'string'
            ? data.detail
            : 'Could not save the workspace AI policy.',
        )
      }

      if (data?.policy?.human_escalation_enabled !== nextValue) {
        throw new Error('The backend did not confirm the requested policy.')
      }

      setEscalationEnabled(nextValue)
    } catch (error) {
      setEscalationError(
        error instanceof Error
          ? error.message
          : 'Could not save the workspace AI policy.',
      )
    } finally {
      setIsEscalationSaving(false)
    }
  }


  // Saves one notification preference and waits for backend confirmation before updating the UI.
  async function handleNotificationToggle(
    key: keyof typeof notificationPreferences,
  ) {
    if (
      isNotificationLoading ||
      isNotificationSaving ||
      profileRole !== 'Workspace Owner'
    ) {
      return
    }

    const nextPreferences = {
      ...notificationPreferences,
      [key]: !notificationPreferences[key],
    }

    setIsNotificationSaving(true)
    setNotificationError('')
    setNotificationMessage('')

    try {
      const response = await fetch(
        '/api/workspace/notification-preferences',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(nextPreferences),
        },
      )

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          typeof data?.detail === 'string'
            ? data.detail
            : 'Could not save notification preferences.',
        )
      }

      const saved = data?.preferences

      if (
        saved?.notifications_enabled !==
          nextPreferences.notifications_enabled ||
        saved?.notify_new_leads !== nextPreferences.notify_new_leads ||
        saved?.notify_ai_escalations !==
          nextPreferences.notify_ai_escalations ||
        saved?.notify_system_alerts !==
          nextPreferences.notify_system_alerts
      ) {
        throw new Error(
          'The backend did not confirm the requested notification preferences.',
        )
      }

      setNotificationPreferences(nextPreferences)
      setNotificationMessage('Notification preferences saved.')
    } catch (error) {
      setNotificationError(
        error instanceof Error
          ? error.message
          : 'Could not save notification preferences.',
      )
    } finally {
      setIsNotificationSaving(false)
    }
  }



  return (
    <div className="space-y-8">
      <div className="max-w-3xl">
        <p className="text-sm font-medium text-primary">
          AVIA Settings
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Configure your AVIA workspace.
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
          Manage workspace information, AI behavior, connected channels,
          team access, security, and notifications.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-border bg-card p-2">
          {[
            {
              id: 'workspace' as const,
              label: 'Workspace',
              icon: Building2,
            },
            {
              id: 'profile' as const,
              label: 'Profile',
              icon: User,
            },
            {
              id: 'team' as const,
              label: 'Team & Permissions',
              icon: Users,
            },
            {
              id: 'ai' as const,
              label: 'AI & Automation',
              icon: ShieldCheck,
            },
            {
              id: 'channels' as const,
              label: 'Connected Channels',
              icon: MessageCircle,
            },
            {
              id: 'security' as const,
              label: 'Security',
              icon: Lock,
            },
            {
              id: 'notifications' as const,
              label: 'Notifications',
              icon: Bell,
            },
          ].map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isActive
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                }`}
              >
                <Icon className="size-4 shrink-0" />

                <span className="min-w-0 flex-1">
                  {item.label}
                </span>

                {isActive && (
                  <ChevronRight className="size-4 shrink-0 text-primary" />
                )}
              </button>
            )
          })}
        </aside>

        <main className="min-w-0 rounded-2xl border border-border bg-card p-5 sm:p-6">
          {activeSection === 'workspace' && (
            <section>
              <h2 className="text-lg font-semibold text-foreground">
                Workspace
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Basic information about this AVIA workspace.
              </p>

              <div className="mt-6 space-y-5">
                <div>
                  <label
                    htmlFor="workspace-name"
                    className="text-sm font-medium text-foreground"
                  >
                    Workspace name
                  </label>


<input
  id="workspace-name"
  disabled={isWorkspaceLoading || isWorkspaceSaving}
  value={workspaceName}
  onChange={(event) => {
    setWorkspaceName(event.target.value)
    setWorkspaceMessage('')
    setWorkspaceError('')
  }}
  className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60"
/>


                  <p className="mt-2 text-xs text-muted-foreground">
                    This identifies the business workspace inside AVIA.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-background/30 p-4">
                  <div className="flex items-start gap-3">
                    <Building2 className="mt-0.5 size-5 text-primary" />

                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Workspace isolation
                      </p>

                      <p className="mt-1 text-sm leading-5 text-muted-foreground">
                        In production, company data will be isolated by
                        workspace and enforced by the backend.
                      </p>
                    </div>
                  </div>
                </div>


<button
  type="button"
  onClick={handleSaveWorkspace}
  disabled={isWorkspaceLoading || isWorkspaceSaving}
  className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
>
  {isWorkspaceLoading
    ? 'Loading workspace...'
    : isWorkspaceSaving
      ? 'Saving...'
      : 'Save workspace'}
</button>

{workspaceError && (
  <p role="alert" className="mt-3 text-sm text-destructive">
    {workspaceError}
  </p>
)}

{workspaceMessage && (
  <p role="status" className="mt-3 text-sm text-emerald-600">
    {workspaceMessage}
  </p>
)}


<div className="border-t border-border pt-5">
  <div>
    <h3 className="text-sm font-semibold text-foreground">
      Default property currency
    </h3>

    <p className="mt-1 text-sm text-muted-foreground">
      New properties will use this currency unless you choose another.
      Existing property prices and currencies will not be changed.
    </p>
  </div>

  <div className="mt-4 max-w-sm">
    <label
      htmlFor="default-property-currency"
      className="text-sm font-medium text-foreground"
    >
      Currency
    </label>

    <select
      id="default-property-currency"
      value={defaultCurrency}
      disabled={
        isWorkspaceLoading ||
        isCurrencySaving ||
        profileRole !== 'Workspace Owner'
      }
      onChange={(event) => {
        setDefaultCurrency(event.target.value as 'USD' | 'NGN' | 'AED')
        setCurrencyMessage('')
        setCurrencyError('')
      }}
      className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <option value="NGN">NGN — Nigerian Naira</option>
      <option value="USD">USD — US Dollar</option>
      <option value="AED">AED — UAE Dirham</option>
    </select>
  </div>

  <button
    type="button"
    onClick={handleSaveCurrency}
    disabled={
      isWorkspaceLoading ||
      isCurrencySaving ||
      profileRole !== 'Workspace Owner'
    }
    className="mt-4 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    {isCurrencySaving ? 'Saving...' : 'Save currency'}
  </button>

  {profileRole !== 'Workspace Owner' && (
    <p className="mt-3 text-sm text-muted-foreground">
      Only the workspace owner can change the default property currency.
    </p>
  )}

  {currencyError && (
    <p role="alert" className="mt-3 text-sm text-destructive">
      {currencyError}
    </p>
  )}

  {currencyMessage && (
    <p role="status" className="mt-3 text-sm text-emerald-600">
      {currencyMessage}
    </p>
  )}
</div>


              </div>
            </section>
          )}


{activeSection === 'profile' && (
  <section>
    <h2 className="text-lg font-semibold text-foreground">
      Profile
    </h2>

    <p className="mt-1 text-sm text-muted-foreground">
      Your account information and workspace role.
    </p>

    {isWorkspaceLoading ? (
      <p className="mt-6 text-sm text-muted-foreground">
        Loading profile...
      </p>
    ) : workspaceError ? (
      <p role="alert" className="mt-6 text-sm text-destructive">
        {workspaceError}
      </p>
    ) : (
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Name
          </p>
          <p className="mt-2 text-sm font-medium text-foreground">
            {profileName}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Email
          </p>
          <p className="mt-2 break-all text-sm font-medium text-foreground">
            {profileEmail}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Role
          </p>
          <p className="mt-2 text-sm font-medium text-foreground">
            {profileRole}
          </p>
        </div>
      </div>
    )}
  </section>
)}

          {activeSection === 'team' && (
            <section>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Team & Permissions
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Manage who can access this workspace and what they can do.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenInviteModal}
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Invite member
                </button>
              </div>


<div className="mt-6 overflow-hidden rounded-xl border border-border">
  <div className="hidden grid-cols-[1.4fr_1.6fr_0.8fr] gap-4 border-b border-border bg-background/40 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:grid">
    <span>Name</span>
    <span>Email</span>
    <span>Role</span>
  </div>

  {isTeamLoading ? (
    <p className="px-4 py-6 text-sm text-muted-foreground">
      Loading workspace members…
    </p>
  ) : teamError ? (
    <div className="px-4 py-6">
      <p className="text-sm text-destructive">{teamError}</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-3 rounded-lg border border-border px-3 py-2 text-sm text-foreground"
      >
        Reload page
      </button>
    </div>
  ) : teamMembers.length === 0 ? (
    <p className="px-4 py-6 text-sm text-muted-foreground">
      No members were returned for this workspace.
    </p>
  ) : (
    <div className="divide-y divide-border">
      {teamMembers.map((member) => (
        <button
          key={member.id}
          type="button"
          onClick={() => handleMemberSelect(member)}
          className="grid w-full gap-3 px-4 py-4 text-left transition-colors hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:grid-cols-[1.4fr_1.6fr_0.8fr] sm:items-center sm:gap-4"
        >
          <div>
            <p className="text-sm font-medium text-foreground">
              {member.name}
            </p>
            <p className="mt-1 text-xs text-muted-foreground sm:hidden">
              {member.email}
            </p>
          </div>

          <p className="hidden truncate text-sm text-muted-foreground sm:block">
            {member.email}
          </p>

          <span className="w-fit rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-foreground">
            {member.role}
          </span>
        </button>
      ))}
    </div>
  )}
</div>

              <div className="mt-5 rounded-xl border border-border bg-background/30 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />

                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Permissions are enforced by the backend
                    </p>

                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                     This list comes from your active workspace. The backend checks
                     workspace membership and permissions before allowing protected actions.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'ai' && (
            <section>
              <h2 className="text-lg font-semibold text-foreground">
                AI & Automation
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Control how AVIA AI Employees operate within approved
                boundaries.
              </p>

<p className="mt-2 text-xs text-muted-foreground" aria-live="polite">
  {isEscalationLoading
    ? 'Loading saved policy…'
    : isEscalationSaving
      ? 'Saving policy…'
      : profileRole !== 'Workspace Owner'
        ? 'Only the workspace owner can change this setting.'
        : 'Changes are saved to your workspace.'}
</p>

{escalationError && (
  <p className="mt-2 text-sm text-destructive" role="alert">
    {escalationError}
  </p>
)}


              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between gap-5 rounded-xl border border-border bg-background/30 p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Human escalation
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Escalate situations outside an employee's approved
                      authority.
                    </p>
                  </div>


<button
  type="button"
  role="switch"
  aria-label="Human escalation"
  aria-checked={escalationEnabled}
  aria-busy={isEscalationSaving}
  disabled={
    isEscalationLoading ||
    isEscalationSaving ||
    profileRole !== 'Workspace Owner'
  }
  onClick={() => void handleEscalationToggle()}
  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
    escalationEnabled ? 'bg-primary' : 'bg-secondary'
  }`}
>
  <span
    className={`absolute top-1 size-4 rounded-full bg-primary-foreground transition-transform ${
      escalationEnabled ? 'left-6' : 'left-1'
    }`}
  />
</button>

                </div>

                <div className="rounded-xl border border-border bg-background/30 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 size-5 text-primary" />

                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Backend enforcement
                      </p>


<p className="mt-1 text-sm leading-5 text-muted-foreground">
  The escalation preference is stored as a workspace policy. AI execution
  flows must consult and enforce this policy before it changes runtime
  behavior. This setting does not grant an AI Employee additional permissions.
</p>

                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'channels' && (
            <section>
              <h2 className="text-lg font-semibold text-foreground">
                Connected Channels
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Manage the communication channels available to AVIA.
              </p>

              {channelError && (
                <p role="alert" className="mt-3 text-sm text-destructive">
                  {channelError}
                </p>
              )}

              <div className="mt-6 space-y-3">
                {channels.map((channel) => {
                  const Icon = channel.icon
                  const status = channelStatuses[channel.id]
                  const styles = getChannelStyles(status)

                  const statusLabel = isChannelLoading
                    ? 'Loading…'
                    : status === 'connected'
                      ? 'Connected'
                      : status === 'disconnected'
                        ? 'Disconnected'
                        : status === 'not_configured'
                          ? 'Not configured'
                          : 'Unavailable'

                  return (
                    <div
                      key={channel.id}
                      className="flex flex-col gap-4 rounded-xl border border-border bg-background/30 p-4 sm:flex-row sm:items-center"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary text-primary">
                        <Icon className="size-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium text-foreground">
                            {channel.name}
                          </p>

                          <span
                            className={`rounded-full border px-2 py-1 text-xs font-medium ${styles}`}
                          >
                            {statusLabel}
                          </span>
                        </div>

                        <p className="mt-1 text-sm leading-5 text-muted-foreground">
                          {channel.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled
                        aria-label={`${channel.name} setup is not available yet`}
                        className="rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {status === 'connected'
                          ? 'Manage coming soon'
                          : 'Setup coming soon'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {activeSection === 'security' && (
            <section>
              <h2 className="text-lg font-semibold text-foreground">
                Security
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                AVIA.AI is built with layered safeguards for account access, workspace data, and permissions.
              </p>

              <div className="mt-6 space-y-3">
                {[
                  {
                    title: 'Authentication',
                    description:
                      "Authentication is handled through AVIA.AI's existing authentication layer.",
                  },
                  {
                    title: 'Workspace isolation',
                    description:
                      "Workspace-scoped access controls help keep each company's data separate.",
                  },
                  {
                    title: 'Role-based permissions',
                    description:
                      'Role-based permissions govern access to protected workspace actions.',
                  },
                  {
                    title: 'Audit logging',
                    description:
                      'Audit logging and production monitoring are part of the security review before launch.',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-3 rounded-xl border border-border bg-background/30 p-4"
                  >
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-400" />

                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {item.title}
                      </p>

                      <p className="mt-1 text-sm leading-5 text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

{activeSection === 'notifications' && (
  <section>
    <h2 className="text-lg font-semibold text-foreground">
      Notifications
    </h2>

    <p className="mt-1 text-sm text-muted-foreground">
      Choose which important AVIA events should notify your team.
    </p>

    <div className="mt-6 space-y-4">
      {[
        {
          key: 'notifications_enabled',
          title: 'Important notifications',
          description:
            'Enable or pause all workspace notifications.',
        },
        {
          key: 'notify_new_leads',
          title: 'New leads',
          description:
            'Receive notifications when new leads arrive.',
        },
        {
          key: 'notify_ai_escalations',
          title: 'AI escalations',
          description:
            'Receive notifications when AI conversations need human attention.',
        },
        {
          key: 'notify_system_alerts',
          title: 'System alerts',
          description:
            'Receive important workspace system alerts.',
        },
      ].map((item) => {
        const enabled =
          notificationPreferences[
            item.key as keyof typeof notificationPreferences
          ]

        return (
          <div
            key={item.key}
            className="flex items-center justify-between gap-5 rounded-xl border border-border bg-background/30 p-4"
          >
            <div>
              <p className="text-sm font-medium text-foreground">
                {item.title}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-label={item.title}
              aria-checked={enabled}
              aria-busy={isNotificationSaving}
              disabled={
                isNotificationLoading ||
                isNotificationSaving ||
                profileRole !== 'Workspace Owner'
              }
              onClick={() =>
                void handleNotificationToggle(
                  item.key as keyof typeof notificationPreferences,
                )
              }
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                enabled ? 'bg-primary' : 'bg-secondary'
              }`}
            >
              <span
                className={`absolute top-1 size-4 rounded-full bg-primary-foreground transition-transform ${
                  enabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
        )
      })}
    </div>

    <p
      className="mt-4 text-sm text-muted-foreground"
      aria-live="polite"
    >
      {isNotificationLoading
        ? 'Loading saved notification preferences…'
        : isNotificationSaving
          ? 'Saving notification preferences…'
          : profileRole !== 'Workspace Owner'
            ? 'Only the workspace owner can change these preferences.'
            : notificationMessage}
    </p>

    {notificationError && (
      <p
        className="mt-3 text-sm text-destructive"
        role="alert"
      >
        {notificationError}
      </p>
    )}
  </section>
)}
        </main>
      </div>

      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
          <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col overflow-y-auto overscroll-contain rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Team member
                </p>

                <h2 className="mt-1 text-lg font-semibold text-foreground">
                  {selectedMember.name}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedMember.email}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseMemberPanel}
                aria-label="Close member details"
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-6">
              <label
                htmlFor="member-role"
                className="text-sm font-medium text-foreground"
              >
                Role
              </label>


  <select
    id="member-role"
    value={selectedMember.role}
    disabled={selectedMember.role === 'Owner'}
    onChange={(event) =>
      handleMemberRoleChange(event.target.value as TeamRole)
    }
    className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60"
  >
    <option value="Owner">Owner</option>
    <option value="Manager">Manager</option>
    <option value="Agent">Agent</option>
  </select>


              {selectedMember.role === 'Owner' && (
                <p className="mt-2 text-xs text-muted-foreground">
                Role changes are not available yet. The displayed role comes
                from your workspace membership.
              </p>
              )}
            </div>

            <div className="mt-6">
              <p className="text-sm font-medium text-foreground">
                Permissions
              </p>

              <div className="mt-3 max-h-[min(36dvh,20rem)] space-y-2 overflow-y-auto overscroll-contain pr-1">
                {(Object.keys(selectedPermissions) as Array<
                  keyof MemberPermissions
                >).map((permission) => (
                  <label
                    key={permission}
                    className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-border bg-background/30 px-4 py-3"
                  >
                    <span className="text-sm text-foreground">
                      {getPermissionLabel(permission)}
                    </span>


<input
  type="checkbox"
  checked={
    isConfigurableTeamPermission(permission)
      ? selectedPermissions[permission]
      : true
  }
  disabled={
    selectedMember.role === 'Owner' ||
    !isConfigurableTeamPermission(permission)
  }
  onChange={() => handlePermissionToggle(permission)}
  className="size-4 accent-primary disabled:cursor-not-allowed"
/>

                  </label>
                ))}
              </div>
            </div>

            <div className="sticky bottom-0 z-10 mt-4 flex shrink-0 flex-col-reverse gap-3 border-t border-border bg-card pt-4 sm:flex-row sm:items-center sm:justify-between">
              {selectedMember.role !== 'Owner' ? (
                <button
                  type="button"
                  onClick={() => setShowRemoveConfirmation(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-destructive/30 px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Trash2 className="size-4" />
                  Remove from workspace
                </button>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Workspace owner
                </span>
              )}
              {teamNotice && (
                <p
                  role="status"
                  aria-live="polite"
                  className="mb-3 text-sm text-muted-foreground"
                >
                  {teamNotice}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseMemberPanel}
                  className="rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Cancel
                </button>

                <button
  type="button"
  onClick={handleSaveMemberPermissions}
  disabled={
    selectedMember.role === 'Owner' || isSavingPermissions
  }
  className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
>
  {isSavingPermissions ? 'Saving…' : 'Save permissions'}
</button>
              </div>
            </div>

            {showRemoveConfirmation && (
              <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                <p className="text-sm font-medium text-foreground">
                  Remove {selectedMember.name} from this workspace?
                </p>

                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  They will lose access to this workspace. Their AVIAAI
                  account will not be deleted.
                </p>

                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRemoveConfirmation(false)}
                    className="rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-medium text-foreground"
                  >
                    Keep member
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveMember}
                    className="rounded-lg bg-destructive px-3 py-2 text-xs font-medium text-destructive-foreground"
                  >
                    Confirm removal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Team invitation
                </p>

                <h2 className="mt-1 text-lg font-semibold text-foreground">
                  Invite a team member
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Give someone access to this workspace with the right
                  permissions.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseInviteModal}
                aria-label="Close invitation"
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="invite-name"
                  className="text-sm font-medium text-foreground"
                >
                  Name
                </label>

                <input
                  id="invite-name"
                  value={inviteName}
                  onChange={(event) =>
                    setInviteName(event.target.value)
                  }
                  placeholder="Team member name"
                  className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </div>

              <div>
                <label
                  htmlFor="invite-email"
                  className="text-sm font-medium text-foreground"
                >
                  Email
                </label>

                <input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(event) =>
                    setInviteEmail(event.target.value)
                  }
                  placeholder="name@company.com"
                  className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </div>

              <div>
                <label
                  htmlFor="invite-role"
                  className="text-sm font-medium text-foreground"
                >
                  Role
                </label>

                <select
                  id="invite-role"
                  value={inviteRole}
                  onChange={(event) =>
                    handleInviteRoleChange(
                      event.target.value as TeamRole
                    )
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                >
                  <option value="Manager">Manager</option>
                  <option value="Agent">Agent</option>
                </select>

                <p className="mt-2 text-xs text-muted-foreground">
                  Workspace ownership cannot be assigned through an
                  invitation.
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground">
                  Permissions
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Adjust the default permissions for this member.
                </p>

                <div className="mt-3 space-y-2">
                  {(Object.keys(invitePermissions) as Array<
                    keyof MemberPermissions
                  >).map((permission) => (
                    <label
                      key={permission}
                      className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-border bg-background/30 px-4 py-3"
                    >
                      <span className="text-sm text-foreground">
                        {getPermissionLabel(permission)}
                      </span>


<input
  type="checkbox"
  checked={
    isConfigurableTeamPermission(permission)
      ? invitePermissions[permission]
      : true
  }
  disabled={
    !isConfigurableTeamPermission(permission) ||
    (
      inviteRole === 'Agent' &&
      (
        permission === 'teamManagement' ||
        permission === 'billing' ||
        permission === 'inviteMembers' ||
        permission === 'removeMembers'
      )
    )
  }
  onChange={() => handleInvitePermissionToggle(permission)}
  className="size-4 accent-primary disabled:cursor-not-allowed"
/>

                    </label>
                  ))}
                </div>
              </div>

              {inviteError && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
                  <p className="text-sm text-destructive">
                    {inviteError}
                  </p>
                </div>
              )}

  {inviteNotice && (
    <div
      className="space-y-3 rounded-xl border border-border bg-background px-4 py-3"
      role="status"
    >
      <p className="text-sm text-foreground">{inviteNotice}</p>

      {invitationLink && (
        <>
          <input
            aria-label="Private invitation link"
            readOnly
            value={invitationLink}
            className="h-10 w-full rounded-lg border border-input bg-card px-3 text-xs text-foreground"
            onFocus={(event) => event.currentTarget.select()}
          />

          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(invitationLink).then(
                () => setInviteNotice('Invitation link copied. Share it privately with the intended recipient.'),
                () => setInviteError('Could not copy automatically. Select the link above and copy it manually.'),
              )
            }}
            className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
          >
            Copy invitation link
          </button>
        </>
      )}
    </div>
  )}


              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseInviteModal}
                  className="rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Cancel
                </button>

                <button
                 type="button"
                 onClick={handleSendInvite}
                 disabled={isSendingInvite}
                 className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                 >
                {isSendingInvite ? 'Creating invitation…' : 'Create invitation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
