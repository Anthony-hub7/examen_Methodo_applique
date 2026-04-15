import { useCallback, useState } from 'react'
import type { Notification, NotificationWithDetails } from '../types/index'
import * as notificationService from '../services/notificationService'

interface UseNotificationsState {
  notifications: NotificationWithDetails[]
  currentNotification: NotificationWithDetails | null
  unreadCount: number
  loading: boolean
  error: string | null
}

interface CreateNotificationInput {
  content: string
  user_id: string
}

interface UpdateNotificationInput {
  content?: string
  is_read?: boolean
}

export const useNotifications = () => {
  const [state, setState] = useState<UseNotificationsState>({
    notifications: [],
    currentNotification: null,
    unreadCount: 0,
    loading: false,
    error: null,
  })

  const refreshUnreadCount = useCallback(async (userId: string) => {
    const count = await notificationService.getUnreadNotificationsCount(userId)
    setState((prev) => ({ ...prev, unreadCount: count }))
    return count
  }, [])

  const createNotification = useCallback(async (input: CreateNotificationInput) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const created = await notificationService.createNotification(input)
      setState((prev) => ({
        ...prev,
        notifications: [created as NotificationWithDetails, ...prev.notifications],
        unreadCount: prev.unreadCount + 1,
        loading: false,
      }))
      return created
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur création notification'
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }, [])

  const fetchUserNotifications = useCallback(async (userId: string, limit: number = 50) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const notifications = await notificationService.getUserNotifications(userId, limit)
      const unreadCount = notifications.filter((n) => !n.is_read).length
      setState((prev) => ({
        ...prev,
        notifications,
        unreadCount,
        loading: false,
      }))
      return notifications
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erreur récupération notifications'
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }, [])

  const getNotification = useCallback(async (notificationId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const notification = await notificationService.getNotification(notificationId)
      setState((prev) => ({
        ...prev,
        currentNotification: notification,
        loading: false,
      }))
      return notification
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erreur récupération notification'
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }, [])

  const updateNotification = useCallback(
    async (notificationId: string, input: UpdateNotificationInput) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const updated = await notificationService.updateNotification(notificationId, input)
        setState((prev) => {
          const oldNotification = prev.notifications.find((n) => n.id === notificationId)
          const becameRead = oldNotification && !oldNotification.is_read && updated.is_read
          const becameUnread = oldNotification && oldNotification.is_read && !updated.is_read

          let nextUnread = prev.unreadCount
          if (becameRead) nextUnread = Math.max(0, nextUnread - 1)
          if (becameUnread) nextUnread += 1

          return {
            ...prev,
            notifications: prev.notifications.map((n) =>
              n.id === notificationId ? { ...n, ...updated } : n,
            ),
            currentNotification:
              prev.currentNotification?.id === notificationId
                ? { ...prev.currentNotification, ...updated }
                : prev.currentNotification,
            unreadCount: nextUnread,
            loading: false,
          }
        })
        return updated
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erreur mise à jour notification'
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
        throw error
      }
    },
    [],
  )

  const markNotificationAsRead = useCallback(
    async (notificationId: string) => {
      return updateNotification(notificationId, { is_read: true })
    },
    [updateNotification],
  )

  const markAllNotificationsAsRead = useCallback(async (userId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      await notificationService.markAllNotificationsAsRead(userId)
      setState((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
        loading: false,
      }))
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erreur mise à jour notifications'
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }, [])

  const deleteNotification = useCallback(async (notificationId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      await notificationService.deleteNotification(notificationId)
      setState((prev) => {
        const target = prev.notifications.find((n) => n.id === notificationId)
        const delta = target && !target.is_read ? -1 : 0

        return {
          ...prev,
          notifications: prev.notifications.filter((n) => n.id !== notificationId),
          currentNotification:
            prev.currentNotification?.id === notificationId ? null : prev.currentNotification,
          unreadCount: Math.max(0, prev.unreadCount + delta),
          loading: false,
        }
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erreur suppression notification'
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }, [])

  const appendLocalNotification = useCallback((notification: Notification) => {
    setState((prev) => ({
      ...prev,
      notifications: [notification as NotificationWithDetails, ...prev.notifications],
      unreadCount: notification.is_read ? prev.unreadCount : prev.unreadCount + 1,
    }))
  }, [])

  const clearCurrentNotification = useCallback(() => {
    setState((prev) => ({ ...prev, currentNotification: null }))
  }, [])

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  return {
    notifications: state.notifications,
    currentNotification: state.currentNotification,
    unreadCount: state.unreadCount,
    loading: state.loading,
    error: state.error,

    createNotification,
    fetchUserNotifications,
    getNotification,
    updateNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    refreshUnreadCount,
    appendLocalNotification,
    clearCurrentNotification,
    clearError,
  }
}
