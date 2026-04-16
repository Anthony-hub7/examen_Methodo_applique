const DEFAULT_ROLE = 'student'

export function normalizeRole(role = DEFAULT_ROLE) {
  return role === 'admin' ? 'admin' : 'student'
}

export function getDashboardBasePath(role = DEFAULT_ROLE) {
  return normalizeRole(role) === 'admin' ? '/dashboard/admin' : '/dashboard/student'
}

export function getCommunityPath(role = DEFAULT_ROLE) {
  return `${getDashboardBasePath(role)}/community`
}

export function getDevoirsPath(role = DEFAULT_ROLE) {
  return normalizeRole(role) === 'admin' ? `${getDashboardBasePath(role)}/devoirs` : getDashboardBasePath(role)
}

export function getDashboardLinks(role = DEFAULT_ROLE) {
  return {
    basePath: getDashboardBasePath(role),
    devoirsPath: getDevoirsPath(role),
    communityPath: getCommunityPath(role),
  }
}
