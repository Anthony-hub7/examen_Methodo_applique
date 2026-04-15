import { supabase } from './supabaseClient'
import type { Post, PostWithDetails, SendPostInput } from '../types/index'

type UpdatePostInput = Partial<Pick<Post, 'type' | 'commentaire' | 'reaction' | 'nb_vue'>>

// ======================================
// CREATE POST
// ======================================
export const createPost = async (
  input: SendPostInput,
  userId: string,
): Promise<Post> => {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      type: input.type,
      commentaire: input.commentaire || null,
      reaction: input.reaction || null,
      devoir_id: input.devoir_id,
      member_id: userId,
      nb_vue: 0,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Erreur création post: ${error.message}`)
  }

  return data
}

// ======================================
// GET SINGLE POST
// ======================================
export const getPost = async (postId: string): Promise<PostWithDetails> => {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      member:members(*)
    `)
    .eq('id', postId)
    .single()

  if (error) {
    throw new Error(`Post non trouvé: ${error.message}`)
  }

  return data
}

// ======================================
// GET POSTS BY DEVOIR
// ======================================
export const getDevoirPosts = async (devoirId: string): Promise<PostWithDetails[]> => {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      member:members(*)
    `)
    .eq('devoir_id', devoirId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Erreur récupération posts: ${error.message}`)
  }

  return data || []
}

// ======================================
// UPDATE POST
// ======================================
export const updatePost = async (
  postId: string,
  input: UpdatePostInput,
): Promise<Post> => {
  const { data, error } = await supabase
    .from('posts')
    .update(input)
    .eq('id', postId)
    .select()
    .single()

  if (error) {
    throw new Error(`Erreur mise à jour post: ${error.message}`)
  }

  return data
}

// ======================================
// INCREMENT POST VIEWS
// ======================================
export const incrementPostViews = async (postId: string): Promise<Post> => {
  const { data: existingPost, error: fetchError } = await supabase
    .from('posts')
    .select('nb_vue')
    .eq('id', postId)
    .single()

  if (fetchError) {
    throw new Error(`Erreur récupération vue post: ${fetchError.message}`)
  }

  const nextViews = (existingPost?.nb_vue || 0) + 1
  return updatePost(postId, { nb_vue: nextViews })
}

// ======================================
// DELETE POST
// ======================================
export const deletePost = async (postId: string): Promise<void> => {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)

  if (error) {
    throw new Error(`Erreur suppression post: ${error.message}`)
  }
}
