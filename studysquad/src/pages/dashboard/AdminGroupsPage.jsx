import { useNavigate } from 'react-router-dom'
import AdminGroupManager from '../../components/groupes/AdminGroupManager'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAuth } from '../../hooks/useAuth'

export default function AdminGroupsPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const roleLabel = user?.role === 'admin' ? 'Dashboard Admin' : 'Dashboard Etudiant'

  const handleLogout = async() => {
    await logout()
    navigate('/')
  }

  return (
    <DashboardLayout
      userName={`${user?.name} (${user?.role || 'user'})`}
      roleLabel={roleLabel}
      userRole={user?.role}
      onLogout={handleLogout}
    >
      <AdminGroupManager />
    </DashboardLayout>
  )
}
