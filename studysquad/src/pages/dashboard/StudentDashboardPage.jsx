import { useNavigate } from 'react-router-dom'
import ClientDash from '../../components/dashboard/ClientDash'
import { useAuth } from '../../hooks/useAuth'
import DashboardLayout from '../../components/layout/DashboardLayout'

export default function StudentDashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <DashboardLayout
      userName={`${user?.name} (${user?.role || 'etudiant'})`}
      roleLabel="Dashboard Etudiant"
      userRole={user?.role}
      onLogout={handleLogout}
    >
      <ClientDash />
    </DashboardLayout>
  )
}
