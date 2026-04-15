import { supabase } from './supabaseClient'
import type { Notification, NotificationWithDetails } from '../types/index'

interface CreateNotificationInput {
  content: string
  user_id: string
}

interface UpdateNotificationInput {
  content?: string
  is_read?: boolean
}

// ======================================
// CREATE NOTIFICATION
// ======================================
export const createNotification = async (
  input: CreateNotificationInput,
): Promise<Notification> => {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      content: input.content,
      user_id: input.user_id,
      is_read: false,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Erreur création notification: ${error.message}`)
  }

  return data
}

// ======================================
// GET USER NOTIFICATIONS
// ======================================
export const getUserNotifications = async (
  userId: string,
  limit: number = 50,
): Promise<NotificationWithDetails[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      member:members(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Erreur récupération notifications: ${error.message}`)
  }

  return data || []
}

// ======================================
// GET SINGLE NOTIFICATION
// ======================================
export const getNotification = async (
  notificationId: string,
): Promise<NotificationWithDetails> => {
  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      member:members(*)
    `)
    .eq('id', notificationId)
    .single()

  if (error) {
    throw new Error(`Notification non trouvée: ${error.message}`)
  }

  return data
}

// ======================================
// UPDATE NOTIFICATION
// ======================================
export const updateNotification = async (
  notificationId: string,
  input: UpdateNotificationInput,
): Promise<Notification> => {
  const { data, error } = await supabase
    .from('notifications')
    .update(input)
    .eq('id', notificationId)
    .select()
    .single()

  if (error) {
    throw new Error(`Erreur mise à jour notification: ${error.message}`)
  }

  return data
}

// ======================================
// MARK AS READ
// ======================================
export const markNotificationAsRead = async (
  notificationId: string,
): Promise<Notification> => {
  return updateNotification(notificationId, { is_read: true })
}

// ======================================
// MARK ALL AS READ
// ======================================
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) {
    throw new Error(`Erreur mise à jour notifications: ${error.message}`)
  }
}

// ======================================
// GET UNREAD COUNT
// ======================================
export const getUnreadNotificationsCount = async (userId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) {
    throw new Error(`Erreur récupération nombre notifications non lues: ${error.message}`)
  }

  return count || 0
}

// ======================================
// DELETE NOTIFICATION
// ======================================
export const deleteNotification = async (notificationId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)

  if (error) {
    throw new Error(`Erreur suppression notification: ${error.message}`)
  }
}
