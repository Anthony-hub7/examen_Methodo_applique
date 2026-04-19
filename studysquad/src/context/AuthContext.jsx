// // import { createContext, useMemo, useState } from 'react'
// // import { authService } from '../services/authService'

// // export const AuthContext = createContext(undefined)

// // export function AuthProvider({ children }) {
// //   const [user, setUser] = useState(() => authService.getCurrentUser())

// //   const value = useMemo(
// //     () => ({
// //       user,
// //       isAuthenticated: Boolean(user),
// //       login: async (payload) => {
// //         const nextUser = authService.login(payload)
// //         setUser(nextUser)
// //         return nextUser
// //       },
// //       signup: async (payload) => {
// //         const nextUser = authService.signup(payload)
// //         setUser(nextUser)
// //         return nextUser
// //       },
// //       logout: () => {
// //         authService.logout()
// //         setUser(null)
// //       },
// //     }),
// //     [user],
// //   )

// //   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
// // }
// import { createContext, useContext, useEffect, useState } from 'react'
// import { supabase } from '../services/supabaseClient'

// export const AuthContext = createContext(null)

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     // récupérer session au chargement
//     supabase.auth.getSession().then(({ data }) => {
//       setUser(data.session?.user ?? null)
//       setLoading(false)
//     })

//     // écouter les changements
//     const { data: listener } = supabase.auth.onAuthStateChange(
//       (_event, session) => {
//         setUser(session?.user ?? null)
//       }
//     )

//     return () => listener.subscription.unsubscribe()
//   }, [])

//   const login = async ({ email, password }) => {
//     const { data, error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     })

//     if (error) throw error

//     setUser(data.user)
//     return data.user
//   }

//   const logout = async () => {
//     await supabase.auth.signOut()
//     setUser(null)
//   }

//   const value = {
//     user,
//     isAuthenticated: !!user,
//     loading,
//     login,
//     logout,
//   }

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   )
// }

import { createContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  /**
   * Récupère le rôle d'un utilisateur dans la table 'members'
   */
  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('role')
        .eq('id', userId)
        .maybeSingle()

      if (error) throw error
      return data?.role || 'student' // Par défaut 'student' si non trouvé
    } catch (err) {
      console.error("Erreur lors de la récupération du rôle:", err)
      return 'student'
    }
  }

  useEffect(() => {
    // 1. Vérifier la session existante au chargement de l'app
    const initializeAuth = async () => {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const role = await fetchUserRole(session.user.id)
        setUser({ ...session.user, role })
      } else {
        setUser(null)
      }
      setLoading(false)
    }

    initializeAuth()

    // 2. Écouter les changements d'état (login, logout, token refresh)
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Si on a un utilisateur, on va chercher son rôle
          const role = await fetchUserRole(session.user.id)
          setUser({ ...session.user, role })
        } else {
          // Si déconnexion
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => {
      if (listener?.subscription) {
        listener.subscription.unsubscribe()
      }
    }
  }, [])

  /**
   * Fonction de connexion
   */
  const login = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    
    // Note: Le user sera mis à jour automatiquement par onAuthStateChange
    return data.user
  }

  /**
   * Fonction de déconnexion
   */
  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.error("Erreur déconnexion:", error)
    setUser(null)
  }

  const value = {
    user,
    isAuthenticated: !!user,
    role: user?.role || null, // Accès direct plus simple
    loading,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}