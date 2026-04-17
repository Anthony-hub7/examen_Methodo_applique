// import { createContext, useMemo, useState } from 'react'
// import { authService } from '../services/authService'

// export const AuthContext = createContext(undefined)

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(() => authService.getCurrentUser())

//   const value = useMemo(
//     () => ({
//       user,
//       isAuthenticated: Boolean(user),
//       login: async (payload) => {
//         const nextUser = authService.login(payload)
//         setUser(nextUser)
//         return nextUser
//       },
//       signup: async (payload) => {
//         const nextUser = authService.signup(payload)
//         setUser(nextUser)
//         return nextUser
//       },
//       logout: () => {
//         authService.logout()
//         setUser(null)
//       },
//     }),
//     [user],
//   )

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
// }
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // récupérer session au chargement
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    // écouter les changements
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  const login = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    setUser(data.user)
    return data.user
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}