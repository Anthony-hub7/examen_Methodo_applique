import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Login from '../pages/auth/Login'
import Signup from '../pages/auth/Signup'
import Landing from '../pages/landing/LandingPage'
import StatsCard from '../components/dashboard/StatsCard'
import ClientDash from '../components/dashboard/ClientDash'

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signin" element={<Signup />} />
		<Route path="/card" element={<StatsCard />} />
		<Route path="/clientDash" element={<ClientDash />} />
      </Routes>
    </BrowserRouter>
  )
}
