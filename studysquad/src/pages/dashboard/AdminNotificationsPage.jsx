import { useNavigate } from 'react-router-dom'
import AdminNotificationsManager from '../../components/notifications/AdminNotificationsManager'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAuth } from '../../hooks/useAuth'

export default function AdminNotificationsPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const roleLabel = user?.role === 'admin' ? 'Dashboard Admin' : 'Dashboard Etudiant'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <DashboardLayout
      userName={`${user?.name} (${user?.role || 'user'})`}
      roleLabel={roleLabel}
      userRole={user?.role}
      onLogout={handleLogout}
    >
      <AdminNotificationsManager />
    </DashboardLayout>
  )
}
