import { useState, useCallback } from 'react'
import type {
  Group,
  GroupWithMembers,
  CreateGroupInput,
  JoinGroupInput,
  GroupMemberWithDetails,
} from '../types/index'
import * as groupService from '../services/groupService'

interface UseGroupsState {
  groups: Group[]
  currentGroup: GroupWithMembers | null
  groupMembers: GroupMemberWithDetails[]
  loading: boolean
  error: string | null
}

export const useGroups = () => {
  const [state, setState] = useState<UseGroupsState>({
    groups: [],
    currentGroup: null,
    groupMembers: [],
    loading: false,
    error: null,
  })

  // ======================================
  // CREATE GROUP
  // ======================================
  const createGroup = useCallback(async (input: CreateGroupInput, userId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const newGroup = await groupService.createGroup(input, userId)
      setState((prev) => ({
        ...prev,
        groups: [newGroup, ...prev.groups],
        loading: false,
      }))
      return newGroup
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur création groupe'
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }, [])

  // ======================================
  // FETCH USER GROUPS
  // ======================================
  const fetchUserGroups = useCallback(async (userId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const groups = await groupService.getUserGroups(userId)
      setState((prev) => ({
        ...prev,
        groups,
        loading: false,
      }))
      return groups
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur récupération groupes'
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }, [])

  // ======================================
  // GET GROUP WITH MEMBERS
  // ======================================
  const getGroupWithMembers = useCallback(async (groupId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const group = await groupService.getGroupWithMembers(groupId)
      setState((prev) => ({
        ...prev,
        currentGroup: group,
        groupMembers: group.members,
        loading: false,
      }))
      return group
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erreur récupération groupe avec membres'
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }, [])

  // ======================================
  // JOIN GROUP BY CODE
  // ======================================
  const joinGroup = useCallback(async (input: JoinGroupInput, userId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const group = await groupService.joinGroup(input, userId)
      setState((prev) => ({
        ...prev,
        groups: [group, ...prev.groups],
        loading: false,
      }))
      return group
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur rejoindre groupe'
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }, [])

  // ======================================
  // LEAVE GROUP
  // ======================================
  const leaveGroup = useCallback(async (groupId: string, userId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      await groupService.leaveGroup(groupId, userId)
      setState((prev) => ({
        ...prev,
        groups: prev.groups.filter((g) => g.id !== groupId),
        currentGroup: prev.currentGroup?.id === groupId ? null : prev.currentGroup,
        loading: false,
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur quitter groupe'
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }, [])

  // ======================================
  // GET GROUP MEMBERS
  // ======================================
  const getGroupMembers = useCallback(async (groupId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const members = await groupService.getGroupMembers(groupId)
      setState((prev) => ({
        ...prev,
        groupMembers: members,
        loading: false,
      }))
      return members
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur récupération membres'
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }, [])

  // ======================================
  // DELETE GROUP
  // ======================================
  const deleteGroup = useCallback(async (groupId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      await groupService.deleteGroup(groupId)
      setState((prev) => ({
        ...prev,
        groups: prev.groups.filter((g) => g.id !== groupId),
        currentGroup: prev.currentGroup?.id === groupId ? null : prev.currentGroup,
        loading: false,
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur suppression groupe'
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }, [])

  // ======================================
  // UPDATE GROUP
  // ======================================
  const updateGroup = useCallback(async (groupId: string, updates: Partial<Group>) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const updated = await groupService.updateGroup(groupId, updates)
      setState((prev) => ({
        ...prev,
        groups: prev.groups.map((g) => (g.id === groupId ? updated : g)),
        currentGroup:
          prev.currentGroup?.id === groupId
            ? { ...prev.currentGroup, ...updated }
            : prev.currentGroup,
        loading: false,
      }))
      return updated
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur mise à jour groupe'
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }, [])

  // ======================================
  // CLEAR CURRENT GROUP
  // ======================================
  const clearCurrentGroup = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentGroup: null,
      groupMembers: [],
    }))
  }, [])

  // ======================================
  // CLEAR ERROR
  // ======================================
  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }))
  }, [])

  return {
    // State
    groups: state.groups,
    currentGroup: state.currentGroup,
    groupMembers: state.groupMembers,
    loading: state.loading,
    error: state.error,

    // Methods
    createGroup,
    fetchUserGroups,
    getGroupWithMembers,
    joinGroup,
    leaveGroup,
    getGroupMembers,
    deleteGroup,
    updateGroup,
    clearCurrentGroup,
    clearError,
  }
}