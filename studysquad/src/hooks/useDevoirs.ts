import { useState, useCallback } from 'react'
import type {
  Devoir,
  DevoirWithDetails,
  CreateDevoirInput,
  UpdateDevoirInput,
  DevoirFilters,
} from '../types/index'
import * as devoirService from '../services/devoirService'

interface UseDevoirsState {
  devoirs: Devoir[]
  groupDevoirs: DevoirWithDetails[]
  currentDevoir: DevoirWithDetails | null
  loading: boolean
  error: string | null
}

export const useDevoirs = () => {
  const [state, setState] = useState<UseDevoirsState>({
    devoirs: [],
    groupDevoirs: [],
    currentDevoir: null,
    loading: false,
    error: null,
  })

  // Helper pour recalculer isLate et isCompleted
  const enrichDevoirWithFlags = useCallback((devoir: Devoir): DevoirWithDetails => {
    const now = new Date()
    const deadline = devoir.deadline ? new Date(devoir.deadline) : null
    const isLate = deadline && deadline < now && devoir.etat !== 'terminé'
    const isCompleted = devoir.etat === 'terminé'

    return {
      ...devoir,
      isLate,
      isCompleted,
    } as DevoirWithDetails
  }, [])

  // Helper pour enrichir un tableau de devoirs
  const enrichDevoirsWithFlags = useCallback(
    (devoirs: Devoir[]): DevoirWithDetails[] => {
      return devoirs.map((devoir) => enrichDevoirWithFlags(devoir))
    },
    [enrichDevoirWithFlags]
  )

  // ======================================
  // CREATE DEVOIR
  // ======================================
  const createDevoir = useCallback(async (input: CreateDevoirInput, userId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const newDevoir = await devoirService.createDevoir(input, userId)
      const enrichedDevoir = enrichDevoirWithFlags(newDevoir)
      
      setState((prev) => ({
        ...prev,
        devoirs: [enrichedDevoir, ...prev.devoirs],
        loading: false,
      }))
      return enrichedDevoir
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur création devoir'
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }, [enrichDevoirWithFlags])

  // ======================================
  // FETCH USER DEVOIRS (SOLO MODE)
  // ======================================
  const fetchUserDevoirs = useCallback(async (userId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const devoirs = await devoirService.getUserDevoirs(userId)
      const enrichedDevoirs = enrichDevoirsWithFlags(devoirs)
      
      setState((prev) => ({
        ...prev,
        devoirs: enrichedDevoirs,
        loading: false,
      }))
      return enrichedDevoirs
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur récupération devoirs'
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }, [enrichDevoirsWithFlags])

  // ======================================
  // FETCH GROUP DEVOIRS
  // ======================================
  const fetchGroupDevoirs = useCallback(async (groupId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const devoirs = await devoirService.getGroupDevoirs(groupId)
      // Les devoirs de groupe viennent déjà avec isLate/isCompleted du service
      setState((prev) => ({
        ...prev,
        groupDevoirs: devoirs,
        loading: false,
      }))
      return devoirs
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erreur récupération devoirs groupe'
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }, [])

  // ======================================
  // GET SINGLE DEVOIR
  // ======================================
  const getDevoir = useCallback(async (devoirId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const devoir = await devoirService.getDevoir(devoirId)
      setState((prev) => ({
        ...prev,
        currentDevoir: devoir,
        loading: false,
      }))
      return devoir
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur récupération devoir'
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }, [])

  // ======================================
  // UPDATE DEVOIR
  // ======================================
  const updateDevoir = useCallback(async (devoirId: string, input: UpdateDevoirInput) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const updated = await devoirService.updateDevoir(devoirId, input)
      const enrichedUpdated = enrichDevoirWithFlags(updated)
      
      setState((prev) => ({
        ...prev,
        devoirs: prev.devoirs.map((d) => (d.id === devoirId ? enrichedUpdated : d)),
        groupDevoirs: prev.groupDevoirs.map((d) =>
          d.id === devoirId ? { ...d, ...enrichedUpdated } : d
        ),
        currentDevoir:
          prev.currentDevoir?.id === devoirId
            ? { ...prev.currentDevoir, ...enrichedUpdated }
            : prev.currentDevoir,
        loading: false,
      }))
      return enrichedUpdated
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur mise à jour devoir'
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }, [enrichDevoirWithFlags])

  // ======================================
  // DELETE DEVOIR
  // ======================================
  const deleteDevoir = useCallback(async (devoirId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      await devoirService.deleteDevoir(devoirId)
      setState((prev) => ({
        ...prev,
        devoirs: prev.devoirs.filter((d) => d.id !== devoirId),
        groupDevoirs: prev.groupDevoirs.filter((d) => d.id !== devoirId),
        currentDevoir: prev.currentDevoir?.id === devoirId ? null : prev.currentDevoir,
        loading: false,
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur suppression devoir'
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }, [])

  // ======================================
  // MARK AS COMPLETE
  // ======================================
  const markComplete = useCallback(async (devoirId: string) => {
    return updateDevoir(devoirId, { etat: 'terminé' })
  }, [updateDevoir])

  // ======================================
  // MARK AS IN PROGRESS
  // ======================================
  const markInProgress = useCallback(async (devoirId: string) => {
    return updateDevoir(devoirId, { etat: 'en cours' })
  }, [updateDevoir])

  // ======================================
  // FILTER DEVOIRS (CORRIGÉ AVEC DEPENDANCE)
  // ======================================
  const filterDevoirs = useCallback(
    (filters: DevoirFilters): Devoir[] => {
      let filtered = [...state.devoirs]

      if (filters.state) {
        filtered = filtered.filter((d) => d.etat === filters.state)
      }

      if (filters.priority) {
        filtered = filtered.filter((d) => d.priorite === filters.priority)
      }

      if (filters.group_id) {
        filtered = filtered.filter((d) => d.group_id === filters.group_id)
      }

      if (filters.sortBy) {
        const priorityMap = { haute: 3, moyenne: 2, faible: 1 }

        filtered.sort((a, b) => {
          let valueA: number = 0
          let valueB: number = 0

          switch (filters.sortBy) {
            case 'deadline':
              valueA = a.deadline ? new Date(a.deadline).getTime() : Infinity
              valueB = b.deadline ? new Date(b.deadline).getTime() : Infinity
              break
            case 'priority':
              valueA = priorityMap[a.priorite]
              valueB = priorityMap[b.priorite]
              break
            case 'created_at':
              valueA = new Date(a.created_at).getTime()
              valueB = new Date(b.created_at).getTime()
              break
          }

          return filters.sortOrder === 'desc' ? valueB - valueA : valueA - valueB
        })
      }

      return filtered
    },
    [state.devoirs] // ✅ Dépendance ajoutée
  )

  // ======================================
  // FILTER GROUP DEVOIRS (NOUVEAU)
  // ======================================
  const filterGroupDevoirs = useCallback(
    (filters: Omit<DevoirFilters, 'group_id'>): DevoirWithDetails[] => {
      let filtered = [...state.groupDevoirs]

      if (filters.state) {
        filtered = filtered.filter((d) => d.etat === filters.state)
      }

      if (filters.priority) {
        filtered = filtered.filter((d) => d.priorite === filters.priority)
      }

      if (filters.sortBy) {
        const priorityMap = { haute: 3, moyenne: 2, faible: 1 }

        filtered.sort((a, b) => {
          let valueA: number = 0
          let valueB: number = 0

          switch (filters.sortBy) {
            case 'deadline':
              valueA = a.deadline ? new Date(a.deadline).getTime() : Infinity
              valueB = b.deadline ? new Date(b.deadline).getTime() : Infinity
              break
            case 'priority':
              valueA = priorityMap[a.priorite]
              valueB = priorityMap[b.priorite]
              break
            case 'created_at':
              valueA = new Date(a.created_at).getTime()
              valueB = new Date(b.created_at).getTime()
              break
          }

          return filters.sortOrder === 'desc' ? valueB - valueA : valueA - valueB
        })
      }

      return filtered
    },
    [state.groupDevoirs]
  )

  // ======================================
  // GET STATS (NOUVEAU)
  // ======================================
  const getStats = useCallback(() => {
    const totalToDoDevoirs = state.devoirs.filter(
      (d) => d.etat !== 'terminé'
    ).length
    
    const lateDevoirs = state.devoirs.filter((d) => {
      const deadline = d.deadline ? new Date(d.deadline) : null
      return deadline && deadline < new Date() && d.etat !== 'terminé'
    })
    
    const completedDevoirs = state.devoirs.filter((d) => d.etat === 'terminé')
    
    const upcomingDeadlines = state.devoirs
      .filter((d) => {
        const deadline = d.deadline ? new Date(d.deadline) : null
        return deadline && deadline > new Date() && d.etat !== 'terminé'
      })
      .sort((a, b) => {
        const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity
        const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity
        return dateA - dateB
      })
      .slice(0, 5)

    return {
      totalToDoDevoirs,
      lateDevoirs,
      completedDevoirs,
      upcomingDeadlines,
    }
  }, [state.devoirs])

  // ======================================
  // CLEAR ERROR
  // ======================================
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  // ======================================
  // RESET (NOUVEAU)
  // ======================================
  const reset = useCallback(() => {
    setState({
      devoirs: [],
      groupDevoirs: [],
      currentDevoir: null,
      loading: false,
      error: null,
    })
  }, [])

  return {
    // State
    devoirs: state.devoirs,
    groupDevoirs: state.groupDevoirs,
    currentDevoir: state.currentDevoir,
    loading: state.loading,
    error: state.error,

    // Methods
    createDevoir,
    fetchUserDevoirs,
    fetchGroupDevoirs,
    getDevoir,
    updateDevoir,
    deleteDevoir,
    markComplete,
    markInProgress,
    filterDevoirs,
    filterGroupDevoirs,
    getStats,
    clearError,
    reset,
  }
}