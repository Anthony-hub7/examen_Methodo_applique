import { useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'
import { useAuth } from '../../hooks/useAuth'
import { usePosts } from '../../hooks/usePosts'

const TYPE_META = {
  help_devoir: {
    icon: 'solar:book-bold',
    label: 'Aide devoir',
    color: 'from-violet-500/30 to-violet-700/10',
    pill: 'border-violet-500/40 bg-violet-500/15 text-violet-200',
    accent: 'text-violet-400',
  },
  recrutement_groupe: {
    icon: 'solar:users-group-rounded-bold',
    label: 'Recrutement',
    color: 'from-emerald-500/30 to-emerald-700/10',
    pill: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200',
    accent: 'text-emerald-400',
  },
  partage: {
    icon: 'solar:share-bold',
    label: 'Partage',
    color: 'from-sky-500/30 to-sky-700/10',
    pill: 'border-sky-500/40 bg-sky-500/15 text-sky-200',
    accent: 'text-sky-400',
  },
}

function timeAgo(iso) {
  if (!iso) return ''
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return 'À l\'instant'
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

function Avatar({ name, size = 9 }) {
  const initials = name ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'U'
  const colors = ['from-brand-red/70 to-violet-600/70', 'from-emerald-500/60 to-teal-600/60', 'from-sky-500/60 to-blue-600/60', 'from-amber-500/60 to-orange-600/60']
  const colorIdx = name ? name.charCodeAt(0) % colors.length : 0
  return (
    <div
      className={`flex h-${size} w-${size} flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${colors[colorIdx]} text-xs font-bold text-white`}
    >
      {initials}
    </div>
  )
}

export default function PostFeedItem({ post }) {
  const { user } = useAuth()
  const { toggleLike, addComment, deletePost, setPostActive, deleteComment } = usePosts()

  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [likeAnimating, setLikeAnimating] = useState(false)
  const commentInputRef = useRef(null)

  const isAdmin = user?.role === 'admin'
  const userId = user?.id ? String(user.id) : ''

  const meta = TYPE_META[post.type] || TYPE_META.help_devoir

  const hasLiked = useMemo(() => {
    if (!userId) return false
    return Array.isArray(post.likes) ? post.likes.includes(userId) : false
  }, [post.likes, userId])

  const likeCount = Array.isArray(post.likes) ? post.likes.length : 0

  const targetText =
    post?.target?.devoir ? post.target.devoir : post?.target?.groupe ? post.target.groupe : ''

  const visibleComments = useMemo(() => {
    const comments = Array.isArray(post.comments) ? post.comments : []
    return comments.filter((c) => c?.isActive !== false)
  }, [post.comments])

  const handleToggleLike = () => {
    if (!userId) return
    setLikeAnimating(true)
    setTimeout(() => setLikeAnimating(false), 600)
    toggleLike(post.id, userId)
  }

  const handleOpenComment = () => {
    setShowComments(true)
    setTimeout(() => commentInputRef.current?.focus(), 80)
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    try {
      setSubmitting(true)
      addComment(post.id, {
        content: commentText,
        author: user ? { id: String(user.id), name: user.name, email: user.email, role: user.role } : null,
      })
      setCommentText('')
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeletePost = () => {
    if (!isAdmin) return
    if (!window.confirm('Supprimer ce post ?')) return
    deletePost(post.id)
  }

  const handleDeleteComment = (commentId) => {
    if (!isAdmin) return
    if (!window.confirm('Supprimer ce commentaire ?')) return
    deleteComment(post.id, commentId)
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
    >
      {/* Gradient accent band */}
      <div className={`h-1 w-full bg-gradient-to-r ${meta.color}`} />

      <div className="p-4">
        {/* Header row */}
        <div className="mb-3 flex items-start gap-3">
          <Avatar name={post.author?.name} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-white/90">{post.author?.name || 'Anonyme'}</span>
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${meta.pill}`}>
                <Icon icon={meta.icon} width={11} />
                {meta.label}
              </span>
              {post.isActive === false && (
                <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
                  Inactif
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-white/45">{timeAgo(post.createdAt)}</p>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>   {
                  setPostActive(post.id, !(post.isActive !== false))
                }
                }
                className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/60 transition hover:text-white"
                title={post.isActive === false ? 'Activer' : 'Désactiver'}
              >
                <Icon icon={post.isActive === false ? 'solar:eye-bold' : 'solar:eye-closed-bold'} width={14} />
              </button>
              <button
                type="button"
                onClick={handleDeletePost}
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs text-red-300 transition hover:bg-red-500/20"
                title="Supprimer"
              >
                <Icon icon="solar:trash-bin-trash-bold" width={14} />
              </button>
            </div>
          )}
        </div>

        {/* Target tag */}
        {targetText && (
          <div className={`mb-2 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/20 px-2.5 py-1 text-xs font-medium ${meta.accent}`}>
            <Icon icon={post?.target?.devoir ? 'solar:book-bold' : 'solar:users-group-rounded-bold'} width={12} />
            {targetText}
          </div>
        )}

        {/* Content */}
        <p className="mb-4 whitespace-pre-wrap text-sm leading-relaxed text-white/85">{post.content}</p>

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-2 border-t border-white/8 pt-3">
          {/* Like */}
          <button
            type="button"
            onClick={handleToggleLike}
            disabled={!userId}
            className={`relative inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-semibold transition ${hasLiked
                ? 'border-brand-red/50 bg-brand-red/15 text-white'
                : 'border-white/10 bg-white/5 text-white/70 hover:border-brand-red/40 hover:text-white'
              }`}
          >
            <span className={`transition-transform duration-300 ${likeAnimating ? 'scale-125' : 'scale-100'}`}>
              <Icon icon={hasLiked ? 'solar:heart-bold' : 'solar:heart-linear'} width={16} className={hasLiked ? 'text-brand-red' : ''} />
            </span>
            <span>{likeCount > 0 ? likeCount : ''} {hasLiked ? 'Aimé' : 'J\'aime'}</span>
          </button>

          {/* Comment */}
          <button
            type="button"
            onClick={handleOpenComment}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-semibold text-white/70 transition hover:border-white/20 hover:text-white"
          >
            <Icon icon="solar:chat-round-dots-bold" width={16} />
            <span>{visibleComments.length > 0 ? visibleComments.length : ''} Commenter</span>
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-semibold text-white/70 transition hover:border-white/20 hover:text-white"
          >
            <Icon icon="solar:share-bold" width={16} />
            Partager
          </button>

          {visibleComments.length > 0 && (
            <button
              type="button"
              onClick={() => setShowComments((v) => !v)}
              className="ml-auto text-xs text-white/45 transition hover:text-white/70"
            >
              {showComments ? 'Masquer' : `Voir ${visibleComments.length} commentaire${visibleComments.length > 1 ? 's' : ''}`}
            </button>
          )}
        </div>
      </div>

      {/* Comments section */}
      <AnimatePresence>
        {showComments && (
          <motion.section
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/10 bg-black/20 px-4 pt-3 pb-4"
          >
            {/* Comment input */}
            <form onSubmit={handleSubmitComment} className="mb-3 flex items-center gap-2">
              <Avatar name={user?.name} size={8} />
              <div className="relative flex-1">
                <input
                  ref={commentInputRef}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Écris un commentaire…"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 pr-12 text-sm text-white/90 outline-none transition focus:border-brand-red/50 placeholder:text-white/30"
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmitComment(e) } }}
                />
                <button
                  type="submit"
                  disabled={submitting || !commentText.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-white/40 transition hover:text-brand-red disabled:opacity-30"
                >
                  <Icon icon="solar:plain-bold" width={16} />
                </button>
              </div>
            </form>

            {/* Comments list */}
            {visibleComments.length === 0 ? (
              <p className="py-2 text-center text-xs text-white/40">Sois le premier à commenter ✨</p>
            ) : (
              <div className="space-y-2">
                {visibleComments.map((c) => (
                  <div key={c.id} className="flex items-start gap-2">
                    <Avatar name={c.author?.name} size={7} />
                    <div className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                      <div className="mb-0.5 flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-white/85">{c.author?.name || 'Anonyme'}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-white/40">{timeAgo(c.createdAt)}</span>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDeleteComment(c.id)}
                              className="text-[11px] text-red-400/70 transition hover:text-red-300"
                            >
                              <Icon icon="solar:trash-bin-trash-bold" width={12} />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="whitespace-pre-wrap text-sm text-white/80">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </motion.article>
  )
}
