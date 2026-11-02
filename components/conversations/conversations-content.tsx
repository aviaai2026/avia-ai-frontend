
'use client'

import { MessageCircle, Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Conversation, Lead } from '@/lib/types'
import { useConversations } from '@/components/conversations/conversations-provider'

type ConversationsContentProps = {
  leads: Lead[]
  currentUserId: string
}

// Formats conversation dates for compact dashboard display.
function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date))
}

// Returns a useful customer label without requiring a CRM lead association.
function getCustomerName(conversation: Conversation) {
  return (
    conversation.customer.name ||
    conversation.customer.phone ||
    conversation.customer.email ||
    'Unknown customer'
  )
}

// Creates customer initials for the conversation avatar.
function getCustomerInitials(conversation: Conversation) {
  const name = getCustomerName(conversation)

  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function ConversationsContent({
  leads,
  currentUserId,
}: ConversationsContentProps) {
  const {
    conversations,
    messages,
    isLoading,
    error,
    loadingMessageIds,
    messageErrors,
    refreshConversations,
    loadConversationMessages,
     updateConversationLead,
     sendConversationMessage,
  } = useConversations()

  const [selectedConversationId, setSelectedConversationId] =
    useState<string | null>(null)

  const [isUpdatingLead, setIsUpdatingLead] = useState(false)
  const [associationError, setAssociationError] = useState<string | null>(null)

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedConversationId,
  )
  const [messageDraft, setMessageDraft] = useState('')
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null)
  const selectedLead = leads.find(
    (lead) => lead.id === selectedConversation?.leadId,
  )

  const canReply =
  selectedConversation?.channel === 'website' &&
  selectedConversation.status === 'open' &&
  selectedConversation.handlingMode === 'human' &&
  selectedConversation.assignedUserId === currentUserId
  const selectedMessages = messages.filter(
    (message) =>
      message.conversationId === selectedConversation?.id,
  )

  const isLoadingMessages =
    selectedConversation !== undefined &&
    loadingMessageIds.includes(selectedConversation.id)

  const selectedMessageError = selectedConversation
    ? messageErrors[selectedConversation.id]
    : null

    // Updates the selected conversation's CRM lead association.
    async function handleLeadAssociationChange(leadId: string | null) {
      if (!selectedConversation) return

      setIsUpdatingLead(true)
      setAssociationError(null)

      try {
        await updateConversationLead(selectedConversation.id, leadId)
      } catch (error) {
        setAssociationError(
          error instanceof Error
            ? error.message
            : 'Unable to update the lead association.',
        )
      } finally {
        setIsUpdatingLead(false)
      }
    }

      // Sends a reply while retaining its request ID until the backend confirms success.
  async function handleSendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (
      !selectedConversation ||
      !canReply ||
      !messageDraft.trim() ||
      isSendingMessage
    ) {
      return
    }

    const requestId = pendingRequestId ?? crypto.randomUUID()

    setPendingRequestId(requestId)
    setIsSendingMessage(true)
    setSendError(null)

    try {
      await sendConversationMessage(
        selectedConversation.id,
        messageDraft.trim(),
        requestId,
      )

      setMessageDraft('')
      setPendingRequestId(null)
    } catch (error) {
      setSendError(
        error instanceof Error
          ? error.message
          : 'Unable to send this message. Please try again.',
      )
    } finally {
      setIsSendingMessage(false)
    }
  }

  // Selects the first available conversation after loading and keeps selection valid.
  useEffect(() => {
    if (isLoading) {
      return
    }

    if (conversations.length === 0) {
      setSelectedConversationId(null)
      return
    }

    const selectionStillExists = conversations.some(
      (conversation) => conversation.id === selectedConversationId,
    )

    if (!selectionStillExists) {
      setSelectedConversationId(conversations[0].id)
    }
  }, [conversations, isLoading, selectedConversationId])

  // Loads the selected conversation's shared message history.
  useEffect(() => {
    if (selectedConversation) {
      void loadConversationMessages(selectedConversation.id)
    }
  }, [selectedConversation, loadConversationMessages])

  return (
    <div className="grid h-[620px] max-h-[calc(100vh-180px)] min-h-[420px] overflow-hidden rounded-xl border border-border bg-card xl:grid-cols-[340px_minmax(0,1fr)]">
      {/* Conversation list */}
      <aside className="flex min-h-0 flex-col border-b border-border xl:border-b-0 xl:border-r">
        <div className="border-b border-border px-4 py-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="size-4 text-primary" />

            <h2 className="font-semibold">
              Conversations
            </h2>

            <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
              {conversations.length}
            </span>
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            Customer conversations across connected channels.
          </p>
        </div>

        <div className="min-h-0 flex-1 divide-y divide-border overflow-y-auto">
          {isLoading ? (
            <p className="p-4 text-sm text-muted-foreground">
              Loading conversations...
            </p>
          ) : error ? (
            <div className="space-y-3 p-4">
              <p className="text-sm text-destructive">{error}</p>

              <button
                type="button"
                onClick={() => void refreshConversations()}
                className="rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-secondary"
              >
                Try again
              </button>
            </div>
          ) : conversations.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              No conversations have been received yet.
            </p>
          ) : (
            conversations.map((conversation) => {
              const isSelected =
                conversation.id === selectedConversationId

              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() =>
                    setSelectedConversationId(conversation.id)
                  }
                  className={`w-full px-4 py-4 text-left transition-colors ${
                    isSelected
                      ? 'bg-primary/10'
                      : 'hover:bg-secondary/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
                      {getCustomerInitials(conversation)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">
                          {getCustomerName(conversation)}
                        </p>

                        <span
                          className={`ml-auto size-2 shrink-0 rounded-full ${
                            conversation.status === 'open'
                              ? 'bg-emerald-400'
                              : 'bg-muted-foreground'
                          }`}
                        />
                      </div>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {conversation.channel}
                      </p>

                      <p className="mt-2 truncate text-xs text-muted-foreground">
                        {conversation.lastMessage?.content ??
                          'No messages yet.'}
                      </p>

                      <p className="mt-1 text-[11px] text-muted-foreground/70">
                        {formatDate(conversation.updatedAt)}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </aside>

      {/* Conversation panel */}
      <section className="flex min-h-0 min-w-0 flex-col overflow-hidden">
        {!selectedConversation ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <MessageCircle className="mb-3 size-8 text-muted-foreground/60" />

            <h3 className="font-medium">
              {isLoading
                ? 'Loading conversations'
                : error
                  ? 'Unable to load conversations'
                  : 'No conversations yet'}
            </h3>

            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              {isLoading
                ? 'Your workspace conversations are being retrieved.'
                : error
                  ? 'Try refreshing the conversation list.'
                  : 'Customer conversations will appear here when messages arrive through connected channels.'}
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {getCustomerInitials(selectedConversation)}
              </div>

              <div className="min-w-0">
                <h2 className="truncate font-semibold">
                  {getCustomerName(selectedConversation)}
                </h2>

                <p className="text-xs text-muted-foreground">
                  {selectedConversation.channel}
                  {selectedConversation.customer.phone
                    ? ` • ${selectedConversation.customer.phone}`
                    : selectedConversation.customer.email
                      ? ` • ${selectedConversation.customer.email}`
                      : selectedLead?.location
                        ? ` • ${selectedLead.location}`
                        : ''}
                </p>
              </div>

              <div className="ml-auto">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    selectedConversation.status === 'open'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {selectedConversation.status === 'open'
                    ? 'Open'
                    : 'Closed'}
                </span>
              </div>
            </div>

            {/* Lead context */}
            {selectedLead && (
              <div className="flex flex-wrap gap-2 border-b border-border px-5 py-3">
                <span className="rounded-md bg-secondary px-2.5 py-1 text-xs">
                  {selectedLead.intent}
                </span>

                {selectedLead.propertyType && (
                  <span className="rounded-md bg-secondary px-2.5 py-1 text-xs">
                    {selectedLead.propertyType}
                  </span>
                )}

                {selectedLead.budget && (
                  <span className="rounded-md bg-secondary px-2.5 py-1 text-xs">
                    ₦{selectedLead.budget.toLocaleString('en-NG')}
                  </span>
                )}

                <span className="rounded-md bg-secondary px-2.5 py-1 text-xs">
                  {selectedLead.status}
                </span>
              </div>
            )}
                        {/* CRM lead association */}
                        <div className="space-y-2 border-b border-border px-5 py-3">
              <div className="flex flex-wrap items-center gap-3">
                <label
                  htmlFor="conversation-lead-association"
                  className="text-xs font-medium text-muted-foreground"
                >
                  CRM lead
                </label>

                <select
                  id="conversation-lead-association"
                  value={selectedConversation.leadId ?? ''}
                  disabled={isUpdatingLead}
                  onChange={(event) =>
                    void handleLeadAssociationChange(
                      event.target.value || null,
                    )
                  }
                  className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground disabled:opacity-60"
                >
                  <option value="">Not linked to a lead</option>

                  {leads.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.name} ({lead.status})
                    </option>
                  ))}
                </select>

                {isUpdatingLead && (
                  <span className="text-xs text-muted-foreground">
                    Saving...
                  </span>
                )}
              </div>

              {associationError && (
                <p role="alert" className="text-xs text-destructive">
                  {associationError}
                </p>
              )}
            </div>

            {/* Messages */}
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
              {isLoadingMessages ? (
                <p className="text-sm text-muted-foreground">
                  Loading message history...
                </p>
              ) : selectedMessageError ? (
                <div className="space-y-3">
                  <p className="text-sm text-destructive">
                    {selectedMessageError}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      void loadConversationMessages(
                        selectedConversation.id,
                      )
                    }
                    className="rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-secondary"
                  >
                    Retry loading messages
                  </button>
                </div>
              ) : selectedMessages.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No messages recorded in this conversation yet.
                </p>
              ) : (
                selectedMessages.map((message) => {
                  const isCustomer = message.sender === 'customer'

                  return (
                    <div
                      key={message.id}
                      className={`flex ${
                        isCustomer ? 'justify-start' : 'justify-end'
                      }`}
                    >
                      <div
                        className={`max-w-[78%] rounded-2xl px-4 py-3 ${
                          isCustomer
                            ? 'rounded-bl-md bg-secondary'
                            : 'rounded-br-md bg-primary text-primary-foreground'
                        }`}
                      >
                        <p className="text-sm leading-6">
                          {message.content}
                        </p>

                        <p
                          className={`mt-1 text-[10px] ${
                            isCustomer
                              ? 'text-muted-foreground'
                              : 'text-primary-foreground/70'
                          }`}
                        >
                          {message.sender} • {formatDate(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

                        {/* Reply composer and human-control status */}
                        <div className="border-t border-border px-5 py-4">
              {canReply ? (
                <form onSubmit={handleSendMessage} className="space-y-2">
                  <textarea
                    value={messageDraft}
                    onChange={(event) => setMessageDraft(event.target.value)}
                    placeholder="Write a reply to this customer..."
                    maxLength={5000}
                    rows={3}
                    disabled={isSendingMessage}
                    className="w-full resize-none rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none focus:border-primary disabled:opacity-60"
                  />

                  {sendError && (
                    <p role="alert" className="text-xs text-destructive">
                      {sendError}
                    </p>
                  )}

                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                      Replying as the assigned team member.
                    </p>

                    <button
                      type="submit"
                      disabled={!messageDraft.trim() || isSendingMessage}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Send className="size-4" />
                      {isSendingMessage ? 'Sending...' : 'Send reply'}
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-center text-xs text-muted-foreground">
                  {selectedConversation.status === 'closed'
                    ? 'This conversation is closed.'
                    : selectedConversation.channel !== 'website'
                      ? 'Replies for this channel are not enabled yet.'
                      : selectedConversation.handlingMode === 'human' &&
                          selectedConversation.assignedUserId !== currentUserId
                        ? 'This conversation is assigned to another team member.'
                        : 'Claim the customer escalation in AI Employees → Escalations before replying.'}
                </p>
              )}
            </div>          </>
        )}
      </section>
    </div>
  )
}
