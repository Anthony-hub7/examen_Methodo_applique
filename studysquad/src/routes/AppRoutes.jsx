
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import LoginForm from '../components/auth/LoginForm'
import SignupForm from '../components/auth/SignupForm'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import Dashboard from '../pages/Dashboard'
import Chat from '../pages/Chat'
import Groups from '../pages/Groups'
import Profile from '../pages/Profile'
import NotFound from '../pages/NotFound'

export default function AppRoutes() {
	return (
		<Router>
			<AuthProvider>
				<Routes>
					<Route path="/login" element={<LoginForm />} />
					<Route path="/signup" element={<SignupForm />} />

					<Route
						path="/"
						element={
							<ProtectedRoute>
								<Dashboard />
							</ProtectedRoute>
						}
					/>

					<Route
						path="/chat"
						element={
							<ProtectedRoute>
								<Chat />
							</ProtectedRoute>
						}
					/>

					<Route
						path="/groups"
						element={
							<ProtectedRoute>
								<Groups />
							</ProtectedRoute>
						}
					/>

					<Route
						path="/profile"
						element={
							<ProtectedRoute>
								<Profile />
							</ProtectedRoute>
						}
					/>

					<Route path="*" element={<NotFound />} />
				</Routes>
			</AuthProvider>
		</Router>
	)
}
