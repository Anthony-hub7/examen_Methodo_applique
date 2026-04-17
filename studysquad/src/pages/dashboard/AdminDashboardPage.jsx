import { useNavigate } from 'react-router-dom'
import StatsCard from '../../components/dashboard/StatsCard'
import { useAuth } from '../../hooks/useAuth'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { playBye } from '@/services/soundManager'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    playBye()
    logout()
    navigate('/')
  }

  return (
    <DashboardLayout
      userName={`${user?.name} (${user?.role || 'user'})`}
      roleLabel="Dashboard Admin"
      userRole={user?.role}
      onLogout={handleLogout}
    >
      <StatsCard />
    </DashboardLayout>
  )
}
