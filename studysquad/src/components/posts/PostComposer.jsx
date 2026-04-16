import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usePosts } from '../../hooks/usePosts'

const TYPE_OPTIONS = [
  { value: 'help_devoir', label: 'Aide devoir' },
  { value: 'recrutement_groupe', label: 'Recrutement groupe' },
]

export default function PostComposer({ onCreated, compact }) {
  const { user } = useAuth()
  const { createPost } = usePosts()

  const [type, setType] = useState('help_devoir')
  const [targetText, setTargetText] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const placeholder =
    type === 'help_devoir' ? 'Ex: Devoir de Maths - Exercice 3' : 'Ex: Groupe - Devoir à finaliser'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      setLoading(true)
      const created = createPost({
        type,
        content,
        targetText,
        author: user ? { id: user.id, name: user.name, email: user.email, role: user.role } : null,
      })
      setContent('')
      setTargetText('')
      setType('help_devoir')
      onCreated?.(created)
    } catch (err) {
      setError(err?.message || 'Impossible de publier.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? '' : 'rounded-xl border border-white/10 bg-white/5 p-3'}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-white/90">Nouveau post</div>
      </div>

      <label className="mb-1 block text-xs text-white/60">Type</label>
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="mb-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/90"
      >
        {TYPE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <label className="mb-1 block text-xs text-white/60">{type === 'help_devoir' ? 'Devoir' : 'Groupe'}</label>
      <input
        value={targetText}
        onChange={(e) => setTargetText(e.target.value)}
        placeholder={placeholder}
        className="mb-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/90"
      />

      <label className="mb-1 block text-xs text-white/60">Message</label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Ecris ta demande..."
        className="mb-2 min-h-[90px] w-full resize-none rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/90"
        required
      />

      {error ? <div className="mb-2 text-xs text-red-400">{error}</div> : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-brand-red px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? 'Publication...' : 'Publier'}
      </button>
    </form>
  )
}
