
import type {
    Conversation,
    ConversationChannel,
    ConversationMessage,
    ConversationMessageSender,
    ConversationStatus,
  } from '@/lib/types'

  type ConversationApiRecord = {
    id: string
    workspace_id: string
    customer_id: string
    lead_id: string | null
    channel: ConversationChannel
    status: ConversationStatus
    handling_mode: 'ai' | 'human'
    assigned_user_id: string | null
    created_at: string
    updated_at: string
    customer: {
      name: string | null
      phone: string | null
      email: string | null
    }
    last_message: {
      content: string
      sender_type: ConversationMessageSender
      created_at: string
    } | null
  }

  type ConversationMessageApiRecord = {
    id: string
    conversation_id: string
    sender_type: ConversationMessageSender
    direction: 'inbound' | 'outbound'
    message_type: string
    content: string
    delivery_status: string
    created_at: string
  }

  // Converts a backend conversation record into the frontend conversation type.
  function mapConversation(
    record: ConversationApiRecord,
  ): Conversation {
    return {
      id: record.id,
      workspaceId: record.workspace_id,
      customerId: record.customer_id,
      leadId: record.lead_id,
      channel: record.channel,
      status: record.status,
      handlingMode: record.handling_mode,
      assignedUserId: record.assigned_user_id,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
      customer: record.customer,
      lastMessage: record.last_message
        ? {
            content: record.last_message.content,
            senderType: record.last_message.sender_type,
            createdAt: record.last_message.created_at,
          }
        : null,
    }
  }

  // Converts a backend message record into the frontend message type.
  function mapConversationMessage(
    record: ConversationMessageApiRecord,
  ): ConversationMessage {
    return {
      id: record.id,
      conversationId: record.conversation_id,
      sender: record.sender_type,
      direction: record.direction,
      messageType: record.message_type,
      content: record.content,
      deliveryStatus: record.delivery_status,
      createdAt: record.created_at,
    }
  }

  // Retrieves conversations from the authenticated workspace.
  export async function getConversations(
    leadId?: string,
  ): Promise<Conversation[]> {
    const query = leadId
      ? `?lead_id=${encodeURIComponent(leadId)}`
      : ''

    const response = await fetch(`/api/conversations${query}`, {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error('Failed to load conversations.')
    }

    const data = (await response.json()) as {
      conversations: ConversationApiRecord[]
    }

    return data.conversations.map(mapConversation)
  }

  // Retrieves the message history for one conversation.
  export async function getConversationMessages(
    conversationId: string,
  ): Promise<ConversationMessage[]> {
    const response = await fetch(
      `/api/conversations/${encodeURIComponent(conversationId)}/messages`,
      {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
      },
    )

    if (!response.ok) {
      throw new Error('Failed to load conversation messages.')
    }

    const data = (await response.json()) as {
      messages: ConversationMessageApiRecord[]
    }

    return data.messages.map(mapConversationMessage)
  }

type ConversationLeadAssociationResponse = {
  association: {
    conversation_id: string
    lead_id: string | null
    event: 'associated' | 'changed' | 'removed' | 'unchanged'
  }
}

// Sends a reply using a stable request ID for safe retries.
export async function sendConversationMessage(
  conversationId: string,
  content: string,
  clientRequestId: string,
): Promise<void> {
  const response = await fetch(
    `/api/conversations/${encodeURIComponent(conversationId)}/messages`,
    {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        client_request_id: clientRequestId,
      }),
      cache: 'no-store',
    },
  )

  const responseText = await response.text()
  let responseData: unknown

  try {
    responseData = responseText ? JSON.parse(responseText) : null
  } catch {
    responseData = null
  }

  if (!response.ok) {
    const detail =
      typeof responseData === 'object' &&
      responseData !== null &&
      'detail' in responseData &&
      typeof responseData.detail === 'string'
        ? responseData.detail
        : `Failed to send message (${response.status}).`

    throw new Error(detail)
  }
}

// Updates or removes a conversation's CRM lead association.
export async function updateConversationLead(
  conversationId: string,
  leadId: string | null,
): Promise<void> {
  const response = await fetch(
    `/api/conversations/${encodeURIComponent(conversationId)}/lead`,
    {
      method: 'PATCH',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lead_id: leadId }),
      cache: 'no-store',
    },
  )

  if (!response.ok) {
    const responseBody = await response.text()

    let message = 'Failed to update conversation association.'

    try {
      const data = JSON.parse(responseBody) as {
        detail?: string
      }

      if (data.detail) {
        message = data.detail
      }
    } catch {
      // Keep the fallback when the response isn't valid JSON.
    }

    throw new Error(message)
  }

  await response.json() as ConversationLeadAssociationResponse
}
