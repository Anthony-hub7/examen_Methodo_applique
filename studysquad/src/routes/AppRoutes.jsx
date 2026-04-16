import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Login from '../pages/auth/Login'
import Signup from '../pages/auth/Signup'
import Landing from '../pages/landing/LandingPage'
import AdminDashboardPage from '../pages/dashboard/AdminDashboardPage'
import AdminDevoirsPage from '../pages/dashboard/AdminDevoirsPage'
import StudentDashboardPage from '../pages/dashboard/StudentDashboardPage'
import CommunityPage from '../pages/dashboard/CommunityPage'
import ProtectedRoute from './ProtectedRoute'
import PublicOnlyRoute from './PublicOnlyRoute'

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/signin"
          element={
            <PublicOnlyRoute>
              <Signup />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/community"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <CommunityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/devoirs"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDevoirsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/student"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/student/community"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <CommunityPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
