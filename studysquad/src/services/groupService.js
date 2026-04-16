import seedData from './dataAdmin.json'
import { codeGenerator } from '../utils/codeGenerator'

const GROUPS_KEY = 'studysquad_groups'
const GROUP_MEMBERS_KEY = 'studysquad_group_members'
const USERS_KEY = 'studysquad_users'

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

function normalizeId(value) {
  return String(value ?? '')
}

function nowIso() {
  return new Date().toISOString()
}

function generateInvitationCode() {
  return codeGenerator(6)
}

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `mock_${Math.random().toString(16).slice(2)}_${Date.now()}`
}

function normalizeGroup(raw) {
  if (!raw || typeof raw !== 'object') return null

  const createdAt = raw.created_at ? new Date(raw.created_at) : null
  const status = ['active', 'disabled', 'archived'].includes(raw.status) ? raw.status : 'active'

  return {
    id: normalizeId(raw.id || newId()),
    name: String(raw.name || '').trim() || 'Groupe sans nom',
    description: String(raw.description || '').trim(),
    code_invitation: String(raw.code_invitation || generateInvitationCode()),
    created_by: normalizeId(raw.created_by || ''),
    created_at: createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt.toISOString() : nowIso(),
    status,
    member_count: Number(raw.member_count || 0),
  }
}

function normalizeGroupMember(raw) {
  if (!raw || typeof raw !== 'object') return null
  if (raw.group_id == null || raw.member_id == null) return null

  const joinedAt = raw.joined_at ? new Date(raw.joined_at) : null

  return {
    id: normalizeId(raw.id || newId()),
    member_id: normalizeId(raw.member_id),
    group_id: normalizeId(raw.group_id),
    role_devoir: String(raw.role_devoir || 'member'),
    actif: raw.actif !== false,
    joined_at: joinedAt && !Number.isNaN(joinedAt.getTime()) ? joinedAt.toISOString() : nowIso(),
  }
}

function normalizeDirectoryMember(raw) {
  if (!raw || typeof raw !== 'object') return null

  const createdAt = raw.created_at ? new Date(raw.created_at) : null
  const role = raw.role === 'admin' ? 'admin' : 'student'

  return {
    id: normalizeId(raw.id),
    name: String(raw.name || '').trim() || 'Utilisateur',
    email: String(raw.email || '').trim().toLowerCase(),
    role,
    niveau_etude: String(raw.niveau_etude || raw.level || 'N/A'),
    created_at: createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt.toISOString() : nowIso(),
  }
}

function syncMemberCount(groups, members) {
  const countByGroup = new Map()

  members.forEach((member) => {
    const key = normalizeId(member.group_id)
    countByGroup.set(key, Number(countByGroup.get(key) || 0) + 1)
  })

  return groups.map((group) => ({
    ...group,
    member_count: Number(countByGroup.get(normalizeId(group.id)) || 0),
  }))
}

function getSeedGroups() {
  const rootGroups = Array.isArray(seedData.groups) ? seedData.groups : []
  const adminGroups = Array.isArray(seedData?.adminDevoirs?.groups) ? seedData.adminDevoirs.groups : []
  const source = rootGroups.length > 0 ? rootGroups : adminGroups

  return source.map((group) => normalizeGroup(group)).filter(Boolean)
}

function getSeedGroupMembers(groups = []) {
  const rootMembers = Array.isArray(seedData.group_members) ? seedData.group_members : []
  if (rootMembers.length > 0) {
    return rootMembers.map((member) => normalizeGroupMember(member)).filter(Boolean)
  }

  const result = []
  const seen = new Set()

  groups.forEach((group) => {
    if (!group.created_by) return
    const key = `${normalizeId(group.id)}::${normalizeId(group.created_by)}`
    if (seen.has(key)) return
    seen.add(key)
    result.push(
      normalizeGroupMember({
        group_id: group.id,
        member_id: group.created_by,
        role_devoir: 'admin',
      }),
    )
  })

  const seededDevoirs = Array.isArray(seedData?.adminDevoirs?.devoirs) ? seedData.adminDevoirs.devoirs : []
  seededDevoirs.forEach((devoir) => {
    if (!devoir?.group_id || !devoir?.member_id) return
    const key = `${normalizeId(devoir.group_id)}::${normalizeId(devoir.member_id)}`
    if (seen.has(key)) return
    seen.add(key)
    result.push(
      normalizeGroupMember({
        group_id: devoir.group_id,
        member_id: devoir.member_id,
        role_devoir: 'member',
      }),
    )
  })

  return result.filter(Boolean)
}

