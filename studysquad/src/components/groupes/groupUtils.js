export function formatDateFR(iso) {
  if (!iso) return '—'
  const date = new Date(iso)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

export function getStatusLabel(status) {
  const map = {
    active: {
      label: 'Actif',
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
    },
    disabled: {
      label: 'Désactivé',
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
    },
    archived: {
      label: 'Archivé',
      color: 'text-gray-400',
      bg: 'bg-gray-500/10',
      border: 'border-gray-500/30',
    },
  }

  return map[status] || map.active
}

export function normalizeId(value) {
  return String(value ?? '')
}
