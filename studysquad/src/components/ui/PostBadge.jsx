const TYPE_LABELS = {
  help_devoir: 'Aide devoir',
  recrutement_groupe: 'Recrutement groupe',
}

export default function PostBadge({ type }) {
  const label = TYPE_LABELS[type] || 'Post'

  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-semibold text-white/90">
      {label}
    </span>
  )
}

