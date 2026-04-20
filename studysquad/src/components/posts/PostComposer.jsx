import { useState } from 'react'
import { Icon } from '@iconify/react'
import { useAuth } from '../../hooks/useAuth'
import { usePosts } from '../../hooks/usePosts'
import dataAdmin from '../../services/dataAdmin.json'

const TYPE_OPTIONS = [
  { value: 'help_devoir', label: 'Aide devoir', icon: 'solar:book-bold', color: 'text-violet-400' },
  { value: 'recrutement_groupe', label: 'Recrutement groupe', icon: 'solar:users-group-rounded-bold', color: 'text-emerald-400' },
  { value: 'partage', label: 'Partage / Ressource', icon: 'solar:share-bold', color: 'text-sky-400' },
]

const groups = dataAdmin?.adminDevoirs?.groups || []
const devoirs = dataAdmin?.adminDevoirs?.devoirs || []

export default function PostComposer({ onCreated }) {
  const { user } = useAuth()
  const { createPost } = usePosts()

  const [open, setOpen] = useState(false)
  const [type, setType] = useState('help_devoir')
  const [content, setContent] = useState('')
  const [selectedDevoir, setSelectedDevoir] = useState('')
  const [selectedGroupe, setSelectedGroupe] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const activeType = TYPE_OPTIONS.find((t) => t.value === type) || TYPE_OPTIONS[0]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!content.trim()) { setError('Le message est requis.'); return }

    const targetText =
      type === 'help_devoir'
        ? devoirs.find((d) => d.id === selectedDevoir)?.titre || selectedDevoir || ''
        : type === 'recrutement_groupe'
          ? groups.find((g) => g.id === selectedGroupe)?.name || selectedGroupe || ''
          : ''

    try {
      setLoading(true)
      const created = createPost({
        type,
        content,
        targetText,
        targetId: type === 'help_devoir' ? selectedDevoir : type === 'recrutement_groupe' ? selectedGroupe : null,
        author: user ? { id: String(user.id), name: user.name, email: user.email, role: user.role } : null,
      })
      setContent('')
      setSelectedDevoir('')
      setSelectedGroupe('')
      setType('help_devoir')
      setOpen(false)
      onCreated?.(created)
    } catch (err) {
      setError(err?.message || 'Impossible de publier.')
    } finally {
      setLoading(false)
    }
  }

  const initials = user?.name ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'U'

  return (
    <div className="dashboard-panel overflow-hidden">
      {/* Collapsed trigger */}
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-white/5"
        >
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-red/70 to-violet-600/70 text-sm font-bold text-white">
            {initials}
          </div>
          <span className="dashboard-subpanel flex-1 px-4 py-2.5 text-sm text-white/40">
            Quoi de neuf, {user?.name?.split(' ')[0] || 'étudiant'} ? Partage quelque chose…
          </span>
          <div className="flex items-center gap-2">
            <Icon icon="solar:camera-add-bold" width={20} className="text-white/40" />
          </div>
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="p-4">
          {/* Header */}
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-red/70 to-violet-600/70 text-sm font-bold text-white">
              {initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-white/90">{user?.name || 'Moi'}</p>
              <p className="text-xs text-white/50">{user?.role || 'Étudiant'}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="dashboard-button-ghost ml-auto rounded-lg p-1.5 text-white/60 hover:text-white"
            >
              <Icon icon="solar:close-circle-bold" width={18} />
            </button>
          </div>

          {/* Type selector */}
          <div className="mb-3 flex gap-2">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setType(opt.value)
                }}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${type === opt.value
                    ? 'border-brand-red/60 bg-brand-red/15 text-white'
                    : 'dashboard-button-ghost text-white/60 hover:text-white/80'
                  }`}
              >
                <Icon icon={opt.icon} width={14} className={type === opt.value ? 'text-brand-red' : opt.color} />
                {opt.label}
              </button>
            ))}
          </div>

          {/* Target selector */}
          {type === 'help_devoir' && (
            <div className="mb-3">
              <label className="mb-1 block text-xs text-white/60">
                <Icon icon="solar:book-bold" width={12} className="mr-1 inline text-violet-400" />
                Devoir concerné
              </label>
              <select
                value={selectedDevoir}
                onChange={(e) => setSelectedDevoir(e.target.value)}
                className="dashboard-input w-full px-3 py-2 text-sm text-white/90 focus:border-violet-500/60"
              >
                <option value="">— Aucun devoir spécifique —</option>
                {devoirs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.titre}
                  </option>
                ))}
              </select>
            </div>
          )}

          {type === 'recrutement_groupe' && (
            <div className="mb-3">
              <label className="mb-1 block text-xs text-white/60">
                <Icon icon="solar:users-group-rounded-bold" width={12} className="mr-1 inline text-emerald-400" />
                Groupe concerné
              </label>
              <select
                value={selectedGroupe}
                onChange={(e) => setSelectedGroupe(e.target.value)}
                className="dashboard-input w-full px-3 py-2 text-sm text-white/90 focus:border-emerald-500/60"
              >
                <option value="">— Aucun groupe spécifique —</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} — {g.description}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Message */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              type === 'help_devoir'
                ? '💡 Décris ton problème, où tu bloques…'
                : type === 'recrutement_groupe'
                  ? '👥 Présente ton groupe, ce que vous cherchez…'
                  : '📎 Partage une ressource, un lien, une astuce…'
            }
            className="dashboard-input min-h-[110px] w-full resize-none px-4 py-3 text-sm text-white/90 placeholder:text-white/30"
            required
            autoFocus
          />

          {error ? (
            <p className="mt-2 text-xs text-red-400">{error}</p>
          ) : null}

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-white/40">
              <Icon icon="solar:emoji-funny-bold-duotone" width={20} className="cursor-pointer transition hover:text-white/70" />
              <Icon icon="solar:gallery-add-bold" width={20} className="cursor-pointer transition hover:text-white/70" />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setOpen(false); setContent(''); setError('') }}
                className="dashboard-button-ghost px-4 py-2 text-sm font-semibold text-white/70 hover:text-white"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || !content.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-red px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
              >
                <Icon icon="solar:plain-bold" width={16} />
                {loading ? 'Publication…' : 'Publier'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Quick action pills (visible when collapsed) */}
      {!open && (
        <div className="flex items-center gap-1 border-t border-white/10 px-4 py-2">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { setType(opt.value); setOpen(true) }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold text-white/60 transition hover:bg-white/5 hover:text-white/90"
            >
              <Icon icon={opt.icon} width={16} className={opt.color} />
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
