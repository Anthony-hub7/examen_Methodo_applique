import { useCallback, useState } from 'react'
import type {
  ChatFilters,
  ChatMessage,
  ChatMessageWithDetails,
  SendChatMessageInput,
} from '../types/index'
import * as chatService from '../services/chatService'

interface UseChatState {
  messages: ChatMessageWithDetails[]
  currentMessage: ChatMessageWithDetails | null
  loading: boolean
  error: string | null
}

export const useChat = () => {
  const [state, setState] = useState<UseChatState>({
    messages: [],
    currentMessage: null,
    loading: false,
    error: null,
  })

  const createChatMessage = useCallback(async (input: SendChatMessageInput, userId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const newMessage = await chatService.createChatMessage(input, userId)
      setState((prev) => ({
        ...prev,
        messages: [newMessage as ChatMessageWithDetails, ...prev.messages],
        loading: false,
      }))
      return newMessage
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur création message chat'
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }, [])

  const fetchGroupChatMessages = useCallback(async (filters: ChatFilters) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const messages = await chatService.getGroupChatMessages(filters)
      setState((prev) => ({
        ...prev,
        messages,
        loading: false,
      }))
      return messages
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erreur récupération messages chat'
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }, [])

  const getChatMessage = useCallback(async (messageId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const message = await chatService.getChatMessage(messageId)
      setState((prev) => ({
        ...prev,
        currentMessage: message,
        loading: false,
      }))
      return message
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erreur récupération message chat'
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }, [])

  const updateChatMessage = useCallback(async (messageId: string, message: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const updated = await chatService.updateChatMessage(messageId, message)
      setState((prev) => ({
        ...prev,
        messages: prev.messages.map((m) => (m.id === messageId ? { ...m, ...updated } : m)),
        currentMessage:
          prev.currentMessage?.id === messageId
            ? { ...prev.currentMessage, ...updated }
            : prev.currentMessage,
        loading: false,
      }))
      return updated
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erreur mise à jour message chat'
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }, [])

  const deleteChatMessage = useCallback(async (messageId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      await chatService.deleteChatMessage(messageId)
      setState((prev) => ({
        ...prev,
        messages: prev.messages.filter((m) => m.id !== messageId),
        currentMessage: prev.currentMessage?.id === messageId ? null : prev.currentMessage,
        loading: false,
      }))
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erreur suppression message chat'
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }, [])

  const appendLocalMessage = useCallback((message: ChatMessage) => {
    setState((prev) => ({
      ...prev,
      messages: [message as ChatMessageWithDetails, ...prev.messages],
    }))
  }, [])

  const clearMessages = useCallback(() => {
    setState((prev) => ({ ...prev, messages: [], currentMessage: null }))
  }, [])

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  return {
    messages: state.messages,
    currentMessage: state.currentMessage,
    loading: state.loading,
    error: state.error,

    createChatMessage,
    fetchGroupChatMessages,
    getChatMessage,
    updateChatMessage,
    deleteChatMessage,
    appendLocalMessage,
    clearMessages,
    clearError,
  }
}
