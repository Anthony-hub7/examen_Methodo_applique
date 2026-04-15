import { supabase } from './supabaseClient'
import type {
    Group,
    GroupWithMembers,
    GroupMember,
    CreateGroupInput,
    JoinGroupInput,
    GroupMemberWithDetails,
} from '../types/index'
import { codeGenerator } from '../utils/codeGenerator'

// ======================================
// CREATE GROUP
// ======================================
export const createGroup = async (
  input: CreateGroupInput,
  userId: string,
): Promise<Group> => {
  const code_invitation = codeGenerator(6)

  const { data, error } = await supabase
    .from('groups')
    .insert({
      name: input.name,
      description: input.description || null,
      code_invitation,
      created_by: userId,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Erreur création groupe: ${error.message}`)
  }

  // Auto-join creator to group
  await addMemberToGroup(data.id, userId, 'member')

  return data
}

// ======================================
// GET SINGLE GROUP WITH MEMBERS
// ======================================
export const getGroupWithMembers = async (
  groupId: string,
): Promise<GroupWithMembers> => {
  // Get group info
  const { data: groupData, error: groupError } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single()

  if (groupError) {
    throw new Error(`Groupe non trouvé: ${groupError.message}`)
  }

  // Get members
  const { data: membersData, error: membersError } = await supabase
    .from('groups_member')
    .select(`
      *,
      member:members(*)
    `)
    .eq('group_id', groupId)
    .eq('actif', true)

  if (membersError) {
    throw new Error(`Erreur récupération membres: ${membersError.message}`)
  }

  return {
    ...groupData,
    members: membersData || [],
    memberCount: membersData?.length || 0,
  }
}

// ======================================
// GET ALL GROUPS FOR USER
// ======================================
export const getUserGroups = async (userId: string): Promise<Group[]> => {
  // 1. D'abord récupérer les IDs des groupes
  const { data: memberData, error: memberError } = await supabase
    .from('groups_member')
    .select('group_id')
    .eq('member_id', userId)
    .eq('actif', true)

  if (memberError) {
    throw new Error(`Erreur récupération groupes: ${memberError.message}`)
  }

  if (!memberData || memberData.length === 0) {
    return []
  }

  const groupIds = memberData.map((item) => item.group_id)

  // 2. Puis récupérer les groupes
  const { data: groupsData, error: groupsError } = await supabase
    .from('groups')
    .select('*')
    .in('id', groupIds)

  if (groupsError) {
    throw new Error(`Erreur récupération groupes: ${groupsError.message}`)
  }

  return groupsData || []
}

// ======================================
// JOIN GROUP BY CODE
// ======================================
export const joinGroup = async (
  input: JoinGroupInput,
  userId: string,
): Promise<Group> => {
  // Find group by code
  const { data: groupData, error: groupError } = await supabase
    .from('groups')
    .select('*')
    .eq('code_invitation', input.code_invitation)
    .single()

  if (groupError) {
    throw new Error(`Groupe avec ce code non trouvé`)
  }

  // Check if already member
  const { data: existingMember } = await supabase
    .from('groups_member')
    .select('*')
    .eq('member_id', userId)
    .eq('group_id', groupData.id)
    .single()

  if (existingMember) {
    return groupData
  }

  // Add user to group
  await addMemberToGroup(groupData.id, userId, 'member')

  return groupData
}

// ======================================
// LEAVE GROUP
// ======================================
export const leaveGroup = async (
  groupId: string,
  userId: string,
): Promise<void> => {
  const { error } = await supabase
    .from('groups_member')
    .update({ actif: false })
    .eq('group_id', groupId)
    .eq('member_id', userId)

  if (error) {
    throw new Error(`Erreur quitter groupe: ${error.message}`)
  }
}

// ======================================
// GET GROUP MEMBERS
// ======================================
export const getGroupMembers = async (
  groupId: string,
): Promise<GroupMemberWithDetails[]> => {
  const { data, error } = await supabase
    .from('groups_member')
    .select(`
      *,
      member:members(*)
    `)
    .eq('group_id', groupId)
    .eq('actif', true)
    .order('joined_at', { ascending: false })

  if (error) {
    throw new Error(`Erreur récupération membres: ${error.message}`)
  }

  return data || []
}

// ======================================
// DELETE GROUP (only creator)
// ======================================
export const deleteGroup = async (groupId: string): Promise<void> => {
  const { error } = await supabase.from('groups').delete().eq('id', groupId)

  if (error) {
    throw new Error(`Erreur suppression groupe: ${error.message}`)
  }
}

// ======================================
// UPDATE GROUP
// ======================================
export const updateGroup = async (
  groupId: string,
  updates: Partial<Group>,
): Promise<Group> => {
  const { data, error } = await supabase
    .from('groups')
    .update(updates)
    .eq('id', groupId)
    .select()
    .single()

  if (error) {
    throw new Error(`Erreur mise à jour groupe: ${error.message}`)
  }

  return data
}

// ======================================
// HELPER: ADD MEMBER TO GROUP
// ======================================
const addMemberToGroup = async (
  groupId: string,
  userId: string,
  role: string = 'member',
): Promise<GroupMember> => {
  const { data, error } = await supabase
    .from('groups_member')
    .insert({
      group_id: groupId,
      member_id: userId,
      role_devoir: role,
      actif: true,
    })
    .select()
    .single()

  if (error) {
    throw new Error(
      `Erreur ajout membre au groupe: ${error.message}`,
    )
  }

  return data
}
