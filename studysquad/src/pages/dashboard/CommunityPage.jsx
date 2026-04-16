import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import PostComposer from '../../components/posts/PostComposer'
import PostFeedItem from '../../components/posts/PostFeedItem'
import { useAuth } from '../../hooks/useAuth'
import { usePosts } from '../../hooks/usePosts'

export default function CommunityPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { posts, loading, error, includeInactive, refresh } = usePosts()
  const [showInactive, setShowInactive] = useState(false)

  const isAdmin = user?.role === 'admin'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  useEffect(() => {
    refresh({ includeInactive: isAdmin ? showInactive : false })
  }, [isAdmin, refresh, showInactive])

  const visiblePosts = useMemo(() => {
    // Le service filtre déjà côté includeInactive. Ici on garde juste une sécurité.
    return isAdmin && showInactive ? posts : posts.filter((p) => p.isActive !== false)
  }, [isAdmin, posts, showInactive])

  return (
    <DashboardLayout
      userName={`${user?.name} (${user?.role || 'user'})`}
      roleLabel={isAdmin ? 'Dashboard Admin' : 'Dashboard Etudiant'}
      onLogout={handleLogout}
    >
      <div className="mx-auto w-full max-w-4xl p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white/95">Fil d&apos;actualité</h1>
            <p className="text-sm text-white/60">Likes, commentaires et modération (mock).</p>
          </div>

          {isAdmin ? (
            <div className="flex items-center gap-2">
              <label className="text-sm text-white/70">Voir inactifs</label>
              <button
                type="button"
                onClick={() => setShowInactive((v) => !v)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90"
                aria-pressed={showInactive}
              >
                {showInactive ? 'Oui' : 'Non'}
              </button>
            </div>
          ) : null}
        </div>

        <div className="mb-4">
          <PostComposer onCreated={() => refresh({ includeInactive })} />
        </div>

        {error ? <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div> : null}

        {loading ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">Chargement...</div>
        ) : (
          <div className="space-y-4">
            {visiblePosts.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                Aucun post pour le moment.
              </div>
            ) : (
              visiblePosts.map((post) => <PostFeedItem key={post.id} post={post} />)
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
