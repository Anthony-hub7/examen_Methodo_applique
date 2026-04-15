import { useCallback, useState } from 'react'
import type { Post, PostWithDetails, SendPostInput } from '../types/index'
import * as postService from '../services/postService'

type UpdatePostInput = Partial<Pick<Post, 'type' | 'commentaire' | 'reaction' | 'nb_vue'>>

interface UsePostsState {
  posts: PostWithDetails[]
  currentPost: PostWithDetails | null
  loading: boolean
  error: string | null
}

export const usePosts = () => {
  const [state, setState] = useState<UsePostsState>({
    posts: [],
    currentPost: null,
    loading: false,
    error: null,
  })

  const createPost = useCallback(async (input: SendPostInput, userId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const created = await postService.createPost(input, userId)
      setState((prev) => ({
        ...prev,
        posts: [created as PostWithDetails, ...prev.posts],
        loading: false,
      }))
      return created
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur création post'
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }, [])

  const fetchDevoirPosts = useCallback(async (devoirId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const posts = await postService.getDevoirPosts(devoirId)
      setState((prev) => ({
        ...prev,
        posts,
        loading: false,
      }))
      return posts
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur récupération posts'
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }, [])

  const getPost = useCallback(async (postId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const post = await postService.getPost(postId)
      setState((prev) => ({
        ...prev,
        currentPost: post,
        loading: false,
      }))
      return post
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur récupération post'
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }, [])

  const updatePost = useCallback(async (postId: string, input: UpdatePostInput) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const updated = await postService.updatePost(postId, input)
      setState((prev) => ({
        ...prev,
        posts: prev.posts.map((p) => (p.id === postId ? { ...p, ...updated } : p)),
        currentPost:
          prev.currentPost?.id === postId
            ? { ...prev.currentPost, ...updated }
            : prev.currentPost,
        loading: false,
      }))
      return updated
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur mise à jour post'
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }, [])

  const incrementPostViews = useCallback(async (postId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const updated = await postService.incrementPostViews(postId)
      setState((prev) => ({
        ...prev,
        posts: prev.posts.map((p) => (p.id === postId ? { ...p, ...updated } : p)),
        currentPost:
          prev.currentPost?.id === postId
            ? { ...prev.currentPost, ...updated }
            : prev.currentPost,
        loading: false,
      }))
      return updated
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erreur incrémentation vues post'
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }, [])

  const deletePost = useCallback(async (postId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      await postService.deletePost(postId)
      setState((prev) => ({
        ...prev,
        posts: prev.posts.filter((p) => p.id !== postId),
        currentPost: prev.currentPost?.id === postId ? null : prev.currentPost,
        loading: false,
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur suppression post'
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }, [])

  const clearPosts = useCallback(() => {
    setState((prev) => ({ ...prev, posts: [], currentPost: null }))
  }, [])

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  return {
    posts: state.posts,
    currentPost: state.currentPost,
    loading: state.loading,
    error: state.error,

    createPost,
    fetchDevoirPosts,
    getPost,
    updatePost,
    incrementPostViews,
    deletePost,
    clearPosts,
    clearError,
  }
}
