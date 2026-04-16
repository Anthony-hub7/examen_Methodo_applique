import { useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usePosts } from '../../hooks/usePosts'
import PostBadge from '../ui/PostBadge'

function formatDate(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function PostFeedItem({ post }) {
  const { user } = useAuth()
  const { toggleLike, addComment, deletePost, setPostActive, deleteComment } = usePosts()
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const isAdmin = user?.role === 'admin'
  const userId = user?.id ? String(user.id) : ''

  const hasLiked = useMemo(() => {
    if (!userId) return false
    return Array.isArray(post.likes) ? post.likes.includes(userId) : false
  }, [post.likes, userId])

  const targetText =
    post?.target?.devoir ? post.target.devoir : post?.target?.groupe ? post.target.groupe : ''

  const visibleComments = useMemo(() => {
    const comments = Array.isArray(post.comments) ? post.comments : []
    return comments.filter((c) => c?.isActive !== false)
  }, [post.comments])

  const handleToggleLike = () => {
    if (!userId) return
    toggleLike(post.id, userId)
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    setError('')
    try {
      setSubmitting(true)
      addComment(post.id, {
        content: commentText,
        author: user ? { id: user.id, name: user.name, email: user.email, role: user.role } : null,
      })
      setCommentText('')
      setShowComments(true)
    } catch (err) {
      setError(err?.message || 'Impossible de commenter.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = () => {
    setPostActive(post.id, !(post.isActive !== false))
  }

  const handleDeletePost = () => {
    if (!isAdmin) return
    const ok = window.confirm('Supprimer ce post ?')
    if (!ok) return
    deletePost(post.id)
  }

  const handleDeleteComment = (commentId) => {
    if (!isAdmin) return
    const ok = window.confirm('Supprimer ce commentaire ?')
    if (!ok) return
    deleteComment(post.id, commentId)
  }

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <PostBadge type={post.type} />
          {post.isActive === false ? (
            <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-xs font-semibold text-amber-200">
              Inactif
            </span>
          ) : null}
        </div>

        <span className="text-xs text-white/50">{formatDate(post.createdAt)}</span>
      </header>

      <div className="mb-1 text-sm font-semibold text-white/90">{post.author?.name || 'Anonyme'}</div>
      {targetText ? <div className="mb-3 text-xs text-white/70">Cible : {targetText}</div> : null}

      <p className="mb-4 whitespace-pre-wrap text-sm text-white/85">{post.content}</p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleToggleLike}
          disabled={!userId}
          className={
            'rounded-lg border px-3 py-2 text-sm font-semibold ' +
            (hasLiked
              ? 'border-brand-red/40 bg-brand-red/20 text-white'
              : 'border-white/10 bg-white/5 text-white/90')
          }
          title={!userId ? 'Connecte-toi pour liker' : 'Like'}
        >
          {hasLiked ? 'Aimé' : 'Like'} ({Array.isArray(post.likes) ? post.likes.length : 0})
        </button>

        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/90"
        >
          Commentaires ({visibleComments.length})
        </button>

        {isAdmin ? (
          <>
            <button
              type="button"
              onClick={handleToggleActive}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/90"
            >
              {post.isActive === false ? 'Activer' : 'Désactiver'}
            </button>
            <button
              type="button"
              onClick={handleDeletePost}
              className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-200"
            >
              Supprimer
            </button>
          </>
        ) : null}
      </div>

      {showComments ? (
        <section className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
          <form onSubmit={handleSubmitComment} className="mb-3 flex flex-col gap-2 md:flex-row">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Écrire un commentaire..."
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/90"
            />
            <button
              type="submit"
              disabled={submitting || commentText.trim().length === 0}
              className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting ? 'Envoi...' : 'Publier'}
            </button>
          </form>

          {error ? <div className="mb-2 text-xs text-red-300">{error}</div> : null}

          {visibleComments.length === 0 ? (
            <div className="text-sm text-white/60">Aucun commentaire.</div>
          ) : (
            <div className="space-y-2">
              {visibleComments.map((c) => (
                <div key={c.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <div className="text-xs font-semibold text-white/85">{c.author?.name || 'Anonyme'}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-white/50">{formatDate(c.createdAt)}</span>
                      {isAdmin ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(c.id)}
                          className="text-xs font-semibold text-red-200 hover:underline"
                        >
                          Supprimer
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <div className="whitespace-pre-wrap text-sm text-white/80">{c.content}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}
    </article>
  )
}
