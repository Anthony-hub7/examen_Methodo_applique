import { useContext } from 'react'
import { PostsContext } from '../context/PostsContext'

export function usePosts() {
  const context = useContext(PostsContext)
  if (!context) {
    throw new Error('usePosts doit etre utilise dans PostsProvider.')
  }
  return context
}

