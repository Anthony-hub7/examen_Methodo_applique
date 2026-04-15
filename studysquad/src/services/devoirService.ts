import { supabase } from './supabaseClient'
import type {
    Devoir,
    DevoirWithDetails,
    CreateDevoirInput,
    UpdateDevoirInput,
} from '../types/index'

// ======================================
// CREATE DEVOIR
// ======================================
export const createDevoir = async (
  input: CreateDevoirInput,
  userId: string,
): Promise<Devoir> => {
  const { data, error } = await supabase
    .from('devoirs')
    .insert({
      titre: input.titre,
      sujet: input.sujet || null,
      deadline: input.deadline || null,
      priorite: input.priorite,
      group_id: input.group_id || null,
      member_id: userId,
      etat: 'à faire',
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Erreur création devoir: ${error.message}`)
  }

  return data
}

// ======================================
// GET SINGLE DEVOIR WITH DETAILS
// ======================================
export const getDevoir = async (devoirId: string): Promise<DevoirWithDetails> => {
  const { data, error } = await supabase
    .from('devoirs')
    .select(`
      *,
      member:members(*),
      group:groups(*)
    `)
    .eq('id', devoirId)
    .single()

  if (error) {
    throw new Error(`Devoir non trouvé: ${error.message}`)
  }

  // Calculate if late and completed
  const now = new Date()
  const deadline = data.deadline ? new Date(data.deadline) : null
  const isLate = deadline && deadline < now && data.etat !== 'terminé'
  const isCompleted = data.etat === 'terminé'

  return {
    ...data,
    isLate,
    isCompleted,
  }
}

// ======================================
// GET DEVOIRS BY USER (SOLO MODE)
// ======================================
export const getUserDevoirs = async (userId: string): Promise<Devoir[]> => {
  const { data, error } = await supabase
    .from('devoirs')
    .select('*')
    .eq('member_id', userId)
    .is('group_id', null)
    .order('deadline', { ascending: true, nullsFirst: false })
    .order('priorite', {
      ascending: false,
      nullsFirst: false,
    })

  if (error) {
    throw new Error(`Erreur récupération devoirs: ${error.message}`)
  }

  return data || []
}

// ======================================
// GET DEVOIRS BY GROUP
// ======================================
export const getGroupDevoirs = async (groupId: string): Promise<DevoirWithDetails[]> => {
  const { data, error } = await supabase
    .from('devoirs')
    .select(`
      *,
      member:members(*),
      group:groups(*)
    `)
    .eq('group_id', groupId)
    .order('deadline', { ascending: true, nullsFirst: false })
    .order('priorite', { ascending: false, nullsFirst: false })

  if (error) {
    throw new Error(`Erreur récupération devoirs groupe: ${error.message}`)
  }

  return (data || []).map((devoir) => {
    const now = new Date()
    const deadline = devoir.deadline ? new Date(devoir.deadline) : null
    const isLate = deadline && deadline < now && devoir.etat !== 'terminé'
    const isCompleted = devoir.etat === 'terminé'

    return {
      ...devoir,
      isLate,
      isCompleted,
    }
  })
}

// ======================================
// UPDATE DEVOIR
// ======================================
export const updateDevoir = async (
  devoirId: string,
  input: UpdateDevoirInput,
): Promise<Devoir> => {
  const { data, error } = await supabase
    .from('devoirs')
    .update(input)
    .eq('id', devoirId)
    .select()
    .single()

  if (error) {
    throw new Error(`Erreur mise à jour devoir: ${error.message}`)
  }

  return data
}

// ======================================
// DELETE DEVOIR
// ======================================
export const deleteDevoir = async (devoirId: string): Promise<void> => {
  const { error } = await supabase
    .from('devoirs')
    .delete()
    .eq('id', devoirId)

  if (error) {
    throw new Error(`Erreur suppression devoir: ${error.message}`)
  }
}

// ======================================
// MARK DEVOIR AS COMPLETE
// ======================================
export const markDevoirComplete = async (devoirId: string): Promise<Devoir> => {
  return updateDevoir(devoirId, { etat: 'terminé' })
}

// ======================================
// MARK DEVOIR AS IN PROGRESS
// ======================================
export const markDevoirInProgress = async (devoirId: string): Promise<Devoir> => {
  return updateDevoir(devoirId, { etat: 'en cours' })
}