function seedStorageIfNeeded() {
  const existingGroups = readStorage(GROUPS_KEY, null)
  const existingMembers = readStorage(GROUP_MEMBERS_KEY, null)

  const hasGroupsKey = Array.isArray(existingGroups)
  const hasMembersKey = Array.isArray(existingMembers)

  if (hasGroupsKey && hasMembersKey) return

  const nextGroups = hasGroupsKey ? existingGroups.map((group) => normalizeGroup(group)).filter(Boolean) : getSeedGroups()

  const nextMembers = hasMembersKey
    ? existingMembers.map((member) => normalizeGroupMember(member)).filter(Boolean)
    : getSeedGroupMembers(nextGroups)

  const syncedGroups = syncMemberCount(nextGroups, nextMembers)

  writeStorage(GROUPS_KEY, syncedGroups)
  writeStorage(GROUP_MEMBERS_KEY, nextMembers)
}

function ensureGroups() {
  seedStorageIfNeeded()

  const groups = readStorage(GROUPS_KEY, [])
    .map((group) => normalizeGroup(group))
    .filter(Boolean)

  const members = readStorage(GROUP_MEMBERS_KEY, [])
    .map((member) => normalizeGroupMember(member))
    .filter(Boolean)

  const synced = syncMemberCount(groups, members)
  writeStorage(GROUPS_KEY, synced)
  writeStorage(GROUP_MEMBERS_KEY, members)

  return synced
}

function ensureGroupMembers() {
  seedStorageIfNeeded()

  const members = readStorage(GROUP_MEMBERS_KEY, [])
    .map((member) => normalizeGroupMember(member))
    .filter(Boolean)

  writeStorage(GROUP_MEMBERS_KEY, members)
  return members
}

function updateGroupMemberCount(groupId) {
  const groups = ensureGroups()
  const members = ensureGroupMembers()
  const normalizedGroupId = normalizeId(groupId)
  const total = members.filter((member) => normalizeId(member.group_id) === normalizedGroupId).length

  const nextGroups = groups.map((group) =>
    normalizeId(group.id) === normalizedGroupId ? { ...group, member_count: total } : group,
  )

  writeStorage(GROUPS_KEY, nextGroups)
}

