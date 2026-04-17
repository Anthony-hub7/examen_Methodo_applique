import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// export default function PublicOnlyRoute({ children }) {
//   const { user, isAuthenticated } = useAuth()
  
//   if (!isAuthenticated) return children
//   return <Navigate to={user.role === 'admin' ? '/dashboard/admin' : '/dashboard/student'} replace />
// }
export default function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>

  if (!user) return children

  return <Navigate to="/dashboard/student" replace />
}