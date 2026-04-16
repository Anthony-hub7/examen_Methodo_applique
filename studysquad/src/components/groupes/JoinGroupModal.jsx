import { useState } from 'react'
import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'

export default function JoinGroupModal({ onJoin, onClose }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const handleJoin = () => {
    const cleanCode = code.trim()
    if (!cleanCode) {
      setError('Entrez un code d\'invitation valide.')
      return
    }

    const result = onJoin(cleanCode)
    if (result?.ok) {
      onClose()
      return
    }

    setError(result?.error || 'Impossible de rejoindre ce groupe.')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121212] p-6"
      >
        <div className="mb-4 flex items-center gap-2">
          <Icon icon="solar:link-round-bold" width={20} className="text-brand-red" />
          <h2 className="text-xl font-bold text-white">Rejoindre un groupe</h2>
        </div>

        <p className="mb-3 text-sm text-white/70">
          Entrez le code d'invitation partagé par votre groupe.
        </p>

        <input
          type="text"
          value={code}
          onChange={(event) => {
            setCode(event.target.value.toUpperCase())
            if (error) setError('')
          }}
          placeholder="Ex: SQ-4T7H"
          className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm tracking-wider text-white/90 outline-none transition focus:border-brand-red/60"
        />

        {error ? (
          <div className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/10 px-4 py-2 font-medium text-white/70 transition hover:bg-white/5"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleJoin}
            className="flex-1 rounded-xl bg-brand-red/20 px-4 py-2 font-medium text-white transition hover:bg-brand-red/30"
          >
            Rejoindre
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
