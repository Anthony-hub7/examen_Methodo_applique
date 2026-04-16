import { createContext, useCallback, useMemo, useState } from 'react'
import { postsService } from '../services/postsService'

/**
 * Flux "backend mock" : UI -> hook -> context -> service (localStorage + seed data).
 * - Le service gère la persistance mock (localStorage) et la migration.
 * - Le context centralise l'état et expose des actions.
 */
export const PostsContext = createContext(undefined)

export function PostsProvider({ children }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [includeInactive, setIncludeInactive] = useState(false)

  const refresh = useCallback(
    ({ includeInactive: nextIncludeInactive } = {}) => {
      const effectiveIncludeInactive =
        typeof nextIncludeInactive === 'boolean' ? nextIncludeInactive : includeInactive

      setError('')
      setLoading(true)
      try {
        const nextPosts = postsService.getPosts({ includeInactive: effectiveIncludeInactive })
        setPosts(nextPosts)
        setIncludeInactive(effectiveIncludeInactive)
      } catch (err) {
        setError(err?.message || 'Impossible de charger les posts.')
      } finally {
        setLoading(false)
      }
    },
    [includeInactive],
  )

  const createPost = useCallback(
    (payload) => {
      const created = postsService.createPost(payload)
      refresh()
      return created
    },
    [refresh],
  )

  const setPostActive = useCallback(
    (postId, isActive) => {
      const updated = postsService.setPostActive(postId, isActive)
      refresh()
      return updated
    },
    [refresh],
  )

  const deletePost = useCallback(
    (postId) => {
      postsService.deletePost(postId)
      refresh()
      return true
    },
    [refresh],
  )

  const toggleLike = useCallback(
    (postId, userId) => {
      const updated = postsService.toggleLike(postId, userId)
      refresh()
      return updated
    },
    [refresh],
  )

  const addComment = useCallback(
    (postId, payload) => {
      const updated = postsService.addComment(postId, payload)
      refresh()
      return updated
    },
    [refresh],
  )

  const deleteComment = useCallback(
    (postId, commentId) => {
      postsService.deleteComment(postId, commentId)
      refresh()
      return true
    },
    [refresh],
  )

  const value = useMemo(
    () => ({
      posts,
      loading,
      error,
      includeInactive,
      refresh,
      createPost,
      setPostActive,
      deletePost,
      toggleLike,
      addComment,
      deleteComment,
    }),
    [
      posts,
      loading,
      error,
      includeInactive,
      refresh,
      createPost,
      setPostActive,
      deletePost,
      toggleLike,
      addComment,
      deleteComment,
    ],
  )

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>
}

