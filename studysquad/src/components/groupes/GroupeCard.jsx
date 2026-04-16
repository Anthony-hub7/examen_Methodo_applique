import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'
import { formatDateFR, getStatusLabel } from './groupUtils'

export default function GroupeCard({
  group,
  memberCount,
  creatorName,
  showStatus = true,
  codeSlot = null,
  actionSlot = null,
}) {
  const statusInfo = getStatusLabel(group.status)

  return (
    <motion.div
      layout
      className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/10"
    >
      <div className="mb-1 flex items-center gap-2">
        <h3 className="text-lg font-semibold text-white">{group.name}</h3>
        {showStatus ? (
          <span
            className={`inline-block rounded-full border px-2 py-1 text-xs font-semibold ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}
          >
            {statusInfo.label}
          </span>
        ) : null}
      </div>

      <p className="mb-2 text-sm text-white/70">{group.description || '—'}</p>

      <div className="mb-3 flex flex-wrap gap-3 text-xs text-white/60">
        <span className="flex items-center gap-1">
          <Icon icon="solar:users-group-rounded-linear" width={14} />
          {memberCount} membre{memberCount !== 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-1">
          <Icon icon="solar:calendar-linear" width={14} />
          {formatDateFR(group.created_at)}
        </span>
        <span className="flex items-center gap-1">
          <Icon icon="solar:user-bold" width={14} />
          {creatorName || '—'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {codeSlot}
        {actionSlot}
      </div>
    </motion.div>
  )
}
