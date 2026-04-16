import { useCallback, useEffect, useMemo, useState } from 'react'
import { devoirService } from '../services/devoirService'

function useSnapshotState() {
  const [members, setMembers] = useState([])
  const [groups, setGroups] = useState([])
  const [devoirs, setDevoirs] = useState([])
  const [notifications, setNotifications] = useState([])
  const [remindersSent, setRemindersSent] = useState(0)

  const applySnapshot = useCallback((snapshot) => {
    setMembers(snapshot.members || [])
    setGroups(snapshot.groups || [])
    setDevoirs(snapshot.devoirs || [])
    setNotifications(snapshot.notifications || [])
    setRemindersSent(Number(snapshot.remindersSent || 0))
  }, [])

  return {
    members,
    groups,
    devoirs,
    notifications,
    remindersSent,
    applySnapshot,
  }
}

export function useDevoirs() {
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const [filterState, setFilterState] = useState('tous')
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('deadline')
  const [sortOrder, setSortOrder] = useState('asc')

  const snapshotState = useSnapshotState()
  const { applySnapshot, members, groups, devoirs, notifications, remindersSent } = snapshotState

  const loadData = useCallback(() => {
    setLoading(true)
    setError('')
    try {
      const snapshot = devoirService.getAdminSnapshot()
      applySnapshot(snapshot)
    } catch {
      setError('Impossible de charger les devoirs admin.')
    } finally {
      setLoading(false)
    }
  }, [applySnapshot])

  useEffect(() => {
    loadData()
  }, [loadData])

  const memberById = useMemo(
    () => new Map(members.map((member) => [member.id, member])),
    [members],
  )

  const groupById = useMemo(
    () => new Map(groups.map((group) => [group.id, group])),
    [groups],
  )

  const filteredDevoirs = useMemo(
    () =>
      devoirService.filterAndSortDevoirs({
        devoirs,
        filterState,
        query,
        sortBy,
        sortOrder,
        memberById,
        groupById,
      }),
    [devoirs, filterState, query, sortBy, sortOrder, memberById, groupById],
  )

  const updateDevoir = useCallback(
    (devoirId, partialData) => {
      try {
        const snapshot = devoirService.updateDevoir(devoirId, partialData)
        applySnapshot(snapshot)
      } catch {
        setError('La mise a jour du devoir a echoue.')
      }
    },
    [applySnapshot],
  )

  const markAsDone = useCallback(
    (devoirId) => {
      try {
        const snapshot = devoirService.markAsDone(devoirId)
        applySnapshot(snapshot)
      } catch {
        setError('Impossible de marquer ce devoir comme termine.')
      }
    },
    [applySnapshot],
  )

  const sendReminders = useCallback(() => {
    try {
      const { snapshot } = devoirService.sendReminders()
      applySnapshot(snapshot)
    } catch {
      setError('Envoi des rappels impossible.')
    }
  }, [applySnapshot])

  const createDevoir = useCallback(
    (payload) => {
      try {
        const snapshot = devoirService.createDevoir(payload)
        applySnapshot(snapshot)
        return snapshot
      } catch (err) {
        setError(err?.message || 'Creation du devoir impossible.')
        return null
      }
    },
    [applySnapshot],
  )

  const deleteDevoir = useCallback(
    (devoirId) => {
      try {
        const snapshot = devoirService.deleteDevoir(devoirId)
        applySnapshot(snapshot)
      } catch {
        setError('Suppression du devoir impossible.')
      }
    },
    [applySnapshot],
  )

  const uploadAttachments = useCallback(
    async (devoirId, files) => {
      setUploading(true)
      setError('')
      try {
        const snapshot = await devoirService.addAttachments(devoirId, files)
        applySnapshot(snapshot)
        return snapshot
      } catch (err) {
        setError(err?.message || 'Upload impossible.')
        return null
      } finally {
        setUploading(false)
      }
    },
    [applySnapshot],
  )

  const removeAttachment = useCallback(
    (devoirId, attachmentId) => {
      try {
        const snapshot = devoirService.removeAttachment(devoirId, attachmentId)
        applySnapshot(snapshot)
      } catch {
        setError('Suppression du fichier impossible.')
      }
    },
    [applySnapshot],
  )

  return {
    loading,
    uploading,
    error,
    filterState,
    query,
    sortBy,
    sortOrder,
    setFilterState,
    setQuery,
    setSortBy,
    setSortOrder,
    members,
    groups,
    devoirs,
    filteredDevoirs,
    notifications,
    remindersSent,
    memberById,
    groupById,
    loadData,
    updateDevoir,
    markAsDone,
    createDevoir,
    deleteDevoir,
    sendReminders,
    uploadAttachments,
    removeAttachment,
    computeState: devoirService.getDevoirComputedState,
    formatDateFR: devoirService.formatDateFR,
    formatBytes: devoirService.formatBytes,
  }
}
