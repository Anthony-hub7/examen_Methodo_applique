import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Icon } from '@iconify/react'
import { useAuth } from '../../hooks/useAuth'
import { useGroups } from '../../hooks/useGroups'
import CreateGroupModal from './CreateGroupModal'
import JoinGroupModal from './JoinGroupModal'
import MembersList from './MembersList'
import GroupeCard from './GroupeCard'
import GroupeCode from './GroupeCode'
import GroupeList from './GroupeList'
import { normalizeId } from './groupUtils'

function pushNotice(setNotifications, type, text) {
  setNotifications((prev) => [{ id: Date.now() + Math.random(), type, text }, ...prev])
}

function MembersModal({ group, membersDirectory, currentMembers, canManage, onAddMember, onRemoveMember, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-3xl rounded-2xl border border-white/10 bg-[#121212] p-6"
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-xl font-bold text-white">
            Membres de <span className="text-brand-red">{group?.name}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10"
            aria-label="Fermer"
          >
            <Icon icon="solar:close-circle-bold" width={18} />
          </button>
        </div>

        <MembersList
          membersDirectory={membersDirectory}
          currentMembers={currentMembers}
          canManage={canManage}
          onAddMember={onAddMember}
          onRemoveMember={onRemoveMember}
        />
      </motion.div>
    </motion.div>
  )
}

export default function StudentGroupManager() {
  const { user } = useAuth()
  const {
    groups,
    membersDirectory,
    groupMembersByGroup,
    memberById,
    createGroup,
    updateGroup,
    addMemberToGroup,
    removeMemberFromGroup,
    joinGroupByCode,
  } = useGroups()

  const userId = normalizeId(user?.id)

  const [viewMode, setViewMode] = useState('all')
  const [query, setQuery] = useState('')
  const [activeModal, setActiveModal] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [notifications, setNotifications] = useState([])

  const myMembershipByGroup = useMemo(() => {
    const map = new Map()

    Object.entries(groupMembersByGroup).forEach(([groupId, memberships]) => {
      const mine = memberships.find((membership) => normalizeId(membership.member_id) === userId)
      if (mine) map.set(groupId, mine)
    })

    return map
  }, [groupMembersByGroup, userId])

  const visibleGroups = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    let list = groups.filter((group) => {
      const mine = myMembershipByGroup.has(group.id)
      if (viewMode === 'mine' && !mine) return false
      if (viewMode === 'all' && group.status !== 'active' && !mine) return false

      if (!normalizedQuery) return true

      return (
        String(group.name || '').toLowerCase().includes(normalizedQuery) ||
        String(group.description || '').toLowerCase().includes(normalizedQuery)
      )
    })

    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return list
  }, [groups, myMembershipByGroup, query, viewMode])

  const openCreate = () => {
    setSelectedGroup(null)
    setFormData({ name: '', description: '' })
    setActiveModal('create')
  }

  const openEdit = (group) => {
    setSelectedGroup(group)
    setFormData({ name: group.name || '', description: group.description || '' })
    setActiveModal('edit')
  }

  const openMembers = (group) => {
    setSelectedGroup(group)
    setActiveModal('members')
  }

  const closeModal = () => {
    setActiveModal(null)
    setSelectedGroup(null)
    setFormData({ name: '', description: '' })
  }

  const handleSaveGroup = () => {
    const cleanName = formData.name.trim()
    if (!cleanName) {
      pushNotice(setNotifications, 'error', 'Le nom du groupe est requis')
      return
    }

    try {
      if (activeModal === 'create') {
        const created = createGroup({
          name: cleanName,
          description: formData.description,
          created_by: userId,
        })
        pushNotice(setNotifications, 'success', `Groupe "${created?.name || cleanName}" créé`)
      } else if (activeModal === 'edit' && selectedGroup) {
        updateGroup(selectedGroup.id, {
          name: cleanName,
          description: formData.description,
        })
        pushNotice(setNotifications, 'success', 'Groupe mis à jour')
      }
      closeModal()
    } catch (error) {
      pushNotice(setNotifications, 'error', error?.message || 'Action impossible')
    }
  }

  const joinGroup = (groupId) => {
    try {
      addMemberToGroup({ groupId, memberId: userId, roleDevoir: 'member' })
      pushNotice(setNotifications, 'success', 'Vous avez rejoint le groupe')
      return { ok: true }
    } catch (error) {
      const message = error?.message || 'Impossible de rejoindre ce groupe'
      pushNotice(setNotifications, 'error', message)
      return { ok: false, error: message }
    }
  }

  const handleJoinByCode = (code) => {
    try {
      const result = joinGroupByCode({ code, memberId: userId })
      pushNotice(setNotifications, 'success', `Groupe "${result.group.name}" rejoint`)
      return { ok: true }
    } catch (error) {
      return { ok: false, error: error?.message || 'Code invalide' }
    }
  }

  const handleAddMember = (memberId) => {
    if (!selectedGroup) return
    try {
      addMemberToGroup({ groupId: selectedGroup.id, memberId, roleDevoir: 'member' })
      pushNotice(setNotifications, 'success', 'Membre ajouté au groupe')
    } catch (error) {
      pushNotice(setNotifications, 'error', error?.message || 'Ajout impossible')
    }
  }

  const handleRemoveMember = (memberId) => {
    if (!selectedGroup) return
    try {
      removeMemberFromGroup(selectedGroup.id, memberId)
      pushNotice(setNotifications, 'success', 'Membre retiré du groupe')
    } catch (error) {
      pushNotice(setNotifications, 'error', error?.message || 'Suppression impossible')
    }
  }

  return (
    <div className="w-full flex-1 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <AnimatePresence>
          {notifications.slice(0, 3).map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-3 rounded-xl border p-3 text-sm font-medium ${
                notif.type === 'success'
                  ? 'border-green-500/30 bg-green-500/10 text-green-300'
                  : notif.type === 'error'
                    ? 'border-red-500/30 bg-red-500/10 text-red-300'
                    : 'border-blue-500/30 bg-blue-500/10 text-blue-300'
              }`}
            >
              {notif.text}
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Groupes Étudiant</h2>
            <p className="mt-1 text-sm text-white/70">
              Voir les personnes, créer un groupe, rejoindre un groupe et gérer vos membres.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-red/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-red/30"
            >
              <Icon icon="solar:add-circle-bold" width={18} />
              Créer un groupe
            </button>

            <button
              type="button"
              onClick={() => setActiveModal('join')}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-brand-red/70 hover:bg-brand-red/10"
            >
              <Icon icon="solar:link-round-bold" width={18} />
              Rejoindre par code
            </button>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-3">
          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm text-white/75">Recherche</span>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nom du groupe ou description..."
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/90 outline-none transition focus:border-brand-red/60"
            />
          </label>

          <div>
            <span className="mb-1 block text-sm text-white/75">Affichage</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setViewMode('all')}
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  viewMode === 'all'
                    ? 'border-brand-red/60 bg-brand-red/20 text-white'
                    : 'border-white/10 bg-black/20 text-white/75 hover:bg-white/10'
                }`}
              >
                Tous
              </button>
              <button
                type="button"
                onClick={() => setViewMode('mine')}
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  viewMode === 'mine'
                    ? 'border-brand-red/60 bg-brand-red/20 text-white'
                    : 'border-white/10 bg-black/20 text-white/75 hover:bg-white/10'
                }`}
              >
                Mes groupes
              </button>
            </div>
          </div>
        </div>

        <GroupeList
          groups={visibleGroups}
          emptyMessage="Aucun groupe disponible"
          renderGroup={(group) => {
            const memberships = groupMembersByGroup[group.id] || []
            const creator = memberById.get(normalizeId(group.created_by))
            const myMembership = myMembershipByGroup.get(group.id)
            const isMember = Boolean(myMembership)
            const canManage = isMember && (myMembership?.role_devoir === 'admin' || normalizeId(group.created_by) === userId)

            return (
              <GroupeCard
                key={group.id}
                group={group}
                memberCount={memberships.length}
                creatorName={creator?.name}
                showStatus={group.status !== 'active'}
                codeSlot={<GroupeCode code={group.code_invitation} />}
                actionSlot={
                  <>
                    <button
                      type="button"
                      onClick={() => openMembers(group)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10"
                    >
                      <Icon icon="solar:users-group-rounded-linear" width={14} />
                      Voir membres
                    </button>

                    {!isMember && group.status === 'active' ? (
                      <button
                        type="button"
                        onClick={() => joinGroup(group.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs font-medium text-green-300 transition hover:bg-green-500/20"
                      >
                        <Icon icon="solar:login-2-bold" width={14} />
                        Rejoindre
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-white/70">
                        <Icon icon="solar:check-read-bold" width={14} />
                        {isMember ? 'Membre' : 'Fermé'}
                      </span>
                    )}

                    {canManage ? (
                      <button
                        type="button"
                        onClick={() => openEdit(group)}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10"
                      >
                        <Icon icon="solar:pen-2-linear" width={14} />
                        Éditer
                      </button>
                    ) : null}
                  </>
                }
              />
            )
          }}
        />

        <AnimatePresence>
          {activeModal === 'create' || activeModal === 'edit' ? (
            <CreateGroupModal
              mode={activeModal}
              formData={formData}
              onFormChange={setFormData}
              onSave={handleSaveGroup}
              onClose={closeModal}
            />
          ) : null}

          {activeModal === 'join' ? (
            <JoinGroupModal
              onJoin={handleJoinByCode}
              onClose={closeModal}
            />
          ) : null}

          {activeModal === 'members' && selectedGroup ? (
            <MembersModal
              group={selectedGroup}
              membersDirectory={membersDirectory}
              currentMembers={groupMembersByGroup[selectedGroup.id] || []}
              canManage={Boolean(
                myMembershipByGroup.get(selectedGroup.id)?.role_devoir === 'admin' ||
                  normalizeId(selectedGroup.created_by) === userId,
              )}
              onAddMember={handleAddMember}
              onRemoveMember={handleRemoveMember}
              onClose={closeModal}
            />
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}
