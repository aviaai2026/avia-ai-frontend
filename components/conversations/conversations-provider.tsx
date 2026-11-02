
'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  getConversationMessages,
  getConversations,
  sendConversationMessage as sendConversationMessageRequest,
  updateConversationLead as updateConversationLeadRequest,
} from '@/lib/api/conversations-client'
import type {
  Conversation,
  ConversationMessage,
} from '@/lib/types'

type ConversationsContextValue = {
  conversations: Conversation[]
  messages: ConversationMessage[]
  isLoading: boolean
  error: string | null
  loadingMessageIds: string[]
  messageErrors: Record<string, string>
  refreshConversations: () => Promise<void>
  loadConversationMessages: (conversationId: string) => Promise<void>
  updateConversationLead: (
    conversationId: string,
    leadId: string | null,
  ) => Promise<void>
  sendConversationMessage: (
    conversationId: string,
    content: string,
    clientRequestId: string,
  ) => Promise<void>
}

const ConversationsContext =
  createContext<ConversationsContextValue | null>(null)

type ConversationsProviderProps = {
  children: ReactNode
}

// Provides one shared, API-backed conversation state to every AVIA page inside the app shell.
export function ConversationsProvider({
  children,
}: ConversationsProviderProps) {
  const [conversations, setConversations] =
    useState<Conversation[]>([])
  const [messages, setMessages] =
    useState<ConversationMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingMessageIds, setLoadingMessageIds] =
    useState<string[]>([])
  const [messageErrors, setMessageErrors] =
    useState<Record<string, string>>({})

  const isMounted = useRef(false)
  const loadedMessageIds = useRef(new Set<string>())
  const inFlightRequests = useRef(
    new Map<string, Promise<void>>(),
  )

  // Retrieves the current workspace conversations from the authenticated backend.
  const refreshConversations = useCallback(async () => {
    if (isMounted.current) {
      setIsLoading(true)
      setError(null)
    }

    try {
      const result = await getConversations()

      if (isMounted.current) {
        setConversations(result)
      }
    } catch {
      if (isMounted.current) {
        setError('Unable to load conversations. Please try again.')
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false)
      }
    }
  }, [])

  // Loads and caches one conversation's message history for all screens using this provider.
  const loadConversationMessages = useCallback(
    async (conversationId: string) => {
      if (loadedMessageIds.current.has(conversationId)) {
        return
      }

      const existingRequest =
        inFlightRequests.current.get(conversationId)

      if (existingRequest) {
        await existingRequest
        return
      }

      if (isMounted.current) {
        setLoadingMessageIds((current) =>
          current.includes(conversationId)
            ? current
            : [...current, conversationId],
        )
        setMessageErrors((current) => {
          const next = { ...current }
          delete next[conversationId]
          return next
        })
      }

      const request = (async () => {
        try {
          const result =
            await getConversationMessages(conversationId)

          if (!isMounted.current) {
            return
          }

          setMessages((current) => [
            ...current.filter(
              (message) =>
                message.conversationId !== conversationId,
            ),
            ...result,
          ])

          loadedMessageIds.current.add(conversationId)
        } catch {
          if (isMounted.current) {
            setMessageErrors((current) => ({
              ...current,
              [conversationId]:
                'Unable to load messages. Please try again.',
            }))
          }
        } finally {
          inFlightRequests.current.delete(conversationId)

          if (isMounted.current) {
            setLoadingMessageIds((current) =>
              current.filter((id) => id !== conversationId),
            )
          }
        }
      })()

      inFlightRequests.current.set(conversationId, request)
      await request
    },
    [],
  )

  // Updates a conversation's CRM lead association and refreshes shared conversation state.
  const updateConversationLead = useCallback(
    async (conversationId: string, leadId: string | null) => {
      await updateConversationLeadRequest(conversationId, leadId)
      await refreshConversations()
    },
    [refreshConversations],
  )

    // Sends a reply and refreshes the shared conversation and message history.
    const sendConversationMessage = useCallback(
      async (
        conversationId: string,
        content: string,
        clientRequestId: string,
      ) => {
        await sendConversationMessageRequest(
          conversationId,
          content,
          clientRequestId,
        )

        loadedMessageIds.current.delete(conversationId)

        await Promise.all([
          loadConversationMessages(conversationId),
          refreshConversations(),
        ])
      },
      [loadConversationMessages, refreshConversations],
    )

  // Loads conversations when the shared app-shell provider first mounts.
  useEffect(() => {
    isMounted.current = true
    void refreshConversations()

    return () => {
      isMounted.current = false
    }
  }, [refreshConversations])

  const value = useMemo(
    () => ({
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
    }),
    [
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
    ],
  )

  return (
    <ConversationsContext.Provider value={value}>
      {children}
    </ConversationsContext.Provider>
  )
}

// Gives AVIA components access to the shared conversation state.
export function useConversations() {
  const context = useContext(ConversationsContext)

  if (!context) {
    throw new Error(
      'useConversations must be used inside ConversationsProvider',
    )
  }

  return context
}
