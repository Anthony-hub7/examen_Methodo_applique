import { motion } from 'framer-motion'

export default function CreateGroupModal({
  mode = 'create',
  formData,
  onFormChange,
  onSave,
  onClose,
}) {
  const title = mode === 'edit' ? 'Modifier le groupe' : 'Créer un groupe'
  const submitLabel = mode === 'edit' ? 'Mettre à jour' : 'Créer'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#121212] p-6"
      >
        <h2 className="mb-4 text-xl font-bold text-white">{title}</h2>

        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-white/80">Nom du groupe</span>
            <input
              type="text"
              value={formData.name}
              onChange={(event) => onFormChange({ ...formData, name: event.target.value })}
              placeholder="Ex: Math Nebula"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white/90 outline-none transition focus:border-brand-red/60"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-white/80">Description</span>
            <textarea
              value={formData.description}
              onChange={(event) => onFormChange({ ...formData, description: event.target.value })}
              placeholder="Décrivez le groupe..."
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white/90 outline-none transition focus:border-brand-red/60"
            />
          </label>
        </div>

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
            onClick={onSave}
            className="flex-1 rounded-xl bg-brand-red/20 px-4 py-2 font-medium text-white transition hover:bg-brand-red/30"
          >
            {submitLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
