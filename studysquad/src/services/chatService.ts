import { supabase } from './supabaseClient'
import type {
  ChatFilters,
  ChatMessage,
  ChatMessageWithDetails,
  SendChatMessageInput,
} from '../types/index'

// ======================================
// CREATE CHAT MESSAGE
// ======================================
export const createChatMessage = async (
  input: SendChatMessageInput,
  userId: string,
): Promise<ChatMessage> => {
  const { data, error } = await supabase
    .from('chat')
    .insert({
      message: input.message,
      group_id: input.group_id,
      member_id: userId,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Erreur création message chat: ${error.message}`)
  }

  return data
}

// ======================================
// GET GROUP CHAT MESSAGES
// ======================================
export const getGroupChatMessages = async (
  filters: ChatFilters,
): Promise<ChatMessageWithDetails[]> => {
  const limit = filters.limit ?? 50
  const offset = filters.offset ?? 0

  const { data, error } = await supabase
    .from('chat')
    .select(`
      *,
      member:members(*)
    `)
    .eq('group_id', filters.group_id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    throw new Error(`Erreur récupération messages chat: ${error.message}`)
  }

  return data || []
}

// ======================================
// GET SINGLE CHAT MESSAGE
// ======================================
export const getChatMessage = async (
  messageId: string,
): Promise<ChatMessageWithDetails> => {
  const { data, error } = await supabase
    .from('chat')
    .select(`
      *,
      member:members(*)
    `)
    .eq('id', messageId)
    .single()

  if (error) {
    throw new Error(`Message chat non trouvé: ${error.message}`)
  }

  return data
}

// ======================================
// UPDATE CHAT MESSAGE
// ======================================
export const updateChatMessage = async (
  messageId: string,
  message: string,
): Promise<ChatMessage> => {
  const { data, error } = await supabase
    .from('chat')
    .update({ message })
    .eq('id', messageId)
    .select()
    .single()

  if (error) {
    throw new Error(`Erreur mise à jour message chat: ${error.message}`)
  }

  return data
}

// ======================================
// DELETE CHAT MESSAGE
// ======================================
export const deleteChatMessage = async (messageId: string): Promise<void> => {
  const { error } = await supabase
    .from('chat')
    .delete()
    .eq('id', messageId)

  if (error) {
    throw new Error(`Erreur suppression message chat: ${error.message}`)
  }
}
