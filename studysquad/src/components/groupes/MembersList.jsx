import { useMemo } from 'react'
import { Icon } from '@iconify/react'
import { normalizeId } from './groupUtils'

export default function MembersList({
  membersDirectory,
  currentMembers,
  canManage = false,
  onAddMember,
  onRemoveMember,
}) {
  const memberById = useMemo(
    () => new Map(membersDirectory.map((member) => [normalizeId(member.id), member])),
    [membersDirectory],
  )

  const memberIds = useMemo(
    () => new Set(currentMembers.map((membership) => normalizeId(membership.member_id))),
    [currentMembers],
  )

  const availableMembers = useMemo(
    () =>
      membersDirectory.filter((member) => {
        if (member.role !== 'student') return false
        return !memberIds.has(normalizeId(member.id))
      }),
    [memberIds, membersDirectory],
  )

  const currentEntries = currentMembers.map((membership) => ({
    membership,
    member: memberById.get(normalizeId(membership.member_id)),
  }))

  return (
    <div className={`grid gap-4 ${canManage ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
      <div>
        <h3 className="mb-2 text-sm font-semibold text-green-300">Membres du groupe</h3>
        <div className="space-y-2 rounded-xl border border-green-500/20 bg-green-500/5 p-3">
          {currentEntries.length === 0 ? (
            <p className="text-xs text-white/55">Aucun membre pour le moment.</p>
          ) : (
            currentEntries.map(({ membership, member }) => (
              <div key={membership.id} className="flex items-center justify-between rounded-lg bg-black/30 p-2 text-xs">
                <div>
                  <div className="font-medium text-white">{member?.name || membership.member_id}</div>
                  <div className="text-white/55">{member?.email || 'Email non disponible'}</div>
                  <div className="text-[11px] text-white/45">Rôle: {membership.role_devoir || 'member'}</div>
                </div>
                {canManage ? (
                  <button
                    type="button"
                    onClick={() => onRemoveMember?.(membership.member_id)}
                    className="rounded-lg border border-red-500/30 bg-red-500/10 p-1 text-red-300 transition hover:bg-red-500/20"
                    title="Retirer du groupe"
                  >
                    <Icon icon="solar:trash-bin-2-linear" width={14} />
                  </button>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>

      {canManage ? (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-blue-300">Personnes disponibles</h3>
          <div className="space-y-2 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
            {availableMembers.length === 0 ? (
              <p className="text-xs text-white/55">Tout le monde est déjà ajouté.</p>
            ) : (
              availableMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between rounded-lg bg-black/30 p-2 text-xs">
                  <div>
                    <div className="font-medium text-white">{member.name}</div>
                    <div className="text-white/55">{member.email}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onAddMember?.(member.id)}
                    className="rounded-lg border border-green-500/30 bg-green-500/10 p-1 text-green-300 transition hover:bg-green-500/20"
                    title="Ajouter au groupe"
                  >
                    <Icon icon="solar:add-circle-linear" width={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
