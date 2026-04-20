import seedData from './dataAdmin.json'

const STORAGE_KEY = 'studysquad_admin_devoirs'
const PRIORITY_ORDER = { faible: 0, moyenne: 1, haute: 2 }
const MAX_FILE_SIZE = 8 * 1024 * 1024

function readStorage(key, fallback) {
  const raw = localStorage.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function ensureArray(value) {
  return Array.isArray(value) ? value : []
}

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `mock_${Math.random().toString(16).slice(2)}_${Date.now()}`
}

function nowIso() {
  return new Date().toISOString()
}

function normalizeAttachment(raw) {
  if (!raw || typeof raw !== 'object') return null
  if (!raw.data_url || !raw.name) return null

  return {
    id: raw.id ? String(raw.id) : newId(),
    name: String(raw.name),
    type: String(raw.type || 'application/octet-stream'),
    size: Number(raw.size || 0),
    created_at: String(raw.created_at || nowIso()),
    data_url: String(raw.data_url),
  }
}

function normalizeNotification(raw) {
  if (!raw || typeof raw !== 'object') return null

  return {
    id: raw.id ? String(raw.id) : newId(),
    title: String(raw.title || 'Notification admin'),
    content: String(raw.content || ''),
    type: String(raw.type || 'info'),
    is_read: Boolean(raw.is_read),
    user_id: raw.user_id ? String(raw.user_id) : 'admin-mock',
    devoir_id: raw.devoir_id ? String(raw.devoir_id) : null,
    created_at: String(raw.created_at || nowIso()),
  }
}

function normalizeDevoir(raw) {
  if (!raw || typeof raw !== 'object') return null

  return {
    ...raw,
    attachments: ensureArray(raw.attachments).map((item) => normalizeAttachment(item)).filter(Boolean),
  }
}

function buildSeedSnapshot() {
  const source = seedData?.adminDevoirs || {}
  return {
    members: ensureArray(source.members),
    groups: ensureArray(source.groups),
    devoirs: ensureArray(source.devoirs).map((item) => normalizeDevoir(item)).filter(Boolean),
    notifications: ensureArray(source.notifications).map((item) => normalizeNotification(item)).filter(Boolean),
    remindersSent: Number(source.remindersSent || 0),
  }
}

function ensureSnapshot() {
  const existing = readStorage(STORAGE_KEY, null)
  if (existing && typeof existing === 'object') {
    const seeded = buildSeedSnapshot()
    const existingNotifications = ensureArray(existing.notifications).map((item) => normalizeNotification(item)).filter(Boolean)
    const merged = {
      members: ensureArray(existing.members),
      groups: ensureArray(existing.groups),
      devoirs: ensureArray(existing.devoirs).map((item) => normalizeDevoir(item)).filter(Boolean),
      notifications: existingNotifications.length > 0 ? existingNotifications : seeded.notifications,
      remindersSent: Number(existing.remindersSent || (existingNotifications.length > 0 ? 0 : seeded.remindersSent)),
    }
    writeStorage(STORAGE_KEY, merged)
    return merged
  }

  const seeded = buildSeedSnapshot()
  writeStorage(STORAGE_KEY, seeded)
  return seeded
}

function saveSnapshot(snapshot) {
  writeStorage(STORAGE_KEY, snapshot)
  return snapshot
}

function formatDateFR(isoDate) {
  if (!isoDate) return '—'
  const date = new Date(isoDate)
  return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: '2-digit' })
}

