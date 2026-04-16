import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'
import { groupService } from '../../services/groupService'

const mockMembers = [
  {
    id: '7d8d2f8a-3b44-4e5f-a4c2-5a1c3f9d2b10',
    name: 'Amina Diallo',
    email: 'amina@example.com',
    role: 'student',
    niveau_etude: 'Lycée',
    created_at: '2026-02-05T10:00:00.000Z',
  },
  {
    id: '0f3b6b6c-2b12-4f6f-bd8a-e1c1b2d3c4a5',
    name: 'Mehdi Rahman',
    email: 'mehdi@example.com',
    role: 'student',
    niveau_etude: 'Université',
    created_at: '2026-02-15T10:00:00.000Z',
  },
  {
    id: 'c8a1c9f1-1e2a-4c7b-9a3f-1a2b3c4d5e6f',
    name: 'Sarah N.',
    email: 'sarah@example.com',
    role: 'student',
    niveau_etude: 'Licence',
    created_at: '2026-02-25T10:00:00.000Z',
  },
  {
    id: 'f1e2d3c4-b5a6-4c7d-8e9f-0a1b2c3d4e5f',
    name: 'Lucas Petit',
    email: 'lucas@example.com',
    role: 'student',
    niveau_etude: 'Master',
    created_at: '2026-03-01T10:00:00.000Z',
  },
  {
    id: '9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d',
    name: 'Emma Martin',
    email: 'emma@example.com',
    role: 'student',
    niveau_etude: 'Lycée',
    created_at: '2026-03-05T10:00:00.000Z',
  },
]

function formatDateFR(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: '2-digit' })
}

