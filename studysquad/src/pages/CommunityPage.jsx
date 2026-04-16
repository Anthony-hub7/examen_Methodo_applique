import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'
import DashboardLayout from '../components/layout/DashboardLayout'
import PostComposer from '../components/posts/PostComposer'
import PostFeedItem from '../components/posts/PostFeedItem'
import { useAuth } from '../hooks/useAuth'
import { usePosts } from '../hooks/usePosts'
import dataAdmin from '../services/dataAdmin.json'

const groups = dataAdmin?.adminDevoirs?.groups || []
const devoirs = dataAdmin?.adminDevoirs?.devoirs || []

const TYPE_FILTERS = [
  { value: 'all', label: 'Tout', icon: 'solar:home-2-bold' },
  { value: 'help_devoir', label: 'Aide devoir', icon: 'solar:book-bold' },
  { value: 'recrutement_groupe', label: 'Recrutement', icon: 'solar:users-group-rounded-bold' },
  { value: 'partage', label: 'Partages', icon: 'solar:share-bold' },
]

export default function CommunityPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { posts, loading, error, includeInactive, refresh } = usePosts()

  const [showInactive, setShowInactive] = useState(false)
  const [typeFilter, setTypeFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const isAdmin = user?.role === 'admin'

  const handleLogout = () => { logout(); navigate('/') }

  useEffect(() => {
    refresh({ includeInactive: isAdmin ? showInactive : false })
  }, [isAdmin, refresh, showInactive])

  const visiblePosts = useMemo(() => {
    let list = isAdmin && showInactive ? posts : posts.filter((p) => p.isActive !== false)
    if (typeFilter !== 'all') list = list.filter((p) => p.type === typeFilter)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter((p) =>
        p.content?.toLowerCase().includes(q) ||
        p.author?.name?.toLowerCase().includes(q) ||
        p.target?.devoir?.toLowerCase().includes(q) ||
        p.target?.groupe?.toLowerCase().includes(q)
      )
    }
    return list
  }, [isAdmin, posts, showInactive, typeFilter, searchQuery])

  const stats = useMemo(() => {
    const active = posts.filter((p) => p.isActive !== false)
    const totalLikes = active.reduce((acc, p) => acc + (p.likes?.length || 0), 0)
    const totalComments = active.reduce((acc, p) => acc + (p.comments?.filter((c) => c.isActive !== false).length || 0), 0)
    return { posts: active.length, likes: totalLikes, comments: totalComments }
  }, [posts])

  const initials = user?.name ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'U'

  return (
    <DashboardLayout
      userName={`${user?.name} (${user?.role || 'user'})`}
      roleLabel={isAdmin ? 'Dashboard Admin' : 'Dashboard Étudiant'}
      userRole={user?.role}
      onLogout={handleLogout}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-white/95">Communauté</h1>
          <p className="mt-1 text-sm text-white/50">Entraide, recrutement et partages entre étudiants</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
          {/* ── Main feed ── */}
          <div className="min-w-0 space-y-4">
            {/* Composer */}
            <PostComposer onCreated={() => refresh({ includeInactive })} />

            {/* Filters bar */}
            <div className="flex flex-wrap items-center gap-2">
              {TYPE_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setTypeFilter(f.value)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${typeFilter === f.value
                      ? 'border-brand-red/60 bg-brand-red/15 text-white'
                      : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white/90'
                    }`}
                >
                  <Icon icon={f.icon} width={13} />
                  {f.label}
                </button>
              ))}

              {/* Search */}
              <div className="relative ml-auto">
                <Icon icon="solar:magnifer-bold" width={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher…"
                  className="rounded-xl border border-white/10 bg-white/5 py-1.5 pl-8 pr-3 text-xs text-white/80 outline-none transition focus:border-brand-red/50 placeholder:text-white/30"
                />
              </div>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setShowInactive((v) => !v)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${showInactive ? 'border-amber-400/50 bg-amber-400/10 text-amber-200' : 'border-white/10 bg-white/5 text-white/60'
                    }`}
                >
                  <Icon icon="solar:eye-bold" width={13} />
                  Voir inactifs
                </button>
              )}
            </div>

            {/* Feed */}
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>
            )}

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-36 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
                ))}
              </div>
            ) : visiblePosts.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 py-14 text-center">
                <Icon icon="solar:chat-round-dots-linear" width={40} className="text-white/20" />
                <p className="text-sm text-white/50">Aucun post pour le moment.</p>
                <p className="text-xs text-white/30">Soit le premier à publier ✨</p>
              </div>
            ) : (
              <div className="space-y-4">
                {visiblePosts.map((post) => (
                  <PostFeedItem key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>

          {/* ── Right sidebar ── */}
          <aside className="space-y-5">
            {/* User card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-red/70 to-violet-600/70 text-sm font-bold text-white">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/90">{user?.name}</p>
                  <p className="text-xs text-white/45 capitalize">{user?.role || 'Étudiant'}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 divide-x divide-white/10 rounded-xl border border-white/10 bg-black/20">
                {[
                  { label: 'Posts', value: stats.posts },
                  { label: 'Likes', value: stats.likes },
                  { label: 'Comm.', value: stats.comments },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col items-center py-3">
                    <span className="text-base font-bold text-white/90">{s.value}</span>
                    <span className="text-[11px] text-white/45">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Groupes */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/90">
                <Icon icon="solar:users-group-rounded-bold" width={16} className="text-emerald-400" />
                Groupes actifs
              </h3>
              <div className="space-y-2">
                {groups.map((g) => (
                  <motion.div
                    key={g.id}
                    whileHover={{ x: 2 }}
                    className="flex items-center gap-3 rounded-xl border border-white/8 bg-black/20 px-3 py-2"
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                      <Icon icon="solar:users-group-rounded-bold" width={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-white/85">{g.name}</p>
                      <p className="truncate text-[11px] text-white/45">{g.description}</p>
                    </div>
                    <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] text-emerald-300">
                      {g.code_invitation}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Devoirs en cours */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/90">
                <Icon icon="solar:book-bold" width={16} className="text-violet-400" />
                Devoirs récents
              </h3>
              <div className="space-y-2">
                {devoirs.slice(0, 4).map((d) => {
                  const isPast = d.deadline && new Date(d.deadline) < new Date()
                  const isDone = d.etat === 'termine'
                  return (
                    <div
                      key={d.id}
                      className="flex items-start gap-2 rounded-xl border border-white/8 bg-black/20 px-3 py-2"
                    >
                      <div
                        className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${isDone ? 'bg-green-400' : isPast ? 'bg-brand-red' : 'bg-amber-400'
                          }`}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-white/85">{d.titre}</p>
                        <p className="text-[11px] text-white/45">
                          {d.deadline
                            ? new Date(d.deadline).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
                            : '—'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  )
}