function formatBytes(bytes = 0) {
  const size = Number(bytes)
  if (!Number.isFinite(size) || size <= 0) return '0 B'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(2)} MB`
}

function getDevoirComputedState(devoir) {
  const isCompleted = devoir.etat === 'termine' || devoir.etat === 'terminé'
  const hasDeadline = Boolean(devoir.deadline)
  const deadlineTs = hasDeadline ? new Date(devoir.deadline).getTime() : null
  const isLate = !isCompleted && deadlineTs !== null && deadlineTs < Date.now()

  if (isCompleted) return { label: 'Termine', pill: 'termine', isCompleted: true, isLate: false }
  if (isLate) return { label: 'En retard', pill: 'en_retard', isCompleted: false, isLate: true }
  return { label: 'En cours', pill: 'en_cours', isCompleted: false, isLate: false }
}

function filterAndSortDevoirs({
  devoirs,
  filterState = 'tous',
  query = '',
  sortBy = 'deadline',
  sortOrder = 'asc',
  memberById,
  groupById,
}) {
  const normalizedQuery = String(query).trim().toLowerCase()

  let list = devoirs.map((devoir) => ({ ...devoir, _computed: getDevoirComputedState(devoir) }))

  if (filterState !== 'tous') {
    list = list.filter((devoir) => devoir._computed.pill === filterState)
  }

  if (normalizedQuery) {
    list = list.filter((devoir) => {
      const member = memberById.get(devoir.member_id)?.name || ''
      const group = devoir.group_id ? groupById.get(devoir.group_id)?.name || '' : ''
      return [devoir.titre, devoir.sujet || '', member, group].some((value) => value.toLowerCase().includes(normalizedQuery))
    })
  }

  const order = sortOrder === 'asc' ? 1 : -1

  list.sort((a, b) => {
    let av = 0
    let bv = 0

    if (sortBy === 'deadline') {
      av = a.deadline ? new Date(a.deadline).getTime() : Number.POSITIVE_INFINITY
      bv = b.deadline ? new Date(b.deadline).getTime() : Number.POSITIVE_INFINITY
    } else if (sortBy === 'created_at') {
      av = new Date(a.created_at).getTime()
      bv = new Date(b.created_at).getTime()
    } else {
      av = PRIORITY_ORDER[a.priorite] ?? 0
      bv = PRIORITY_ORDER[b.priorite] ?? 0
    }

    if (av === bv) return 0
    return av > bv ? order : -order
  })

  return list
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error(`Impossible de lire le fichier: ${file.name}`))
    reader.readAsDataURL(file)
  })
}

function validateFile(file) {
  if (!file) throw new Error('Fichier invalide.')
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`${file.name} depasse la limite de 8 MB.`)
  }
}

function normalizeIsoDate(input) {
  if (!input) return null
  const date = new Date(input)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function buildNotification({
  title,
  content,
  type = 'info',
  isRead = false,
  userId = 'admin-mock',
  devoirId = null,
}) {
  return normalizeNotification({
    id: newId(),
    title,
    content,
    type,
    is_read: isRead,
    user_id: userId,
    devoir_id: devoirId,
    created_at: nowIso(),
  })
}

function saveSnapshotWithNotification(snapshot, notification, extras = {}) {
  return saveSnapshot({
    ...snapshot,
    ...extras,
    notifications: [notification, ...ensureArray(snapshot.notifications)],
  })
}

export const devoirService = {
  getAdminSnapshot() {
    return ensureSnapshot()
  },

  updateDevoir(devoirId, partialData) {
    const { _computed, ...safePartialData } = partialData || {}
    const snapshot = ensureSnapshot()
    const nextDevoirs = snapshot.devoirs.map((devoir) =>
      String(devoir.id) === String(devoirId)
        ? { ...devoir, ...safePartialData, attachments: ensureArray(safePartialData?.attachments ?? devoir.attachments) }
        : devoir,
    )

    const updatedSnapshot = saveSnapshot({ ...snapshot, devoirs: nextDevoirs })
    const updatedDevoir = updatedSnapshot.devoirs.find((devoir) => String(devoir.id) === String(devoirId))

    if (!updatedDevoir) return updatedSnapshot

    const notification = buildNotification({
      title: 'Devoir mis a jour',
      content: `Le devoir "${updatedDevoir.titre}" a ete reattribue ou modifie dans l'espace admin.`,
      type: 'update',
      userId: updatedDevoir.member_id,
      devoirId: updatedDevoir.id,
    })

    return saveSnapshotWithNotification(updatedSnapshot, notification)
  },

  markAsDone(devoirId) {
    return this.updateDevoir(devoirId, { etat: 'termine' })
  },

  createDevoir(payload = {}) {
    const snapshot = ensureSnapshot()
    const fallbackMemberId = snapshot.members[0]?.id || ''

    const titre = String(payload.titre || '').trim()
    if (!titre) throw new Error('Le titre du devoir est obligatoire.')

    const nextDevoir = {
      id: newId(),
      titre,
      etat: payload.etat || 'a faire',
      sujet: String(payload.sujet || '').trim(),
      deadline: normalizeIsoDate(payload.deadline),
      priorite: payload.priorite || 'moyenne',
      group_id: payload.group_id || null,
      member_id: payload.member_id || fallbackMemberId,
      created_at: nowIso(),
      attachments: [],
    }

    const updatedSnapshot = saveSnapshot({ ...snapshot, devoirs: [nextDevoir, ...snapshot.devoirs] })
    const notification = buildNotification({
      title: 'Nouveau devoir cree',
      content: `Le devoir "${nextDevoir.titre}" a ete assigne${nextDevoir.member_id ? ' a un membre' : ''}.`,
      type: 'assignment',
      userId: nextDevoir.member_id,
      devoirId: nextDevoir.id,
    })

    return saveSnapshotWithNotification(updatedSnapshot, notification)
  },

  deleteDevoir(devoirId) {
    const snapshot = ensureSnapshot()
    const deletedDevoir = snapshot.devoirs.find((devoir) => String(devoir.id) === String(devoirId))
    const nextDevoirs = snapshot.devoirs.filter((devoir) => String(devoir.id) !== String(devoirId))
    const updatedSnapshot = saveSnapshot({ ...snapshot, devoirs: nextDevoirs })

    if (!deletedDevoir) return updatedSnapshot

    const notification = buildNotification({
      title: 'Devoir supprime',
      content: `Le devoir "${deletedDevoir.titre}" a ete retire des affectations admin.`,
      type: 'delete',
      isRead: true,
      userId: deletedDevoir.member_id,
      devoirId: deletedDevoir.id,
    })

    return saveSnapshotWithNotification(updatedSnapshot, notification)
  },

  async addAttachments(devoirId, files = []) {
    const fileList = Array.from(files || [])
    if (fileList.length === 0) return ensureSnapshot()

    fileList.forEach((file) => validateFile(file))

    const prepared = await Promise.all(
      fileList.map(async (file) => ({
        id: newId(),
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: Number(file.size || 0),
        created_at: nowIso(),
        data_url: await fileToDataUrl(file),
      })),
    )

    const snapshot = ensureSnapshot()
    const nextDevoirs = snapshot.devoirs.map((devoir) => {
      if (String(devoir.id) !== String(devoirId)) return devoir
      const current = ensureArray(devoir.attachments)
      return { ...devoir, attachments: [...current, ...prepared] }
    })

    const updatedSnapshot = saveSnapshot({ ...snapshot, devoirs: nextDevoirs })
    const targetDevoir = updatedSnapshot.devoirs.find((devoir) => String(devoir.id) === String(devoirId))

    if (!targetDevoir) return updatedSnapshot

    const notification = buildNotification({
      title: 'Support ajoute',
      content: `${prepared.length} fichier${prepared.length > 1 ? 's ont ete ajoutes' : ' a ete ajoute'} au devoir "${targetDevoir.titre}".`,
      type: 'attachment',
      userId: targetDevoir.member_id,
      devoirId: targetDevoir.id,
    })

    return saveSnapshotWithNotification(updatedSnapshot, notification)
  },

  removeAttachment(devoirId, attachmentId) {
    const snapshot = ensureSnapshot()
    const targetDevoir = snapshot.devoirs.find((devoir) => String(devoir.id) === String(devoirId))
    const removedAttachment = targetDevoir?.attachments?.find((att) => String(att.id) === String(attachmentId))
    const nextDevoirs = snapshot.devoirs.map((devoir) => {
      if (String(devoir.id) !== String(devoirId)) return devoir
      return {
        ...devoir,
        attachments: ensureArray(devoir.attachments).filter((att) => String(att.id) !== String(attachmentId)),
      }
    })

    const updatedSnapshot = saveSnapshot({ ...snapshot, devoirs: nextDevoirs })

    if (!targetDevoir || !removedAttachment) return updatedSnapshot

    const notification = buildNotification({
      title: 'Support retire',
      content: `Le fichier "${removedAttachment.name}" a ete retire du devoir "${targetDevoir.titre}".`,
      type: 'attachment',
      isRead: true,
      userId: targetDevoir.member_id,
      devoirId: targetDevoir.id,
    })

    return saveSnapshotWithNotification(updatedSnapshot, notification)
  },

  sendReminders() {
    const snapshot = ensureSnapshot()
    const now = Date.now()
    const oneDayMs = 24 * 60 * 60 * 1000

    const toRemind = snapshot.devoirs.filter((devoir) => {
      const isDone = devoir.etat === 'termine' || devoir.etat === 'terminé'
      if (isDone || !devoir.deadline) return false
      const ts = new Date(devoir.deadline).getTime()
      return ts >= now && ts <= now + oneDayMs
    })

    if (toRemind.length === 0) {
      const infoNotification = {
        id: newId(),
        title: 'Aucun rappel urgent',
        content: 'Aucun devoir a relancer dans les prochaines 24h.',
        type: 'info',
        is_read: true,
        user_id: 'admin-mock',
        devoir_id: null,
        created_at: nowIso(),
      }

      const updated = saveSnapshot({
        ...snapshot,
        notifications: [infoNotification, ...snapshot.notifications],
      })

      return { snapshot: updated, addedCount: 0 }
    }

    const memberById = new Map(snapshot.members.map((member) => [member.id, member]))

    const newNotifications = toRemind.map((devoir) => {
      const member = memberById.get(devoir.member_id)
      return {
        id: newId(),
        title: 'Rappel envoye',
        content: `Rappel: "${devoir.titre}" arrive ${member ? `pour ${member.name}` : 'bientot'}.`,
        type: 'reminder',
        is_read: false,
        user_id: devoir.member_id,
        devoir_id: devoir.id,
        created_at: nowIso(),
      }
    })

    const updated = saveSnapshot({
      ...snapshot,
      notifications: [...newNotifications, ...snapshot.notifications],
      remindersSent: snapshot.remindersSent + newNotifications.length,
    })

    return { snapshot: updated, addedCount: newNotifications.length }
  },

  markNotificationAsRead(notificationId) {
    const snapshot = ensureSnapshot()
    const nextNotifications = snapshot.notifications.map((notification) =>
      String(notification.id) === String(notificationId)
        ? { ...notification, is_read: true }
        : notification,
    )

    return saveSnapshot({ ...snapshot, notifications: nextNotifications })
  },

  markAllNotificationsAsRead() {
    const snapshot = ensureSnapshot()
    const nextNotifications = snapshot.notifications.map((notification) => ({ ...notification, is_read: true }))
    return saveSnapshot({ ...snapshot, notifications: nextNotifications })
  },

  deleteNotification(notificationId) {
    const snapshot = ensureSnapshot()
    const nextNotifications = snapshot.notifications.filter(
      (notification) => String(notification.id) !== String(notificationId),
    )

    return saveSnapshot({ ...snapshot, notifications: nextNotifications })
  },

  getDevoirComputedState,
  filterAndSortDevoirs,
  formatDateFR,
  formatBytes,
}
