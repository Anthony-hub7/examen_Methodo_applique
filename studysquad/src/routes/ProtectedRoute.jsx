import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// export default function ProtectedRoute({ children, allowedRoles }) {
//   const { user, isAuthenticated } = useAuth()

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />
//   }

//   if (allowedRoles && !allowedRoles.includes(user.role)) {
//     const target = user.role === 'admin' ? '/dashboard/admin' : '/dashboard/student'
//     return <Navigate to={target} replace />
//   }

//   return children
// }
// export default function ProtectedRoute({ children }) {
//   const { user, loading } = useAuth()

//   if (loading) return <div>Loading...</div>

//   if (!user) return <Navigate to="/login" />
  

//   return children
// }

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" />

  // Il faut que 'user' possède une propriété role (ex: via la table members)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
     return <Navigate to="/" replace />
  }

  return children
}