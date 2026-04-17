import seedData from './dataAdmin.json'

const STORAGE_KEY = 'studysquad_group_chat'

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

function nowIso() {
  return new Date().toISOString()
}

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `chat_${Math.random().toString(16).slice(2)}_${Date.now()}`
}

function normalizeMessage(raw) {
  if (!raw || typeof raw !== 'object') return null

  const message = String(raw.message || '').trim()
  if (!message) return null

  return {
    id: raw.id ? String(raw.id) : newId(),
    message,
    group_id: raw.group_id ? String(raw.group_id) : '',
    member_id: raw.member_id ? String(raw.member_id) : '',
    created_at: String(raw.created_at || nowIso()),
  }
}

function buildSeedSnapshot() {
  return {
    messages: ensureArray(seedData?.adminDevoirs?.chat).map((item) => normalizeMessage(item)).filter(Boolean),
  }
}

function ensureSnapshot() {
  const existing = readStorage(STORAGE_KEY, null)
  if (existing && typeof existing === 'object') {
    const snapshot = {
      messages: ensureArray(existing.messages).map((item) => normalizeMessage(item)).filter(Boolean),
    }
    writeStorage(STORAGE_KEY, snapshot)
    return snapshot
  }

  const seeded = buildSeedSnapshot()
  writeStorage(STORAGE_KEY, seeded)
  return seeded
}

function saveSnapshot(snapshot) {
  writeStorage(STORAGE_KEY, snapshot)
  return snapshot
}

function sortMessages(messages) {
  return [...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
}

export const chatService = {
  getSnapshot() {
    return ensureSnapshot()
  },

  getMessagesByGroup(groupId) {
    const snapshot = ensureSnapshot()
    return sortMessages(snapshot.messages.filter((message) => String(message.group_id) === String(groupId)))
  },

  sendMessage({ groupId, memberId, message }) {
    const safeMessage = String(message || '').trim()
    if (!groupId) throw new Error('Le groupe du chat est introuvable.')
    if (!memberId) throw new Error("L'auteur du message est introuvable.")
    if (!safeMessage) throw new Error('Le message ne peut pas etre vide.')

    const snapshot = ensureSnapshot()
    const nextMessage = {
      id: newId(),
      message: safeMessage,
      group_id: String(groupId),
      member_id: String(memberId),
      created_at: nowIso(),
    }

    return saveSnapshot({
      ...snapshot,
      messages: [...snapshot.messages, nextMessage],
    })
  },
}
