import { useCallback, useEffect, useMemo, useState } from 'react'
import { chatService } from '../services/chatService'

export function useGroupChat({ groupId, memberId }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const loadMessages = useCallback(() => {
    if (!groupId) {
      setMessages([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    try {
      setMessages(chatService.getMessagesByGroup(groupId))
    } catch {
      setError('Impossible de charger le chat du groupe.')
      setMessages([])
    } finally {
      setLoading(false)
    }
  }, [groupId])

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  const sendMessage = useCallback(
    async (message) => {
      setSending(true)
      setError('')
      try {
        const snapshot = chatService.sendMessage({ groupId, memberId, message })
        const nextMessages = snapshot.messages.filter((item) => String(item.group_id) === String(groupId))
        setMessages(nextMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()))
        return true
      } catch (currentError) {
        setError(currentError?.message || "Impossible d'envoyer le message.")
        return false
      } finally {
        setSending(false)
      }
    },
    [groupId, memberId],
  )

  return useMemo(
    () => ({
      messages,
      loading,
      sending,
      error,
      loadMessages,
      sendMessage,
    }),
    [messages, loading, sending, error, loadMessages, sendMessage],
  )
}
