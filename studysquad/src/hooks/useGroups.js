import { useCallback, useMemo, useState } from 'react'
import { groupService } from '../services/groupService'
import { normalizeId } from '../components/groupes/groupUtils'

function buildGroupMembersMap(groups) {
  const map = {}
  groups.forEach((group) => {
    map[group.id] = groupService.getGroupMembers(group.id)
  })
  return map
}

function readInitialState() {
  const groups = groupService.getAllGroups()
  return {
    groups,
    membersDirectory: groupService.getMemberDirectory(),
    groupMembersByGroup: buildGroupMembersMap(groups),
  }
}

export function useGroups() {
  const [state, setState] = useState(readInitialState)

  const refresh = useCallback(() => {
    const next = readInitialState()
    setState(next)
    return next
  }, [])

  const createGroup = useCallback(
    (payload) => {
      const created = groupService.createGroup(payload)
      refresh()
      return created
    },
    [refresh],
  )

  const updateGroup = useCallback(
    (groupId, updates) => {
      const updated = groupService.updateGroup(groupId, updates)
      refresh()
      return updated
    },
    [refresh],
  )

  const deleteGroup = useCallback(
    (groupId) => {
      const removed = groupService.deleteGroup(groupId)
      refresh()
      return removed
    },
    [refresh],
  )

  const archiveGroup = useCallback(
    (groupId) => {
      const updated = groupService.archiveGroup(groupId)
      refresh()
      return updated
    },
    [refresh],
  )

  const disableGroup = useCallback(
    (groupId) => {
      const updated = groupService.disableGroup(groupId)
      refresh()
      return updated
    },
    [refresh],
  )

  const activateGroup = useCallback(
    (groupId) => {
      const updated = groupService.activateGroup(groupId)
      refresh()
      return updated
    },
    [refresh],
  )

  const renewInvitationCode = useCallback(
    (groupId) => {
      const updated = groupService.renewInvitationCode(groupId)
      refresh()
      return updated
    },
    [refresh],
  )

  const addMemberToGroup = useCallback(
    ({ groupId, memberId, roleDevoir = 'member' }) => {
      const membership = groupService.addMemberToGroup({
        group_id: normalizeId(groupId),
        member_id: normalizeId(memberId),
        role_devoir: roleDevoir,
      })
      refresh()
      return membership
    },
    [refresh],
  )

  const removeMemberFromGroup = useCallback(
    (groupId, memberId) => {
      const removed = groupService.removeMemberFromGroup(normalizeId(groupId), normalizeId(memberId))
      refresh()
      return removed
    },
    [refresh],
  )

  const joinGroupByCode = useCallback(
    ({ code, memberId }) => {
      const result = groupService.joinGroupByInvitationCode({
        code,
        member_id: normalizeId(memberId),
      })
      refresh()
      return result
    },
    [refresh],
  )

  const memberById = useMemo(
    () => new Map(state.membersDirectory.map((member) => [normalizeId(member.id), member])),
    [state.membersDirectory],
  )

  return {
    groups: state.groups,
    membersDirectory: state.membersDirectory,
    groupMembersByGroup: state.groupMembersByGroup,
    memberById,
    refresh,
    createGroup,
    updateGroup,
    deleteGroup,
    archiveGroup,
    disableGroup,
    activateGroup,
    renewInvitationCode,
    addMemberToGroup,
    removeMemberFromGroup,
    joinGroupByCode,
  }
}
