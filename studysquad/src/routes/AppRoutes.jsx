import { useEffect } from 'react'
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
import { playSong, playTyping, stopTyping } from '@/services/soundManager'
import LofiMiniPlayer from '@/components/ui/LofiMiniPlayer'
import StudentDevoirManager from '@/components/devoirs/StudentDevoirManager'


export default function AppRoutes() {
  useEffect(() => {
    const isTypingTarget = (target) => {
      if (!(target instanceof HTMLElement)) return false
      const tag = target.tagName

      if (tag === 'INPUT' || tag === 'TEXTAREA') return true
      if (target.isContentEditable) return true
      return Boolean(target.closest('#editor-area'))
    }

    let isTypingContext = false

    const handleFocusIn = (event) => {
      if (isTypingTarget(event.target)) {
        isTypingContext = true
      }
    }

    const handleFocusOut = () => {
      requestAnimationFrame(() => {
        isTypingContext = isTypingTarget(document.activeElement)
        if (!isTypingContext) {
          stopTyping()
        }
      })
    }

    const handleInput = (event) => {
      if (isTypingContext || isTypingTarget(event.target)) {
        playTyping()
      }
    }

    document.addEventListener('focusin', handleFocusIn)
    document.addEventListener('focusout', handleFocusOut)
    document.addEventListener('input', handleInput)

    return () => {
      document.removeEventListener('focusin', handleFocusIn)
      document.removeEventListener('focusout', handleFocusOut)
      document.removeEventListener('input', handleInput)
    }
  }, [])

  useEffect(() => {
    const handleClick = (event) => {
      if (!(event.target instanceof Element)) return
      const button = event.target.closest('button')

      if (!button || button.disabled || button.getAttribute('aria-disabled') === 'true') {
        return
      }
      playSong()
    }

    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('click', handleClick)
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
      <LofiMiniPlayer />
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
          path="/dashboard/student/devoirs/create"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDevoirManager />
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
