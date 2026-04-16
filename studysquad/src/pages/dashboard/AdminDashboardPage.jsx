import { useNavigate } from 'react-router-dom'
import StatsCard from '../../components/dashboard/StatsCard'
import { useAuth } from '../../hooks/useAuth'
import DashboardLayout from '../../components/layout/DashboardLayout'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <DashboardLayout userName={`${user?.name} (admin)`} roleLabel="Dashboard Admin" onLogout={handleLogout}>
      <StatsCard />
    </DashboardLayout>
  )
}
