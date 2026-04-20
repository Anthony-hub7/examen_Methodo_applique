import { Icon } from '@iconify/react'

export default function GroupeList({ groups, emptyMessage = 'Aucun groupe trouvé', renderGroup }) {
  if (!groups.length) {
    return (
      <div className="dashboard-panel p-8 text-center">
        <Icon icon="solar:folder-open-linear" width={40} className="mx-auto mb-2 text-white/50" />
        <p className="text-white/70">{emptyMessage}</p>
      </div>
    )
  }

  return <div className="space-y-3">{groups.map((group) => renderGroup(group))}</div>
}