export const groupService = {
  getAllGroups() {
    return ensureGroups()
  },

  getGroupById(id) {
    const normalizedId = normalizeId(id)
    return ensureGroups().find((group) => normalizeId(group.id) === normalizedId) || null
  },

  getMemberDirectory() {
    const fromSeed = Array.isArray(seedData?.adminDevoirs?.members) ? seedData.adminDevoirs.members : []
    const fromUsers = readStorage(USERS_KEY, [])

    const merged = [...fromSeed, ...fromUsers]
      .map((member) => normalizeDirectoryMember(member))
      .filter(Boolean)

    const uniqueById = new Map()
    merged.forEach((member) => {
      uniqueById.set(normalizeId(member.id), member)
    })

    return Array.from(uniqueById.values())
  },

  createGroup({ name, description, created_by }) {
    const groups = ensureGroups()

    const cleanName = String(name || '').trim()
    if (!cleanName) throw new Error('Le nom du groupe est requis')

    const newGroup = {
      id: normalizeId(newId()),
      name: cleanName,
      description: String(description || '').trim(),
      code_invitation: generateInvitationCode(),
      created_by: normalizeId(created_by),
      created_at: nowIso(),
      status: 'active',
      member_count: 0,
    }

    const nextGroups = [...groups, newGroup]
    writeStorage(GROUPS_KEY, nextGroups)

    if (newGroup.created_by) {
      this.addMemberToGroup({
        group_id: newGroup.id,
        member_id: newGroup.created_by,
        role_devoir: 'admin',
      })
    }

    const updatedGroup = this.getGroupById(newGroup.id)
    return updatedGroup || newGroup
  },

  updateGroup(id, updates = {}) {
    const groups = ensureGroups()
    const normalizedId = normalizeId(id)
    const index = groups.findIndex((group) => normalizeId(group.id) === normalizedId)
    if (index === -1) return null

    const nextGroup = normalizeGroup({ ...groups[index], ...updates, id: normalizedId })
    groups[index] = nextGroup
    writeStorage(GROUPS_KEY, groups)

    return nextGroup
  },

  deleteGroup(id) {
    const normalizedId = normalizeId(id)

    const groups = ensureGroups().filter((group) => normalizeId(group.id) !== normalizedId)
    writeStorage(GROUPS_KEY, groups)

    const members = ensureGroupMembers().filter((member) => normalizeId(member.group_id) !== normalizedId)
    writeStorage(GROUP_MEMBERS_KEY, members)

    return true
  },

  archiveGroup(id) {
    return this.updateGroup(id, { status: 'archived' })
  },

  disableGroup(id) {
    return this.updateGroup(id, { status: 'disabled' })
  },

  activateGroup(id) {
    return this.updateGroup(id, { status: 'active' })
  },

  renewInvitationCode(id) {
    return this.updateGroup(id, { code_invitation: generateInvitationCode() })
  },

  getGroupMembers(groupId) {
    const normalizedGroupId = normalizeId(groupId)
    return ensureGroupMembers().filter((member) => normalizeId(member.group_id) === normalizedGroupId)
  },

  addMemberToGroup({ group_id, member_id, role_devoir = 'member' }) {
    const normalizedGroupId = normalizeId(group_id)
    const normalizedMemberId = normalizeId(member_id)
    const groups = ensureGroups()

    if (!groups.some((group) => normalizeId(group.id) === normalizedGroupId)) {
      throw new Error('Groupe introuvable')
    }

    const members = ensureGroupMembers()

    if (
      members.some(
        (member) =>
          normalizeId(member.group_id) === normalizedGroupId && normalizeId(member.member_id) === normalizedMemberId,
      )
    ) {
      throw new Error('Ce membre est déjà dans le groupe')
    }

    const newMember = {
      id: normalizeId(newId()),
      member_id: normalizedMemberId,
      group_id: normalizedGroupId,
      role_devoir: String(role_devoir || 'member'),
      actif: true,
      joined_at: nowIso(),
    }

    const nextMembers = [...members, newMember]
    writeStorage(GROUP_MEMBERS_KEY, nextMembers)
    updateGroupMemberCount(normalizedGroupId)

    return newMember
  },

  removeMemberFromGroup(groupId, memberId) {
    const normalizedGroupId = normalizeId(groupId)
    const normalizedMemberId = normalizeId(memberId)

    const members = ensureGroupMembers()
    const nextMembers = members.filter(
      (member) =>
        !(normalizeId(member.group_id) === normalizedGroupId && normalizeId(member.member_id) === normalizedMemberId),
    )

    writeStorage(GROUP_MEMBERS_KEY, nextMembers)
    updateGroupMemberCount(normalizedGroupId)

    return true
  },

  joinGroupByInvitationCode({ code, member_id }) {
    const normalizedCode = String(code || '').trim().toUpperCase()
    const normalizedMemberId = normalizeId(member_id)

    if (!normalizedCode) throw new Error('Le code d\'invitation est requis')

    const groups = ensureGroups()
    const group = groups.find(
      (candidate) =>
        String(candidate.code_invitation || '').trim().toUpperCase() === normalizedCode && candidate.status === 'active',
    )

    if (!group) throw new Error('Aucun groupe actif trouvé avec ce code')

    const membership = this.addMemberToGroup({
      group_id: group.id,
      member_id: normalizedMemberId,
      role_devoir: 'member',
    })

    return { group, membership }
  },

  getGroupsForMember(memberId, { includeInactive = false } = {}) {
    const normalizedMemberId = normalizeId(memberId)
    const memberships = ensureGroupMembers().filter(
      (member) => normalizeId(member.member_id) === normalizedMemberId,
    )

    const allowedGroupIds = new Set(memberships.map((membership) => normalizeId(membership.group_id)))

    return ensureGroups().filter((group) => {
      const isMember = allowedGroupIds.has(normalizeId(group.id))
      if (!includeInactive && group.status !== 'active') return false
      return isMember
    })
  },

  isMemberInGroup(groupId, memberId) {
    const normalizedGroupId = normalizeId(groupId)
    const normalizedMemberId = normalizeId(memberId)

    return ensureGroupMembers().some(
      (member) =>
        normalizeId(member.group_id) === normalizedGroupId && normalizeId(member.member_id) === normalizedMemberId,
    )
  },

  toggleMemberStatus(groupId, memberId, active) {
    const normalizedGroupId = normalizeId(groupId)
    const normalizedMemberId = normalizeId(memberId)

    const members = ensureGroupMembers()
    const member = members.find(
      (item) =>
        normalizeId(item.group_id) === normalizedGroupId && normalizeId(item.member_id) === normalizedMemberId,
    )

    if (member) {
      member.actif = active
      writeStorage(GROUP_MEMBERS_KEY, members)
    }

    return member || null
  },

  updateMemberRole(groupId, memberId, role_devoir) {
    const normalizedGroupId = normalizeId(groupId)
    const normalizedMemberId = normalizeId(memberId)

    const members = ensureGroupMembers()
    const member = members.find(
      (item) =>
        normalizeId(item.group_id) === normalizedGroupId && normalizeId(item.member_id) === normalizedMemberId,
    )

    if (member) {
      member.role_devoir = String(role_devoir || 'member')
      writeStorage(GROUP_MEMBERS_KEY, members)
    }

    return member || null
  },
}