function getStatusLabel(status) {
  const map = {
    active: { label: 'Actif', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
    disabled: { label: 'Désactivé', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
    archived: { label: 'Archivé', color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30' },
  }
  return map[status] || map.active
}

export default function AdminGroupManager() {
  const [groups, setGroups] = useState(() => groupService.getAllGroups())
  const [members] = useState(mockMembers)
  const [groupMembers, setGroupMembers] = useState(() => {
    const result = {}
    groups.forEach((g) => {
      result[g.id] = groupService.getGroupMembers(g.id)
    })
    return result
  })

  const [filterStatus, setFilterStatus] = useState('active') // active | disabled | archived | tous
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('created_at') // created_at | name | member_count

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create') // create | edit | members
  const [editingGroup, setEditingGroup] = useState(null)
  const [viewingGroupMembers, setViewingGroupMembers] = useState(null)

  const [formData, setFormData] = useState({ name: '', description: '' })
  const [notifications, setNotifications] = useState([])

  const memberById = useMemo(() => new Map(members.map((m) => [m.id, m])), [members])
  const creatorById = useMemo(() => new Map(members.map((m) => [m.id, m])), [members])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()

    let list = groups.filter((g) => {
      if (filterStatus !== 'tous' && g.status !== filterStatus) return false
      if (q && !g.name.toLowerCase().includes(q) && !g.description.toLowerCase().includes(q)) return false
      return true
    })

    list.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'member_count') return b.member_count - a.member_count
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return list
  }, [groups, filterStatus, query, sortBy])

  const openCreateModal = () => {
    setModalMode('create')
    setEditingGroup(null)
    setFormData({ name: '', description: '' })
    setModalOpen(true)
  }

  const openEditModal = (group) => {
    setModalMode('edit')
    setEditingGroup(group)
    setFormData({ name: group.name, description: group.description })
    setModalOpen(true)
  }

  const openMembersModal = (group) => {
    setModalMode('members')
    setViewingGroupMembers(group)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingGroup(null)
    setViewingGroupMembers(null)
    setFormData({ name: '', description: '' })
  }

  const handleSaveGroup = () => {
    if (!formData.name.trim()) {
      setNotifications((prev) => [
        { id: Date.now(), type: 'error', text: 'Le nom du groupe est requis' },
        ...prev,
      ])
      return
    }

    let updatedGroup
    if (modalMode === 'create') {
      updatedGroup = groupService.createGroup({
        ...formData,
        created_by: members[0].id,
      })
      setGroups((prev) => [...prev, updatedGroup])
      setNotifications((prev) => [{ id: Date.now(), type: 'success', text: `Groupe "${updatedGroup.name}" créé` }, ...prev])
    } else {
      updatedGroup = groupService.updateGroup(editingGroup.id, formData)
      setGroups((prev) => prev.map((g) => (g.id === editingGroup.id ? updatedGroup : g)))
      setNotifications((prev) => [{ id: Date.now(), type: 'success', text: `Groupe mis à jour` }, ...prev])
    }

    closeModal()
  }

  const handleDeleteGroup = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) {
      groupService.deleteGroup(id)
      setGroups((prev) => prev.filter((g) => g.id !== id))
      setGroupMembers((prev) => {
        const newMembers = { ...prev }
        delete newMembers[id]
        return newMembers
      })
      setNotifications((prev) => [{ id: Date.now(), type: 'success', text: 'Groupe supprimé' }, ...prev])
    }
  }

  const handleArchiveGroup = (id) => {
    const updated = groupService.archiveGroup(id)
    setGroups((prev) => prev.map((g) => (g.id === id ? updated : g)))
    setNotifications((prev) => [{ id: Date.now(), type: 'success', text: 'Groupe archivé' }, ...prev])
  }

  const handleDisableGroup = (id) => {
    const updated = groupService.disableGroup(id)
    setGroups((prev) => prev.map((g) => (g.id === id ? updated : g)))
    setNotifications((prev) => [{ id: Date.now(), type: 'info', text: 'Groupe désactivé' }, ...prev])
  }

  const handleActivateGroup = (id) => {
    const updated = groupService.activateGroup(id)
    setGroups((prev) => prev.map((g) => (g.id === id ? updated : g)))
    setNotifications((prev) => [{ id: Date.now(), type: 'success', text: 'Groupe activé' }, ...prev])
  }

  const handleRenewCode = (id) => {
    const updated = groupService.renewInvitationCode(id)
    setGroups((prev) => prev.map((g) => (g.id === id ? updated : g)))
    setNotifications((prev) => [{ id: Date.now(), type: 'success', text: 'Code d\'invitation renouvelé' }, ...prev])
  }

  const handleAddMemberToGroup = (memberId) => {
    if (!viewingGroupMembers) return
    try {
      const newMember = groupService.addMemberToGroup({
        group_id: viewingGroupMembers.id,
        member_id: memberId,
        role_devoir: 'member',
      })
      setGroupMembers((prev) => ({
        ...prev,
        [viewingGroupMembers.id]: [...(prev[viewingGroupMembers.id] || []), newMember],
      }))
      setGroups((prev) =>
        prev.map((g) =>
          g.id === viewingGroupMembers.id ? { ...g, member_count: g.member_count + 1 } : g,
        ),
      )
      setNotifications((prev) => [{ id: Date.now(), type: 'success', text: 'Membre ajouté au groupe' }, ...prev])
    } catch (e) {
      setNotifications((prev) => [{ id: Date.now(), type: 'error', text: e.message }, ...prev])
    }
  }

  const handleRemoveMember = (memberId) => {
    if (!viewingGroupMembers) return
    groupService.removeMemberFromGroup(viewingGroupMembers.id, memberId)
    setGroupMembers((prev) => ({
      ...prev,
      [viewingGroupMembers.id]: prev[viewingGroupMembers.id].filter((m) => m.member_id !== memberId),
    }))
    setGroups((prev) =>
      prev.map((g) =>
        g.id === viewingGroupMembers.id ? { ...g, member_count: g.member_count - 1 } : g,
      ),
    )
    setNotifications((prev) => [{ id: Date.now(), type: 'success', text: 'Membre retiré du groupe' }, ...prev])
  }

  return (
    <div className="w-full flex-1 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        {/* Notifications */}
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

        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Gestion des Groupes (Admin)</h2>
            <p className="mt-1 text-sm text-white/70">
              Créer, modifier, supprimer des groupes. Gérer les membres et codes d'invitation.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-red/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-red/30"
          >
            <Icon icon="solar:add-circle-bold" width={18} />
            Créer un groupe
          </button>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Sidebar - Filtres */}
          <aside className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="mb-3 text-base font-semibold">Filtres</h3>
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-sm text-white/75">Recherche</span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Nom du groupe..."
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/90 outline-none transition focus:border-brand-red/60"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm text-white/75">Statut</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/90 outline-none transition focus:border-brand-red/60"
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
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/90 outline-none transition focus:border-brand-red/60"
                >
                  <option value="created_at">Plus récent</option>
                  <option value="name">Nom A-Z</option>
                  <option value="member_count">Nombre de membres</option>
                </select>
              </label>

              <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center text-sm">
                <div className="text-white/70">Total</div>
                <div className="text-2xl font-bold text-white">{filtered.length}</div>
              </div>
            </div>
          </aside>

          {/* Main Content - Liste des groupes */}
          <div className="lg:col-span-3">
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                <Icon icon="solar:folder-open-linear" width={40} className="mx-auto mb-2 text-white/50" />
                <p className="text-white/70">Aucun groupe trouvé</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((group) => {
                  const currentMembers = groupMembers[group.id] || []
                  const statusInfo = getStatusLabel(group.status)
                  const creator = creatorById.get(group.created_by)

                  return (
                    <motion.div
                      key={group.id}
                      layout
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/8"
                    >
                      <div className="flex flex-col gap-4">
                        {/* Info Groupe */}
                        <div>
                          <div className="mb-1 flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-white">{group.name}</h3>
                            <span
                              className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${statusInfo.bg} ${statusInfo.color} border ${statusInfo.border}`}
                            >
                              {statusInfo.label}
                            </span>
                          </div>
                          <p className="mb-2 text-sm text-white/70">{group.description || '—'}</p>
                          <div className="flex flex-wrap gap-3 text-xs text-white/60">
                            <span className="flex items-center gap-1">
                              <Icon icon="solar:users-group-rounded-linear" width={14} />
                              {currentMembers.length} membre{currentMembers.length !== 1 ? 's' : ''}
                            </span>
                            <span className="flex items-center gap-1">
                              <Icon icon="solar:calendar-linear" width={14} />
                              {formatDateFR(group.created_at)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Icon icon="solar:user-bold" width={14} />
                              {creator?.name || '—'}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => openMembersModal(group)}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10"
                          >
                            <Icon icon="solar:users-group-rounded-linear" width={14} />
                            Membres
                          </button>

                          <button
                            onClick={() => handleRenewCode(group.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10"
                            title={group.code_invitation}
                          >
                            <Icon icon="solar:refresh-circle-linear" width={14} />
                            {group.code_invitation}
                          </button>

                          <button
                            onClick={() => openEditModal(group)}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10"
                          >
                            <Icon icon="solar:pen-2-linear" width={14} />
                            Éditer
                          </button>

                          {group.status === 'active' ? (
                            <>
                              <button
                                onClick={() => handleDisableGroup(group.id)}
                                className="inline-flex items-center gap-1 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs font-medium text-yellow-300 transition hover:bg-yellow-500/20"
                              >
                                <Icon icon="solar:eye-closed-linear" width={14} />
                                Désactiver
                              </button>
                              <button
                                onClick={() => handleArchiveGroup(group.id)}
                                className="inline-flex items-center gap-1 rounded-lg border border-gray-500/30 bg-gray-500/10 px-3 py-2 text-xs font-medium text-gray-300 transition hover:bg-gray-500/20"
                              >
                                <Icon icon="solar:archive-linear" width={14} />
                                Archiver
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleActivateGroup(group.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs font-medium text-green-300 transition hover:bg-green-500/20"
                            >
                              <Icon icon="solar:eye-linear" width={14} />
                              Activer
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteGroup(group.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/20"
                          >
                            <Icon icon="solar:trash-bin-2-linear" width={14} />
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {modalOpen && modalMode === 'create' && (
            <GroupFormModal
              mode="create"
              group={null}
              formData={formData}
              setFormData={setFormData}
              onSave={handleSaveGroup}
              onClose={closeModal}
            />
          )}

          {modalOpen && modalMode === 'edit' && (
            <GroupFormModal
              mode="edit"
              group={editingGroup}
              formData={formData}
              setFormData={setFormData}
              onSave={handleSaveGroup}
              onClose={closeModal}
            />
          )}

          {modalOpen && modalMode === 'members' && (
            <GroupMembersModal
              group={viewingGroupMembers}
              members={members}
              currentMembers={groupMembers[viewingGroupMembers?.id] || []}
              onAddMember={handleAddMemberToGroup}
              onRemoveMember={handleRemoveMember}
              onClose={closeModal}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function GroupFormModal({ mode, group, formData, setFormData, onSave, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur"
      >
        <h2 className="mb-4 text-xl font-bold text-white">
          {mode === 'create' ? 'Créer un groupe' : 'Modifier le groupe'}
        </h2>

        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-white/80">Nom du groupe</span>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Math Nebula"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white/90 outline-none transition focus:border-brand-red/60"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-white/80">Description</span>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrivez le groupe..."
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white/90 outline-none transition focus:border-brand-red/60"
            />
          </label>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/10 px-4 py-2 font-medium text-white/70 transition hover:bg-white/5"
          >
            Annuler
          </button>
          <button
            onClick={onSave}
            className="flex-1 rounded-xl bg-brand-red/20 px-4 py-2 font-medium text-white transition hover:bg-brand-red/30"
          >
            {mode === 'create' ? 'Créer' : 'Mettre à jour'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function GroupMembersModal({ group, members, currentMembers, onAddMember, onRemoveMember, onClose }) {
  const memberIds = new Set(currentMembers.map((m) => m.member_id))
  const availableMembers = members.filter((m) => !memberIds.has(m.id))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur"
      >
        <h2 className="mb-4 text-xl font-bold text-white">
          Membres de <span className="text-brand-red">{group?.name}</span>
        </h2>

        <div className="grid max-h-96 grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2">
          {/* Membres actuels */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-green-300">Actuellement dans le groupe</h3>
            <div className="space-y-2 rounded-xl border border-green-500/20 bg-green-500/5 p-3">
              {currentMembers.length === 0 ? (
                <p className="text-xs text-white/50">Aucun membre</p>
              ) : (
                currentMembers.map((gm) => {
                  const member = members.find((m) => m.id === gm.member_id)
                  return (
                    <div key={gm.id} className="flex items-center justify-between rounded-lg bg-black/20 p-2 text-xs">
                      <div>
                        <div className="font-medium text-white">{member?.name}</div>
                        <div className="text-white/50">{member?.email}</div>
                      </div>
                      <button
                        onClick={() => onRemoveMember(gm.member_id)}
                        className="rounded-lg border border-red-500/30 bg-red-500/10 p-1 text-red-300 transition hover:bg-red-500/20"
                      >
                        <Icon icon="solar:trash-bin-2-linear" width={14} />
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Membres disponibles */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-blue-300">Membres disponibles</h3>
            <div className="space-y-2 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
              {availableMembers.length === 0 ? (
                <p className="text-xs text-white/50">Tous les membres sont déjà dans le groupe</p>
              ) : (
                availableMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between rounded-lg bg-black/20 p-2 text-xs">
                    <div>
                      <div className="font-medium text-white">{member.name}</div>
                      <div className="text-white/50">{member.email}</div>
                    </div>
                    <button
                      onClick={() => onAddMember(member.id)}
                      className="rounded-lg border border-green-500/30 bg-green-500/10 p-1 text-green-300 transition hover:bg-green-500/20"
                    >
                      <Icon icon="solar:add-circle-linear" width={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-2 font-medium text-white/70 transition hover:bg-white/5"
          >
            Fermer
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
