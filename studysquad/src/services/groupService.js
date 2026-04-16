import seedData from './dataAdmin.json'
import { codeGenerator } from '../utils/codeGenerator'

const GROUPS_KEY = 'studysquad_groups'
const GROUP_MEMBERS_KEY = 'studysquad_group_members'

function readStorage(key, fallback) {
  const raw = localStorage.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function generateInvitationCode() {
  // Generate a random invitation code (6 characters)
  return codeGenerator(6)
}

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `mock_${Math.random().toString(16).slice(2)}_${Date.now()}`
}

function ensureGroups() {
  const existing = readStorage(GROUPS_KEY, null)
  if (existing && Array.isArray(existing) && existing.length > 0) return existing
  
  const seeded = seedData.groups || []
  writeStorage(GROUPS_KEY, seeded)
  return seeded
}

function ensureGroupMembers() {
  const existing = readStorage(GROUP_MEMBERS_KEY, null)
  if (existing && Array.isArray(existing) && existing.length > 0) return existing
  
  const seeded = seedData.group_members || []
  writeStorage(GROUP_MEMBERS_KEY, seeded)
  return seeded
}

export const groupService = {
  // Récupère tous les groupes
  getAllGroups() {
    return ensureGroups()
  },

  // Récupère un groupe par ID
  getGroupById(id) {
    const groups = ensureGroups()
    return groups.find((g) => g.id === id) || null
  },

  // Crée un nouveau groupe
  createGroup({ name, description, created_by }) {
    const groups = ensureGroups()
    const newGroup = {
      id: newId(),
      name,
      description: description || '',
      code_invitation: generateInvitationCode(),
      created_by,
      created_at: new Date().toISOString(),
      status: 'active', // active | archived | disabled
      member_count: 0,
    }
    groups.push(newGroup)
    writeStorage(GROUPS_KEY, groups)

    // Ajouter le créateur comme membre admin du groupe
    try {
      this.addMemberToGroup({
        group_id: newGroup.id,
        member_id: created_by,
        role_devoir: 'admin',
      })
    } catch (e) {
      // Ignore si le membre est déjà dans le groupe (ne devrait pas arriver ici)
    }

    // Récupère le groupe mis à jour avec le bon member_count
    const updatedGroups = ensureGroups()
    const updatedGroup = updatedGroups.find((g) => g.id === newGroup.id)
    return updatedGroup
  },

  // Modifie un groupe
  updateGroup(id, updates) {
    const groups = ensureGroups()
    const index = groups.findIndex((g) => g.id === id)
    if (index === -1) return null

    groups[index] = { ...groups[index], ...updates, id } // Empêche de modifier l'ID
    writeStorage(GROUPS_KEY, groups)
    return groups[index]
  },

  // Supprime un groupe
  deleteGroup(id) {
    const groups = ensureGroups()
    const filtered = groups.filter((g) => g.id !== id)
    writeStorage(GROUPS_KEY, filtered)
    
    // Supprime aussi les membres du groupe
    const members = readStorage(GROUP_MEMBERS_KEY, [])
    const filteredMembers = members.filter((m) => m.group_id !== id)
    writeStorage(GROUP_MEMBERS_KEY, filteredMembers)
    
    return true
  },

  // Archive un groupe
  archiveGroup(id) {
    return this.updateGroup(id, { status: 'archived' })
  },

  // Désactive un groupe
  disableGroup(id) {
    return this.updateGroup(id, { status: 'disabled' })
  },

  // Réactive un groupe
  activateGroup(id) {
    return this.updateGroup(id, { status: 'active' })
  },

  // Renouvelle le code d'invitation
  renewInvitationCode(id) {
    return this.updateGroup(id, { code_invitation: generateInvitationCode() })
  },

  // Récupère les membres d'un groupe
  getGroupMembers(groupId) {
    const members = ensureGroupMembers()
    return members.filter((m) => m.group_id === groupId)
  },

  // Ajoute un membre à un groupe
  addMemberToGroup({ group_id, member_id, role_devoir = 'member' }) {
    const members = ensureGroupMembers()
    
    // Vérifie que le membre n'existe pas déjà
    if (members.some((m) => m.group_id === group_id && m.member_id === member_id)) {
      throw new Error('Ce membre est déjà dans le groupe')
    }

    const newMember = {
      id: newId(),
      member_id,
      group_id,
      role_devoir,
      actif: true,
      joined_at: new Date().toISOString(),
    }
    members.push(newMember)
    writeStorage(GROUP_MEMBERS_KEY, members)

    // Met à jour le compte des membres du groupe
    const groups = ensureGroups()
    const group = groups.find((g) => g.id === group_id)
    if (group) {
      group.member_count = members.filter((m) => m.group_id === group_id).length
      writeStorage(GROUPS_KEY, groups)
    }

    return newMember
  },

  // Retire un membre du groupe
  removeMemberFromGroup(groupId, memberId) {
    const members = ensureGroupMembers()
    const filtered = members.filter((m) => !(m.group_id === groupId && m.member_id === memberId))
    writeStorage(GROUP_MEMBERS_KEY, filtered)

    // Met à jour le compte des membres du groupe
    const groups = ensureGroups()
    const group = groups.find((g) => g.id === groupId)
    if (group) {
      group.member_count = filtered.filter((m) => m.group_id === groupId).length
      writeStorage(GROUPS_KEY, groups)
    }

    return true
  },

  // Désactive/active un membre dans un groupe
  toggleMemberStatus(groupId, memberId, active) {
    const members = ensureGroupMembers()
    const member = members.find((m) => m.group_id === groupId && m.member_id === memberId)
    if (member) {
      member.actif = active
      writeStorage(GROUP_MEMBERS_KEY, members)
    }
    return member
  },

  // Change le rôle d'un membre dans le groupe
  updateMemberRole(groupId, memberId, role_devoir) {
    const members = ensureGroupMembers()
    const member = members.find((m) => m.group_id === groupId && m.member_id === memberId)
    if (member) {
      member.role_devoir = role_devoir
      writeStorage(GROUP_MEMBERS_KEY, members)
    }
    return member
  },
}
