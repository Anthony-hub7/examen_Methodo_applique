import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Login from '../pages/auth/Login'
import Signup from '../pages/auth/Signup'
import Landing from '../pages/landing/LandingPage'
import AdminDashboardPage from '../pages/dashboard/AdminDashboardPage'
import AdminDevoirsPage from '../pages/dashboard/AdminDevoirsPage'
import AdminGroupsPage from '../pages/dashboard/AdminGroupsPage'
import StudentDashboardPage from '../pages/dashboard/StudentDashboardPage'
import StudentDevoirsPage from '../pages/dashboard/StudentDevoirsPage'
import StudentGroupsPage from '../pages/dashboard/StudentGroupsPage'
import CommunityPage from '../pages/CommunityPage'
import ProtectedRoute from './ProtectedRoute'
import PublicOnlyRoute from './PublicOnlyRoute'
// dans App.jsx ou layout
import { useEffect } from 'react'
import { playTyping, stopTyping, playSong } from '@/services/soundManager' 

export default function AppRoutes() {
//   useEffect(() => {
//   let isFocused = false

//   const handleFocus = (e) => {
//     if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
//       isFocused = true
//     }
//   }

//   const handleBlur = () => {
//     isFocused = false
//     stopTyping()
//   }

//   const handleInput = () => {
//     if (isFocused) {
//       playTyping()
//     }
//   }

//   document.addEventListener('focusin', handleFocus)
//   document.addEventListener('focusout', handleBlur)
//   document.addEventListener('input', handleInput)

//   return () => {
//     document.removeEventListener('focusin', handleFocus)
//     document.removeEventListener('focusout', handleBlur)
//     document.removeEventListener('input', handleInput)
//   }
// }, [])

useEffect(() => {
  let isFocused = false
  let inEditor = false

  const editorDiv = document.getElementById('editor-area')

  const handleFocus = (e) => {
    const tag = e.target.tagName

    if (tag === 'INPUT' || tag === 'TEXTAREA') {
      isFocused = true
    }

    if (editorDiv?.contains(e.target)) {
      inEditor = true
    }
  }

  const handleBlur = () => {
    isFocused = false
    inEditor = false
    stopTyping()
  }

  const handleInput = () => {
    if (isFocused || inEditor) {
      playTyping()
    }
  }

  document.addEventListener('focusin', handleFocus)
  document.addEventListener('focusout', handleBlur)
  document.addEventListener('input', handleInput)

  return () => {
    document.removeEventListener('focusin', handleFocus)
    document.removeEventListener('focusout', handleBlur)
    document.removeEventListener('input', handleInput)
  }
}, [])

useEffect(() => {
  const handler = (e) => {
    const el = e.target

    if (el.tagName === 'BUTTON') {
      playSong()
    }
  }

  document.addEventListener('click', handler)

  return () => document.removeEventListener('click', handler)
}, [])

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
          path="/dashboard/admin/groupes"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminGroupsPage />
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
          path="/dashboard/student/devoirs"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDevoirsPage />
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
        <Route
          path="/dashboard/student/groupes"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentGroupsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
