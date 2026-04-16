import { createContext, useMemo, useState } from 'react'
import { authService } from '../services/authService'

export const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser())

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login: async (payload) => {
        const nextUser = authService.login(payload)
        setUser(nextUser)
        return nextUser
      },
      signup: async (payload) => {
        const nextUser = authService.signup(payload)
        setUser(nextUser)
        return nextUser
      },
      logout: () => {
        authService.logout()
        setUser(null)
      },
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
