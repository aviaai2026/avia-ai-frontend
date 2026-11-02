
'use client'

import { useConversations } from '@/components/conversations/conversations-provider'
import {
  Archive,
  ArrowRight,
  MessageCircle,
  Pencil,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type {
  Lead,
  LeadActivity,
  PropertyCurrency,
} from '@/lib/types'

type LeadDetailsDialogProps = {
  lead: Lead | null
  leads: Lead[]
  activities: LeadActivity[]
  onClose: () => void
  onEditLead: (lead: Lead) => void
  onArchiveLead: (leadId: string) => void
}

export function LeadDetailsDialog({
  lead,
  leads,
  activities,
  onClose,
  onEditLead,
  onArchiveLead,
}: LeadDetailsDialogProps) {
  const {
    conversations,
    messages,
    loadingMessageIds,
    messageErrors,
    loadConversationMessages,
    updateConversationLead,
  } = useConversations()

  const [isConfirmingArchive, setIsConfirmingArchive] =
    useState(false)

    const [selectedUnlinkedConversationId, setSelectedUnlinkedConversationId] =
    useState('')

  const [updatingConversationId, setUpdatingConversationId] =
    useState<string | null>(null)

  const [associationError, setAssociationError] =
    useState<string | null>(null)

  const unlinkedConversations = useMemo(
    () => conversations.filter((conversation) => conversation.leadId === null),
    [conversations],
  )

  const leadConversations = useMemo(
    () =>
      conversations.filter(
        (conversation) => conversation.leadId === lead?.id,
      ),
    [conversations, lead?.id],
  )

  // Loads message histories for conversations explicitly associated with this lead.
  useEffect(() => {
    if (!lead) {
      return
    }

    for (const conversation of leadConversations) {
      void loadConversationMessages(conversation.id)
    }
  }, [lead, leadConversations, loadConversationMessages])

    // Associates, changes, or removes a conversation's CRM lead link.
    async function handleConversationAssociation(
      conversationId: string,
      leadId: string | null,
    ) {
      setUpdatingConversationId(conversationId)
      setAssociationError(null)

      try {
        await updateConversationLead(conversationId, leadId)

        if (leadId === null || leadId !== lead?.id) {
          setSelectedUnlinkedConversationId('')
        }
      } catch (error) {
        setAssociationError(
          error instanceof Error
            ? error.message
            : 'Unable to update the conversation association.',
        )
      } finally {
        setUpdatingConversationId(null)
      }
    }
  if (!lead) {
    return null
  }

  // Formats a lead budget using its recorded currency without guessing unknown currencies.
  function formatBudget(
    budget?: number,
    currency?: PropertyCurrency | null,
  ) {
    if (budget === undefined || budget === null) {
      return 'Not provided'
    }

    if (!currency) {
      return new Intl.NumberFormat('en').format(budget)
    }

    const locale =
      currency === 'NGN'
        ? 'en-NG'
        : currency === 'AED'
          ? 'en-AE'
          : 'en-US'

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(budget)
  }

  // Formats activity and conversation timestamps for the dashboard.
  function formatDate(date: string) {
    return new Date(date).toLocaleString('en-NG', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  // Converts internal lead status values into readable dashboard labels.
  function formatStatus(status: string) {
    return status.replace(/_/g, ' ')
  }

  // Opens the edit dialog for the currently selected lead.
function handleEdit() {
  if (!lead) return

  onEditLead(lead)
}

// Archives the currently selected lead after confirmation.
function handleArchive() {
  if (!lead) return

  onArchiveLead(lead.id)
  setIsConfirmingArchive(false)
}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {lead.name}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Lead details and conversation history
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close lead details"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid gap-6 p-6 lg:grid-cols-2">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Lead information
                </h3>

                <button
                  type="button"
                  onClick={handleEdit}
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <Pencil className="size-4" />
                  Edit
                </button>
              </div>

              <div className="rounded-xl border border-border bg-background/40 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Phone
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {lead.phone}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Email
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {lead.email || 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Intent
                    </p>
                    <p className="mt-1 text-sm capitalize text-foreground">
                      {lead.intent}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Status
                    </p>
                    <p className="mt-1 text-sm capitalize text-foreground">
                      {lead.status}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Property type
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {lead.propertyType || 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Location
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {lead.location || 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Budget
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {formatBudget(
                        lead.budget,
                        lead.budgetCurrency,
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Timeline
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {lead.timeline || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Activity history
                </h3>

                <div className="space-y-3">
                  {activities.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                      No activity recorded yet.
                    </div>
                  ) : (
                    activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="rounded-xl border border-border bg-background/40 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {activity.description}
                            </p>

                            {activity.type === 'status_changed' &&
                              activity.fromStatus &&
                              activity.toStatus && (
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                  <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium capitalize text-muted-foreground">
                                    {formatStatus(
                                      activity.fromStatus,
                                    )}
                                  </span>

                                  <ArrowRight className="size-3.5 text-muted-foreground" />

                                  <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium capitalize text-primary">
                                    {formatStatus(
                                      activity.toStatus,
                                    )}
                                  </span>
                                </div>
                              )}

                            {activity.reason && (
                              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                {activity.reason}
                              </p>
                            )}

                            <p className="mt-2 text-xs capitalize text-muted-foreground">
                              {activity.actor}
                            </p>
                          </div>

                          <p className="shrink-0 text-xs text-muted-foreground">
                            {formatDate(activity.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center gap-2">
                <MessageCircle className="size-5 text-primary" />

                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Conversations
                </h3>
              </div>

                            {/* Attach an existing unlinked workspace conversation to this lead. */}
                            <div className="mb-4 rounded-xl border border-border bg-background/40 p-4">
                <label
                  htmlFor="unlinked-conversation"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  Link an existing conversation
                </label>

                {unlinkedConversations.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    There are no unlinked conversations available.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <select
                      id="unlinked-conversation"
                      value={selectedUnlinkedConversationId}
                      onChange={(event) =>
                        setSelectedUnlinkedConversationId(event.target.value)
                      }
                      disabled={updatingConversationId !== null}
                      className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Choose a conversation</option>

                      {unlinkedConversations.map((conversation) => (
                        <option
                          key={conversation.id}
                          value={conversation.id}
                        >
                          {conversation.customer.name ||
                            conversation.customer.phone ||
                            conversation.customer.email ||
                            'Unknown customer'}{' '}
                          — {conversation.channel}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      disabled={
                        !selectedUnlinkedConversationId ||
                        updatingConversationId !== null
                      }
                      onClick={() =>
                        void handleConversationAssociation(
                          selectedUnlinkedConversationId,
                          lead.id,
                        )
                      }
                      className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updatingConversationId ===
                      selectedUnlinkedConversationId
                        ? 'Linking...'
                        : 'Link conversation'}
                    </button>
                  </div>
                )}

                {associationError && (
                  <p role="alert" className="mt-2 text-xs text-destructive">
                    {associationError}
                  </p>
                )}
              </div>

              {leadConversations.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                  No conversations found for this lead.
                </div>
              ) : (
                <div className="space-y-4">
                  {leadConversations.map((conversation) => {
                    const conversationMessages =
                      messages.filter(
                        (message) =>
                          message.conversationId === conversation.id,
                      )

                    const isLoadingMessages =
                      loadingMessageIds.includes(conversation.id)

                    const messageError =
                      messageErrors[conversation.id]

                    return (
                      <div
                        key={conversation.id}
                        className="rounded-xl border border-border bg-background/40"
                      >
                                               <div className="space-y-3 border-b border-border p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium capitalize text-foreground">
                                  {conversation.channel}
                                </span>

                                <span
                                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                                    conversation.status === 'closed'
                                      ? 'bg-muted text-muted-foreground'
                                      : 'bg-emerald-500/10 text-emerald-400'
                                  }`}
                                >
                                  {conversation.status === 'closed'
                                    ? 'Closed'
                                    : 'Open'}
                                </span>
                              </div>

                              <p className="mt-1 text-xs text-muted-foreground">
                                Updated {formatDate(conversation.updatedAt)}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <label
                              htmlFor={`lead-association-${conversation.id}`}
                              className="text-xs text-muted-foreground"
                            >
                              CRM lead
                            </label>

                            <select
                              id={`lead-association-${conversation.id}`}
                              value={conversation.leadId ?? ''}
                              disabled={updatingConversationId !== null}
                              onChange={(event) =>
                                void handleConversationAssociation(
                                  conversation.id,
                                  event.target.value || null,
                                )
                              }
                              className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs"
                            >
                              <option value="">Not linked</option>

                              {leads.map((availableLead) => (
                                <option
                                  key={availableLead.id}
                                  value={availableLead.id}
                                >
                                  {availableLead.name} ({availableLead.status})
                                </option>
                              ))}
                            </select>

                            {updatingConversationId === conversation.id && (
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

                        <div className="space-y-4 bg-background/20 p-4">
                          {isLoadingMessages ? (
                            <p className="text-sm text-muted-foreground">
                              Loading message history...
                            </p>
                          ) : messageError ? (
                            <div className="space-y-3">
                              <p className="text-sm text-destructive">
                                {messageError}
                              </p>

                              <button
                                type="button"
                                onClick={() =>
                                  void loadConversationMessages(
                                    conversation.id,
                                  )
                                }
                                className="rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-muted"
                              >
                                Retry loading messages
                              </button>
                            </div>
                          ) : conversationMessages.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              No messages recorded in this conversation yet.
                            </p>
                          ) : (
                            conversationMessages.map((message) => (
                              <div
                                key={message.id}
                                className={`max-w-[78%] rounded-2xl px-4 py-3 ${
                                  message.sender === 'customer'
                                    ? 'rounded-bl-md bg-secondary'
                                    : 'ml-auto rounded-br-md bg-primary text-primary-foreground'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <p
                                    className={`text-xs font-medium ${
                                      message.sender === 'customer'
                                        ? 'text-foreground'
                                        : 'text-primary-foreground'
                                    }`}
                                  >
                                    {message.sender === 'customer'
                                      ? conversation.customer.name || lead.name
                                      : message.sender === 'ai'
                                        ? 'AVIA AI'
                                        : message.sender === 'user'
                                          ? 'Team member'
                                          : 'System'}
                                  </p>

                                  <p
                                    className={`text-[11px] ${
                                      message.sender === 'customer'
                                        ? 'text-muted-foreground'
                                        : 'text-primary-foreground/70'
                                    }`}
                                  >
                                    {formatDate(message.createdAt)}
                                  </p>
                                </div>

                                <p
                                  className={`mt-2 text-sm leading-6 ${
                                    message.sender === 'customer'
                                      ? 'text-foreground'
                                      : 'text-primary-foreground'
                                  }`}
                                >
                                  {message.content}
                                </p>
                              </div>
                            ))
                          )}
                        </div>

                        <div className="border-t border-border px-4 py-3 text-center text-xs text-muted-foreground">
                          Read-only conversation history.
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-4">
          <div>
            {isConfirmingArchive ? (
              <div className="flex items-center gap-2">
                <p className="mr-2 text-sm text-muted-foreground">
                  Archive this lead?
                </p>

                <button
                  type="button"
                  onClick={handleArchive}
                  className="rounded-lg bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
                >
                  Confirm archive
                </button>

                <button
                  type="button"
                  onClick={() => setIsConfirmingArchive(false)}
                  className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsConfirmingArchive(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <Archive className="size-4" />
                Archive lead
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
