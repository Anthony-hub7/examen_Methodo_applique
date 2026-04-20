import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Icon } from '@iconify/react'
import { useAuth } from '../../hooks/useAuth'
import { useGroups } from '../../hooks/useGroups'
import CreateGroupModal from './CreateGroupModal'
import MembersList from './MembersList'
import GroupeCard from './GroupeCard'
import GroupeCode from './GroupeCode'
import GroupeList from './GroupeList'
import { normalizeId } from './groupUtils'

function pushNotice(setNotifications, type, text) {
  setNotifications((prev) => [{ id: Date.now() + Math.random(), type, text }, ...prev])
}

function MembersModal({ group, membersDirectory, currentMembers, onAddMember, onRemoveMember, onClose }) {
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
          canManage
          onAddMember={onAddMember}
          onRemoveMember={onRemoveMember}
        />
      </motion.div>
    </motion.div>
  )
}

export default function AdminGroupManager() {
  const { user } = useAuth()
  const {
    groups,
    membersDirectory,
    groupMembersByGroup,
    memberById,
    createGroup,
    updateGroup,
    deleteGroup,
    archiveGroup,
    disableGroup,
    activateGroup,
    renewInvitationCode,
    addMemberToGroup,
    removeMemberFromGroup,
  } = useGroups()

  const [filterStatus, setFilterStatus] = useState('active')
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('created_at')

  const [activeModal, setActiveModal] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [notifications, setNotifications] = useState([])

  const filteredGroups = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    const list = groups.filter((group) => {
      if (filterStatus !== 'tous' && group.status !== filterStatus) return false
      if (!normalizedQuery) return true
      return (
        String(group.name || '').toLowerCase().includes(normalizedQuery) ||
        String(group.description || '').toLowerCase().includes(normalizedQuery)
      )
    })

    list.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'member_count') return Number(b.member_count || 0) - Number(a.member_count || 0)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return list
  }, [filterStatus, groups, query, sortBy])

  const openCreate = () => {
    setFormData({ name: '', description: '' })
    setSelectedGroup(null)
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
          created_by: normalizeId(user?.id),
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

  const handleDeleteGroup = (groupId) => {
    const ok = window.confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')
    if (!ok) return

    try {
      deleteGroup(groupId)
      pushNotice(setNotifications, 'success', 'Groupe supprimé')
    } catch (error) {
      pushNotice(setNotifications, 'error', error?.message || 'Suppression impossible')
    }
  }

  const runAction = (action, message) => {
    try {
      action()
      pushNotice(setNotifications, 'success', message)
    } catch (error) {
      pushNotice(setNotifications, 'error', error?.message || 'Action impossible')
    }
  }

  const handleAddMember = (memberId) => {
    if (!selectedGroup) return
    runAction(
      () => addMemberToGroup({ groupId: selectedGroup.id, memberId, roleDevoir: 'member' }),
      'Membre ajouté au groupe',
    )
  }

  const handleRemoveMember = (memberId) => {
    if (!selectedGroup) return
    runAction(() => removeMemberFromGroup(selectedGroup.id, memberId), 'Membre retiré du groupe')
  }

  return (
    <div className="dashboard-page-shell">
      <div className="dashboard-page-content">
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
            <h2 className="text-xl font-bold tracking-tight">Gestion des Groupes (Admin)</h2>
            <p className="mt-1 text-sm text-white/70">
              Créer, modifier, supprimer des groupes et gérer les membres.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-red/40 bg-brand-red/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-red/25"
          >
            <Icon icon="solar:add-circle-bold" width={18} />
            Créer un groupe
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <aside className="dashboard-panel p-4">
            <h3 className="mb-3 text-base font-semibold">Filtres</h3>
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-sm text-white/75">Recherche</span>
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Nom du groupe..."
                  className="dashboard-input w-full px-3 py-2 text-sm text-white/90"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm text-white/75">Statut</span>
                <select
                  value={filterStatus}
                  onChange={(event) => setFilterStatus(event.target.value)}
                  className="dashboard-input w-full px-3 py-2 text-sm text-white/90"
                >
                  <option value="tous">Tous</option>
                  <option value="active">Actifs</option>
                  <option value="disabled">Désactivés</option>
                  <option value="archived">Archivés</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-sm text-white/75">Trier par</span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="dashboard-input w-full px-3 py-2 text-sm text-white/90"
                >
                  <option value="created_at">Plus récent</option>
                  <option value="name">Nom A-Z</option>
                  <option value="member_count">Nombre de membres</option>
                </select>
              </label>

              <div className="dashboard-subpanel p-3 text-center text-sm">
                <div className="text-white/70">Total</div>
                <div className="text-2xl font-bold text-white">{filteredGroups.length}</div>
              </div>
            </div>
          </aside>

          <section className="lg:col-span-3">
            <GroupeList
              groups={filteredGroups}
              emptyMessage="Aucun groupe trouvé"
              renderGroup={(group) => {
                const currentMembers = groupMembersByGroup[group.id] || []
                const creator = memberById.get(normalizeId(group.created_by))

                return (
                  <GroupeCard
                    key={group.id}
                    group={group}
                    memberCount={currentMembers.length}
                    creatorName={creator?.name}
                    showStatus
                    codeSlot={
                      <GroupeCode
                        code={group.code_invitation}
                        canRenew
                        onRenew={() =>
                          runAction(
                            () => renewInvitationCode(group.id),
                            'Code d\'invitation renouvelé',
                          )
                        }
                      />
                    }
                    actionSlot={
                      <>
                        <button
                          type="button"
                          onClick={() => openMembers(group)}
                          className="dashboard-button-ghost inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-white/80"
                        >
                          <Icon icon="solar:users-group-rounded-linear" width={14} />
                          Membres
                        </button>

                        <button
                          type="button"
                          onClick={() => openEdit(group)}
                          className="dashboard-button-ghost inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-white/80"
                        >
                          <Icon icon="solar:pen-2-linear" width={14} />
                          Éditer
                        </button>

                        {group.status === 'active' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => runAction(() => disableGroup(group.id), 'Groupe désactivé')}
                              className="inline-flex items-center gap-1 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs font-medium text-yellow-300 transition hover:bg-yellow-500/20"
                            >
                              <Icon icon="solar:eye-closed-linear" width={14} />
                              Désactiver
                            </button>
                            <button
                              type="button"
                              onClick={() => runAction(() => archiveGroup(group.id), 'Groupe archivé')}
                              className="inline-flex items-center gap-1 rounded-lg border border-gray-500/30 bg-gray-500/10 px-3 py-2 text-xs font-medium text-gray-300 transition hover:bg-gray-500/20"
                            >
                              <Icon icon="solar:archive-linear" width={14} />
                              Archiver
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => runAction(() => activateGroup(group.id), 'Groupe activé')}
                            className="inline-flex items-center gap-1 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs font-medium text-green-300 transition hover:bg-green-500/20"
                          >
                            <Icon icon="solar:eye-linear" width={14} />
                            Activer
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteGroup(group.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/20"
                        >
                          <Icon icon="solar:trash-bin-2-linear" width={14} />
                          Supprimer
                        </button>
                      </>
                    }
                  />
                )
              }}
            />
          </section>
        </div>

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

          {activeModal === 'members' && selectedGroup ? (
            <MembersModal
              group={selectedGroup}
              membersDirectory={membersDirectory}
              currentMembers={groupMembersByGroup[selectedGroup.id] || []}
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
