import seedData from './dataAdmin.json'

const USERS_KEY = 'studysquad_users'
const SESSION_KEY = 'studysquad_session'

function getSeedUsers() {
  return [
    {
      id: String(seedData.user.id),
      name: seedData.user.name,
      email: seedData.user.email,
      password: seedData.user.password,
      role: seedData.user.role,
      level: 'N/A',
    },
    {
      id: String(seedData.client.id),
      name: seedData.client.name,
      email: seedData.client.email,
      password: seedData.client.password,
      role: 'student',
      level: 'L2',
    },
  ]
}

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

function sanitizeUser(user) {
  const { password, ...safeUser } = user
  return safeUser
}

function ensureUsers() {
  const existing = readStorage(USERS_KEY, null)
  if (existing && Array.isArray(existing) && existing.length > 0) return existing
  const seeded = getSeedUsers()
  writeStorage(USERS_KEY, seeded)
  return seeded
}

export const authService = {
  getCurrentUser() {
    const users = ensureUsers()
    const session = readStorage(SESSION_KEY, null)
    if (!session?.userId) return null
    const user = users.find((candidate) => candidate.id === session.userId)
    return user ? sanitizeUser(user) : null
  },

  login({ email, password }) {
    const users = ensureUsers()
    const user = users.find(
      (candidate) =>
        candidate.email.toLowerCase() === email.toLowerCase() &&
        candidate.password === password,
    )
    if (!user) {
      throw new Error('Email ou mot de passe incorrect.')
    }
    writeStorage(SESSION_KEY, { userId: user.id })
    return sanitizeUser(user)
  },

  signup({ name, email, password, level }) {
    const users = ensureUsers()
    const alreadyExists = users.some(
      (candidate) => candidate.email.toLowerCase() === email.toLowerCase(),
    )
    if (alreadyExists) {
      throw new Error('Un compte avec cet email existe deja.')
    }

    const nextUser = {
      id: String(Date.now()),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: 'student',
      level: level || 'N/A',
    }

    const updatedUsers = [...users, nextUser]
    writeStorage(USERS_KEY, updatedUsers)
    writeStorage(SESSION_KEY, { userId: nextUser.id })
    return sanitizeUser(nextUser)
  },

  logout() {
    localStorage.removeItem(SESSION_KEY)
  },
}
