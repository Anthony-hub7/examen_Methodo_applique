import seedData from './dataAdmin.json'

const POSTS_KEY = 'studysquad_posts'

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

function seedPosts() {
  return Array.isArray(seedData.posts) ? seedData.posts : []
}

/**
 * Normalise un post (migration "best effort" depuis les anciennes versions).
 * Objectif: garder la donnée mock (dataAdmin.json / localStorage) compatible dans le temps.
 */
function normalizePost(raw) {
  if (!raw || typeof raw !== 'object') return null

  const id = raw.id ? String(raw.id) : String(Date.now())
  const createdAt = raw.createdAt ? String(raw.createdAt) : new Date().toISOString()

  const author =
    raw.author && typeof raw.author === 'object'
      ? {
          id: raw.author.id ? String(raw.author.id) : '',
          name: raw.author.name ? String(raw.author.name) : 'Anonyme',
          email: raw.author.email ? String(raw.author.email) : '',
          role: raw.author.role ? String(raw.author.role) : '',
        }
      : null

  const likes = Array.isArray(raw.likes) ? raw.likes.map((x) => String(x)) : []
  const comments = Array.isArray(raw.comments)
    ? raw.comments
        .map((c) => normalizeComment(c))
        .filter(Boolean)
    : []

  return {
    id,
    type: raw.type ? String(raw.type) : 'help_devoir',
    content: raw.content ? String(raw.content) : '',
    author,
    createdAt,
    target: raw.target && typeof raw.target === 'object' ? raw.target : undefined,
    isActive: typeof raw.isActive === 'boolean' ? raw.isActive : true,
    likes,
    comments,
  }
}

function normalizeComment(raw) {
  if (!raw || typeof raw !== 'object') return null
  const id = raw.id ? String(raw.id) : String(Date.now())
  const createdAt = raw.createdAt ? String(raw.createdAt) : new Date().toISOString()

  const author =
    raw.author && typeof raw.author === 'object'
      ? {
          id: raw.author.id ? String(raw.author.id) : '',
          name: raw.author.name ? String(raw.author.name) : 'Anonyme',
          email: raw.author.email ? String(raw.author.email) : '',
          role: raw.author.role ? String(raw.author.role) : '',
        }
      : null

  return {
    id,
    content: raw.content ? String(raw.content) : '',
    author,
    createdAt,
    isActive: typeof raw.isActive === 'boolean' ? raw.isActive : true,
  }
}

function ensurePosts() {
  const existing = readStorage(POSTS_KEY, null)
  if (existing && Array.isArray(existing) && existing.length > 0) {
    // Migration: ajoute les champs manquants (likes/comments/isActive, etc.)
    const migrated = existing.map((p) => normalizePost(p)).filter(Boolean)
    writeStorage(POSTS_KEY, migrated)
    return migrated
  }

  const seeded = seedPosts().map((p) => normalizePost(p)).filter(Boolean)
  writeStorage(POSTS_KEY, seeded)
  return seeded
}

function sortByCreatedAtDesc(posts) {
  return [...posts].sort((a, b) => {
    const at = new Date(a.createdAt || 0).getTime()
    const bt = new Date(b.createdAt || 0).getTime()
    return bt - at
  })
}

function updatePosts(mutator) {
  const posts = ensurePosts()
  const next = mutator(posts)
  writeStorage(POSTS_KEY, next)
  return next
}

function findPostOrThrow(posts, postId) {
  const idx = posts.findIndex((p) => String(p.id) === String(postId))
  if (idx === -1) throw new Error('Post introuvable.')
  return { idx, post: posts[idx] }
}

export const postsService = {
  /**
   * Récupère les posts.
   * - includeInactive=false: ne retourne que les posts actifs (mode "réseau social").
   * - includeInactive=true: retourne tout (pour modération admin).
   */
  getPosts({ includeInactive = false } = {}) {
    const posts = ensurePosts()
    const filtered = includeInactive ? posts : posts.filter((p) => p.isActive !== false)
    return sortByCreatedAtDesc(filtered)
  },

  createPost({ type, content, targetText, author }) {
    if (!type || !content) throw new Error('Champs requis manquants.')

    const target =
      typeof targetText === 'string' && targetText.trim().length > 0
        ? type === 'help_devoir'
          ? { devoir: targetText.trim() }
          : { groupe: targetText.trim() }
        : undefined

    const nextPost = {
      id: String(Date.now()),
      type,
      content: content.trim(),
      author: author
        ? {
            id: author.id,
            name: author.name,
            email: author.email,
            role: author.role,
          }
        : null,
      createdAt: new Date().toISOString(),
      target,
      isActive: true,
      likes: [],
      comments: [],
    }

    updatePosts((posts) => [nextPost, ...posts])
    return nextPost
  },

  setPostActive(postId, isActive) {
    const next = updatePosts((posts) => {
      const { idx, post } = findPostOrThrow(posts, postId)
      const updated = { ...post, isActive: Boolean(isActive) }
      const copy = [...posts]
      copy[idx] = updated
      return copy
    })
    return next.find((p) => String(p.id) === String(postId))
  },

  deletePost(postId) {
    updatePosts((posts) => posts.filter((p) => String(p.id) !== String(postId)))
    return true
  },

  toggleLike(postId, userId) {
    if (!userId) throw new Error('Utilisateur requis.')
    const next = updatePosts((posts) => {
      const { idx, post } = findPostOrThrow(posts, postId)
      const likes = Array.isArray(post.likes) ? post.likes : []
      const hasLiked = likes.includes(String(userId))
      const updated = {
        ...post,
        likes: hasLiked ? likes.filter((id) => id !== String(userId)) : [String(userId), ...likes],
      }
      const copy = [...posts]
      copy[idx] = updated
      return copy
    })
    return next.find((p) => String(p.id) === String(postId))
  },

  addComment(postId, { content, author }) {
    if (!content || String(content).trim().length === 0) throw new Error('Commentaire vide.')
    const next = updatePosts((posts) => {
      const { idx, post } = findPostOrThrow(posts, postId)
      const nextComment = {
        id: String(Date.now()),
        content: String(content).trim(),
        author: author
          ? {
              id: author.id,
              name: author.name,
              email: author.email,
              role: author.role,
            }
          : null,
        createdAt: new Date().toISOString(),
        isActive: true,
      }

      const comments = Array.isArray(post.comments) ? post.comments : []
      const updated = { ...post, comments: [...comments, nextComment] }
      const copy = [...posts]
      copy[idx] = updated
      return copy
    })
    return next.find((p) => String(p.id) === String(postId))
  },

  deleteComment(postId, commentId) {
    updatePosts((posts) => {
      const { idx, post } = findPostOrThrow(posts, postId)
      const comments = Array.isArray(post.comments) ? post.comments : []
      const updated = { ...post, comments: comments.filter((c) => String(c.id) !== String(commentId)) }
      const copy = [...posts]
      copy[idx] = updated
      return copy
    })
    return true
  },
}
