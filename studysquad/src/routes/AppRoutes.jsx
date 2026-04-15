
import React from 'react'
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom'
import { Icon } from '@iconify/react'
import LandingPage from '../pages/landing/LandingPage'

function PlaceholderPage({ title, subtitle }) {
	return (
		<div className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
			<div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
				<Icon icon="solar:rocket-2-bold" width={40} className="mx-auto mb-4 text-[#df2531]" />
				<h1 className="text-3xl font-bold">{title}</h1>
				<p className="mt-3 text-white/75">{subtitle}</p>
			</div>
		</div>
	)
}

export default function AppRoutes() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<LandingPage />} />
				<Route
					path="/login"
					element={<PlaceholderPage title="Connexion StudySquad" subtitle="L ecran de connexion arrive juste apres la landing page." />}
				/>
				<Route
					path="/signup"
					element={<PlaceholderPage title="Inscription StudySquad" subtitle="Le formulaire d inscription sera connecte ensuite." />}
				/>
				<Route
					path="/dashboard"
					element={<PlaceholderPage title="Tableau de bord" subtitle="Visualise devoirs a venir, retards, termines et demandes d aide SOS." />}
				/>
				<Route
					path="/groups"
					element={<PlaceholderPage title="Gestion des groupes" subtitle="Creation, invitation et collaboration de groupe." />}
				/>
				<Route
					path="/chat"
					element={<PlaceholderPage title="Chat de groupe" subtitle="Echanges rapides entre membres pour avancer sur les devoirs." />}
				/>
				<Route
					path="/profile"
					element={<PlaceholderPage title="Profil utilisateur" subtitle="Parametres et progression personnelle." />}
				/>
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</Router>
	)
}
