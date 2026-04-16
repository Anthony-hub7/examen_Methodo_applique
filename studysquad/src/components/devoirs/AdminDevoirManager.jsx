import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'
import { useDevoirs } from '../../hooks/useDevoirs'

export default function AdminDevoirManager() {
  const {
    loading,
    uploading,
    error,
    filterState,
    query,
    sortBy,
    sortOrder,
    setFilterState,
    setQuery,
    setSortBy,
    setSortOrder,
    members,
    groups,
    filteredDevoirs,
    notifications,
    remindersSent,
    memberById,
    groupById,
    updateDevoir,
    markAsDone,
    createDevoir,
    deleteDevoir,
    sendReminders,
    uploadAttachments,
    removeAttachment,
    computeState,
    formatDateFR,
    formatBytes,
  } = useDevoirs()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerAttachment, setViewerAttachment] = useState(null)

  const openEdit = (devoir) => {
    setIsCreating(false)
    setEditing({ ...devoir })
    setModalOpen(true)
  }

  const openCreate = () => {
    const fallbackMemberId = members[0]?.id || ''
    const fallbackGroupId = groups[0]?.id || null
    setIsCreating(true)
    setEditing({
      titre: '',
      etat: 'a faire',
      sujet: '',
      deadline: null,
      priorite: 'moyenne',
      group_id: fallbackGroupId,
      member_id: fallbackMemberId,
      attachments: [],
    })
    setModalOpen(true)
  }

  const closeEdit = () => {
    setModalOpen(false)
    setIsCreating(false)
    setEditing(null)
  }

  const applyEdit = () => {
    if (!editing) return
    if (isCreating) {
      const created = createDevoir(editing)
      if (!created) return
    } else {
      updateDevoir(editing.id, editing)
    }
    closeEdit()
  }

  const isPdfAttachment = (attachment) => {
    const type = String(attachment?.type || '').toLowerCase()
    const name = String(attachment?.name || '').toLowerCase()
    return type.includes('pdf') || name.endsWith('.pdf')
  }

  const openViewer = (attachment) => {
    setViewerAttachment(attachment)
    setViewerOpen(true)
  }

  const closeViewer = () => {
    setViewerOpen(false)
    setViewerAttachment(null)
  }

  const handleFileUpload = async (event) => {
    if (!editing || isCreating) return
    const files = event.target.files
    if (!files || files.length === 0) return
    const snapshot = await uploadAttachments(editing.id, files)
    const refreshedDevoir = snapshot?.devoirs?.find((item) => String(item.id) === String(editing.id))
    if (refreshedDevoir) setEditing({ ...refreshedDevoir })
    event.target.value = ''
  }

  return (
    <div className="w-full flex-1 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Gestion des devoirs (Admin)</h2>
            <p className="mt-1 text-sm text-white/70">
              Donnees dynamiques via service + hook (mock localStorage / dataAdmin.json).
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-brand-red/70 hover:bg-brand-red/15"
            >
              <Icon icon="solar:add-circle-bold" width={18} />
              Creer un devoir
            </button>

            <button
              type="button"
              onClick={sendReminders}
              className="inline-flex items-center gap-2 rounded-xl border border-brand-red/50 bg-brand-red/15 px-4 py-2 text-sm font-semibold text-white transition hover:border-brand-red/80 hover:bg-brand-red/25"
            >
              <Icon icon="solar:siren-bold" width={18} />
              Relancer avec rappels
            </button>

            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm">
              <span className="text-white/70">Rappels envoyes:</span>{' '}
              <span className="font-bold text-white">{remindersSent}</span>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <aside className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="mb-3 text-base font-semibold">Filtres</h3>

            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-sm text-white/75">Recherche</span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Titre, sujet, membre, groupe..."
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/90 outline-none transition focus:border-brand-red/60"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm text-white/75">Etat (IHM)</span>
                <select
                  value={filterState}
                  onChange={(e) => setFilterState(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/90 outline-none transition focus:border-brand-red/60"
                >
                  <option value="tous">Tous</option>
                  <option value="en_retard">En retard</option>
                  <option value="en_cours">En cours</option>
                  <option value="termine">Termine</option>
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-sm text-white/75">Trier</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/90 outline-none transition focus:border-brand-red/60"
                  >
                    <option value="deadline">Deadline</option>
                    <option value="priorite">Priorite</option>
                    <option value="created_at">Cree</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm text-white/75">Ordre</span>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/90 outline-none transition focus:border-brand-red/60"
                  >
                    <option value="asc">Asc</option>
                    <option value="desc">Desc</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs font-semibold text-white/90">Note</p>
              <p className="mt-1 text-xs text-white/70">
                Les devoirs en "a faire" sont affiches en "En cours" pour simplifier la lecture.
              </p>
            </div>
          </aside>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-4 lg:col-span-2">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-base font-semibold">Voir tous les devoirs</h3>
              <div className="text-sm text-white/70">
                {filteredDevoirs.length} devoir{filteredDevoirs.length > 1 ? 's' : ''} affiche
                {filteredDevoirs.length > 1 ? 's' : ''}
              </div>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-center text-sm text-white/70">
                Chargement des devoirs...
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDevoirs.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-center text-sm text-white/70">
                    Aucun devoir ne correspond aux filtres.
                  </div>
                ) : null}

                {filteredDevoirs.map((devoir) => {
                  const computedState = computeState(devoir)
                  const member = memberById.get(devoir.member_id)
                  const group = devoir.group_id ? groupById.get(devoir.group_id) : null

                  const pillClass =
                    computedState.pill === 'termine'
                      ? 'border-green-500/50 bg-green-500/10 text-green-100'
                      : computedState.pill === 'en_retard'
                        ? 'border-brand-red/60 bg-brand-red/15 text-brand-red'
                        : 'border-brand-red/30 bg-white/5 text-white'

                  return (
                    <motion.article
                      key={devoir.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="rounded-2xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="truncate text-base font-semibold text-white/95">{devoir.titre}</h4>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${pillClass}`}
                            >
                              <Icon icon="solar:bolt-circle-bold" width={14} />
                              {computedState.label}
                            </span>
                            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
                              Priorite: <b className="ml-1 text-white/90">{devoir.priorite}</b>
                            </span>
                          </div>

                          <div className="mt-2 text-sm text-white/75">
                            Assigne a: <b className="text-white/95">{member?.name || '—'}</b>
                            {group ? (
                              <>
                                {' '}
                                • Groupe: <b className="text-white/95">{group.name}</b>
                              </>
                            ) : (
                              <> • Mode solo</>
                            )}
                          </div>

                          <div className="mt-1 text-sm text-white/70">
                            Deadline: <b className="text-white/90">{formatDateFR(devoir.deadline)}</b>
                          </div>
                          <div className="mt-2 text-xs text-white/65">
                            Supports: <b className="text-white/85">{devoir.attachments?.length || 0}</b>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(devoir)}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white transition hover:border-brand-red/60 hover:bg-brand-red/10"
                          >
                            <Icon icon="solar:pen-bold" width={18} />
                            Attribuer / Reaffecter
                          </button>

                          <button
                            type="button"
                            onClick={() => markAsDone(devoir.id)}
                            className="inline-flex items-center gap-2 rounded-xl bg-brand-red px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                          >
                            <Icon icon="solar:check-read-bold" width={18} />
                            Marquer termine
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const ok = window.confirm(`Supprimer le devoir \"${devoir.titre}\" ?`)
                              if (!ok) return
                              deleteDevoir(devoir.id)
                            }}
                            className="inline-flex items-center gap-2 rounded-xl border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/20"
                          >
                            <Icon icon="solar:trash-bin-trash-bold" width={18} />
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </motion.article>
                  )
                })}
              </div>
            )}
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-base font-semibold">Notifications / Rappels</h3>
            <div className="text-sm text-white/70">Dernieres notifications (mock)</div>
          </div>

          <div className="max-h-72 overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-center text-sm text-white/70">
                Aucune notification pour le moment. Clique sur "Relancer avec rappels".
              </div>
            ) : null}

            <ul className="space-y-2">
              {notifications.slice(0, 10).map((notification) => (
                <li
                  key={notification.id ?? notification.created_at}
                  className="flex flex-col gap-1 rounded-xl border border-white/10 bg-black/20 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white/90">{notification.content}</p>
                    <p className="text-xs text-white/60">{new Date(notification.created_at).toLocaleString('fr-FR')}</p>
                  </div>
                  <span
                    className={
                      notification.is_read
                        ? 'rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70'
                        : 'rounded-full border border-brand-red/50 bg-brand-red/15 px-3 py-1 text-xs font-semibold text-brand-red'
                    }
                  >
                    {notification.is_read ? 'Lu' : 'Non lu'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <AnimatePresence>
          {modalOpen && editing ? (
            <motion.div
              className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeEdit}
            >
              <motion.div
                className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f0f] shadow-2xl"
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 16, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white/95">
                      {isCreating ? 'Creer un devoir' : 'Attribuer / Reaffecter'}
                    </p>
                    <p className="truncate text-xs text-white/60">{editing.titre || 'Nouveau devoir'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={closeEdit}
                    className="rounded-xl border border-white/15 bg-white/5 p-2 text-white/80 transition hover:border-brand-red/60 hover:text-white"
                    aria-label="Fermer"
                  >
                    <Icon icon="solar:close-circle-bold" width={22} />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 p-4 sm:p-6 md:grid-cols-2">
                  <label className="block md:col-span-2">
                    <span className="mb-1 block text-sm text-white/75">Titre <span className="text-brand-red">*</span></span>
                    <input
                      type="text"
                      value={editing.titre || ''}
                      onChange={(e) => setEditing((prev) => ({ ...prev, titre: e.target.value }))}
                      placeholder="Ex: DM - Equations différentielles..."
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/90 outline-none transition focus:border-brand-red/60"
                      autoFocus
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm text-white/75">Membre</span>
                    <select
                      value={editing.member_id}
                      onChange={(e) => setEditing((prev) => ({ ...prev, member_id: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/90 outline-none transition focus:border-brand-red/60"
                    >
                      {members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm text-white/75">Mode</span>
                    <select
                      value={editing.group_id ? editing.group_id : 'solo'}
                      onChange={(e) => {
                        const value = e.target.value
                        setEditing((prev) => ({ ...prev, group_id: value === 'solo' ? null : value }))
                      }}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/90 outline-none transition focus:border-brand-red/60"
                    >
                      <option value="solo">Solo (sans groupe)</option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.id}>
                          Groupe: {group.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm text-white/75">Etat</span>
                    <select
                      value={editing.etat}
                      onChange={(e) => setEditing((prev) => ({ ...prev, etat: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/90 outline-none transition focus:border-brand-red/60"
                    >
                      <option value="a faire">a faire</option>
                      <option value="en cours">en cours</option>
                      <option value="termine">termine</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm text-white/75">Priorite</span>
                    <select
                      value={editing.priorite}
                      onChange={(e) => setEditing((prev) => ({ ...prev, priorite: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/90 outline-none transition focus:border-brand-red/60"
                    >
                      <option value="faible">faible</option>
                      <option value="moyenne">moyenne</option>
                      <option value="haute">haute</option>
                    </select>
                  </label>

                  <label className="block md:col-span-2">
                    <span className="mb-1 block text-sm text-white/75">Sujet</span>
                    <input
                      type="text"
                      value={editing.sujet || ''}
                      onChange={(e) => setEditing((prev) => ({ ...prev, sujet: e.target.value }))}
                      placeholder="Ex: serie 3, chapitre..."
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/90 outline-none transition focus:border-brand-red/60"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm text-white/75">Deadline</span>
                    <input
                      type="date"
                      value={editing.deadline ? editing.deadline.slice(0, 10) : ''}
                      onChange={(e) => {
                        const value = e.target.value
                        setEditing((prev) => ({
                          ...prev,
                          deadline: value ? new Date(`${value}T12:00:00Z`).toISOString() : null,
                        }))
                      }}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/90 outline-none transition focus:border-brand-red/60"
                    />
                  </label>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4 md:col-span-1">
                    <p className="text-xs uppercase tracking-wide text-white/55">Apercu etat</p>
                    <p className="mt-2 text-sm font-semibold text-white/95">{computeState(editing).label}</p>
                    <p className="mt-1 text-xs text-white/70">
                      Deadline: <b className="text-white/90">{formatDateFR(editing.deadline)}</b>
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4 md:col-span-2">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white/90">Supports du devoir</p>
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/90 hover:border-brand-red/60">
                        <Icon icon="solar:upload-bold" width={16} />
                        {uploading ? 'Upload...' : 'Ajouter des fichiers'}
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg,.webp,.zip"
                          className="hidden"
                          onChange={handleFileUpload}
                          disabled={uploading || isCreating}
                        />
                      </label>
                    </div>

                    {isCreating ? (
                      <p className="mb-3 text-xs text-white/60">
                        Enregistre d'abord le devoir pour pouvoir ajouter des supports.
                      </p>
                    ) : null}

                    {!editing.attachments || editing.attachments.length === 0 ? (
                      <p className="text-xs text-white/65">Aucun support pour ce devoir.</p>
                    ) : (
                      <ul className="space-y-2">
                        {editing.attachments.map((attachment) => (
                          <li
                            key={attachment.id}
                            className="flex flex-col gap-2 rounded-xl border border-white/10 bg-[#111] p-3 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-white/95">{attachment.name}</p>
                              <p className="text-xs text-white/60">
                                {formatBytes(attachment.size)} • {new Date(attachment.created_at).toLocaleString('fr-FR')}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <a
                                href={attachment.data_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-xs font-semibold text-white/90 hover:border-brand-red/60"
                              >
                                <Icon icon="solar:eye-bold" width={14} />
                                Voir
                              </a>
                              <button
                                type="button"
                                onClick={() => openViewer(attachment)}
                                disabled={!isPdfAttachment(attachment)}
                                className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-xs font-semibold text-white/90 hover:border-brand-red/60 disabled:cursor-not-allowed disabled:opacity-40"
                                title={isPdfAttachment(attachment) ? 'Lire le PDF ici' : 'Preview inline disponible pour PDF'}
                              >
                                <Icon icon="solar:document-text-bold" width={14} />
                                Lire
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  removeAttachment(editing.id, attachment.id)
                                  setEditing((prev) => ({
                                    ...prev,
                                    attachments: (prev.attachments || []).filter((item) => item.id !== attachment.id),
                                  }))
                                }}
                                className="inline-flex items-center gap-1 rounded-lg border border-red-500/40 bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-200 hover:bg-red-500/20"
                              >
                                <Icon icon="solar:trash-bin-trash-bold" width={14} />
                                Supprimer
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 border-t border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
                  <button
                    type="button"
                    onClick={closeEdit}
                    className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 transition hover:border-brand-red/60"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={applyEdit}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-red px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    <Icon icon="solar:check-read-bold" width={18} />
                    {isCreating ? 'Creer' : 'Enregistrer'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {viewerOpen && viewerAttachment ? (
            <motion.div
              className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeViewer}
            >
              <motion.div
                className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f0f] shadow-2xl"
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 12, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <p className="truncate text-sm font-semibold text-white/90">{viewerAttachment.name}</p>
                  <button
                    type="button"
                    onClick={closeViewer}
                    className="rounded-lg border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/90"
                  >
                    Fermer
                  </button>
                </div>
                <div className="h-[75vh] bg-black">
                  {isPdfAttachment(viewerAttachment) ? (
                    <iframe
                      src={viewerAttachment.data_url}
                      title={viewerAttachment.name}
                      className="h-full w-full"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-6 text-center text-sm text-white/70">
                      Ce type de fichier n'est pas lisible inline ici. Utilise "Voir" pour l'ouvrir dans un onglet.
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}
