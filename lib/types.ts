export type Workspace = {
  id: string
  name: string
  defaultCurrency: 'USD' | 'NGN' | 'AED'
  businessType: string | null
  operatingLocation: string | null
}


export type WorkspaceRole = 'owner' | 'manager' | 'agent'

export type CurrentUser = {
  id: string
  name: string
  email: string
  role: string
  workspaceRole: WorkspaceRole
  avatarUrl?: string
}


export type ShellContext = {
  workspace: Workspace
  user: CurrentUser
}
// The stage a lead is currently in within the sales process.
export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'viewing'
  | 'negotiating'
  | 'won'
  | 'lost'
  | 'archived'
// The main reason or goal that brought the lead to the real-estate business.
export type LeadIntent =
  | 'buy'
  | 'rent'
  | 'sell'
  | 'invest'

// Where the lead originally came from.
export type LeadSource = string
  | 'whatsapp'
  | 'instagram'
  | 'website'
  | 'referral'
  | 'manual'
  | 'other'

  export type Lead = {
    id: string
    workspaceId: string

    name: string
    phone: string
    email?: string

    source: LeadSource
    status: LeadStatus
    intent: LeadIntent

    propertyType?: string
    location?: string
    budget?: number
    budgetCurrency?: PropertyCurrency | null
    timeline?: string
    archivedAt?: string
    createdAt: string
    updatedAt: string
  }

     export type LeadActivityType =
  | 'created'
  | 'updated'
  | 'status_changed'
  | 'archived'
  | 'restored'

  export type LeadActivity = {
    id: string
    leadId: string
    type: LeadActivityType
    description: string
    createdAt: string
    actor: 'user' | 'ai' | 'system'
    fromStatus?: LeadStatus
    toStatus?: LeadStatus
    reason?: string
  }

  export type ConversationChannel =
  | 'whatsapp'
  | 'instagram'
  | 'website'
  | 'sms'
  | 'email'
  | 'other'

export type ConversationStatus = 'open' | 'closed'

export type ConversationMessageSender =
  | 'customer'
  | 'ai'
  | 'user'
  | 'system'

export type ConversationCustomer = {
  name: string | null
  phone: string | null
  email: string | null
}

export type ConversationLastMessage = {
  content: string
  senderType: ConversationMessageSender
  createdAt: string
}

export type Conversation = {
  id: string
  workspaceId: string
  customerId: string
  leadId: string | null
  channel: ConversationChannel
  status: ConversationStatus
  handlingMode: 'ai' | 'human'
  assignedUserId: string | null
  createdAt: string
  updatedAt: string
  customer: ConversationCustomer
  lastMessage: ConversationLastMessage | null
}

export type ConversationMessage = {
  id: string
  conversationId: string
  sender: ConversationMessageSender
  direction: 'inbound' | 'outbound'
  messageType: string
  content: string
  deliveryStatus: string
  createdAt: string
}


export type PropertyStatus =
  | 'available'
  | 'reserved'
  | 'sold'
  | 'rented'
  | 'unavailable'

export type PropertyIntent = 'sale' | 'rent' | 'lease'
export type PropertyCurrency = 'USD' | 'NGN' | 'AED'
export type Property = {
  id: string
  workspaceId: string
  title: string
  propertyType: string
  intent: PropertyIntent
  status: PropertyStatus
  location: string
  bedrooms?: number
  bathrooms?: number
  price: number
  currency: PropertyCurrency | null
  description?: string
  createdAt: string
  updatedAt: string
}
