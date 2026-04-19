import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StudentGroupManager from '../../components/groupes/StudentGroupManager'
import { useAuth } from '../../hooks/useAuth'

export default function StudentGroupsPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = async() => {
    await logout()
    navigate('/')
  }

  return (
    <DashboardLayout
      userName={`${user?.name} (${user?.role || 'etudiant'})`}
      roleLabel="Dashboard Etudiant"
      userRole={user?.role}
      onLogout={handleLogout}
    >
      <StudentGroupManager />
    </DashboardLayout>
  )
}
