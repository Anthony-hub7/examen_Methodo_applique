import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'

// Mocks JSON dynamiques (structure inspirée de ton schéma)
const nowIso = () => new Date().toISOString()
const daysFromNowIso = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()

const mockMembers = [
	{
		id: '7d8d2f8a-3b44-4e5f-a4c2-5a1c3f9d2b10',
		name: 'Amina Diallo',
		email: 'amina@example.com',
		role: 'student',
		niveau_etude: 'Lycée',
		created_at: daysFromNowIso(-200),
	},
	{
		id: '0f3b6b6c-2b12-4f6f-bd8a-e1c1b2d3c4a5',
		name: 'Mehdi Rahman',
		email: 'mehdi@example.com',
		role: 'student',
		niveau_etude: 'Université',
		created_at: daysFromNowIso(-120),
	},
	{
		id: 'c8a1c9f1-1e2a-4c7b-9a3f-1a2b3c4d5e6f',
		name: 'Sarah N.',
		email: 'sarah@example.com',
		role: 'student',
		niveau_etude: 'Licence',
		created_at: daysFromNowIso(-90),
	},
]

const mockGroups = [
	{
		id: '4f0b8a9c-1e7a-4a0d-b3f2-91aa7b0f3c22',
		name: 'Math Nebula',
		description: 'Groupe de revision intensif',
		code_invitation: 'SQ-4T7H',
		created_by: mockMembers[0].id,
		created_at: daysFromNowIso(-150),
	},
	{
		id: '12a6c8f2-0b1a-4c2d-bf88-3a10d9c1b2aa',
		name: 'Physics Redshift',
		description: 'Devoirs de physique & exercices',
		code_invitation: 'SS-PH2X',
		created_by: mockMembers[1].id,
		created_at: daysFromNowIso(-80),
	},
]

const mockDevoirs = [
	{
		id: '3b9f2a11-3c2e-4c2a-bc1d-1e2f3a4b5c6d',
		titre: 'DM - Equations differentes',
		etat: 'en cours',
		sujet: 'Serie 3 (exercices 1 a 6)',
		deadline: daysFromNowIso(1),
		priorite: 'haute',
		group_id: mockGroups[0].id,
		member_id: mockMembers[0].id,
		created_at: daysFromNowIso(-8),
	},
	{
		id: '2a7b6c5d-4e3f-4a1b-8c2d-9e0f1a2b3c4d',
		titre: 'Fiche - Dérivées & limites',
		etat: 'à faire',
		sujet: 'Clarifier les notions',
		deadline: daysFromNowIso(2),
		priorite: 'moyenne',
		group_id: mockGroups[1].id,
		member_id: mockMembers[1].id,
		created_at: daysFromNowIso(-4),
	},
	{
		id: '6c5b4a3f-2d1c-4b3a-9e8f-7d6c5b4a3f2e',
		titre: 'Mini projet - IA & classification',
		etat: 'en cours',
		sujet: 'Ecrire un petit pipeline',
		deadline: daysFromNowIso(-1),
		priorite: 'haute',
		group_id: null,
		member_id: mockMembers[2].id,
		created_at: daysFromNowIso(-20),
	},
	{
		id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
		titre: 'Exercices - Cinematique',
		etat: 'terminé',
		sujet: 'Corrections et recap',
		deadline: daysFromNowIso(-5),
		priorite: 'faible',
		group_id: mockGroups[1].id,
		member_id: mockMembers[0].id,
		created_at: daysFromNowIso(-30),
	},
]

function formatDateFR(iso) {
	if (!iso) return '—'
	const d = new Date(iso)
	return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: '2-digit' })
}

function newId() {
	// En prod (browser) on utilise randomUUID; en dev on fallback sur Math.random.
	if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
	return `mock_${Math.random().toString(16).slice(2)}_${Date.now()}`
}

export default function AdminDevoirManager() {
	const [devoirs, setDevoirs] = useState(mockDevoirs)
	const [members] = useState(mockMembers)
	const [groups] = useState(mockGroups)

	const [filterState, setFilterState] = useState('tous') // tous | en_retard | en_cours | termine
	const [query, setQuery] = useState('')
	const [sortBy, setSortBy] = useState('deadline') // deadline | priorite | created_at
	const [sortOrder, setSortOrder] = useState('asc')

	const [notifications, setNotifications] = useState([])
	const [remindersSent, setRemindersSent] = useState(0)

	const [modalOpen, setModalOpen] = useState(false)
	const [editing, setEditing] = useState(null) // devoir

	const memberById = useMemo(() => new Map(members.map((m) => [m.id, m])), [members])
	const groupById = useMemo(() => new Map(groups.map((g) => [g.id, g])), [groups])

	const computed = (devoir) => {
		const isCompleted = devoir.etat === 'terminé'
		const hasDeadline = !!devoir.deadline
		const now = Date.now()
		const deadlineTs = hasDeadline ? new Date(devoir.deadline).getTime() : null
		const isLate = !isCompleted && deadlineTs !== null && deadlineTs < now

		if (isCompleted) return { label: 'Terminé', pill: 'termine', isCompleted: true, isLate: false }
		if (isLate) return { label: 'En retard', pill: 'en_retard', isCompleted: false, isLate: true }
		if (devoir.etat === 'en cours') return { label: 'En cours', pill: 'en_cours', isCompleted: false, isLate: false }
		// “à faire” => affichage en cours (IHM produit)
		return { label: 'En cours', pill: 'en_cours', isCompleted: false, isLate: false }
	}

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase()

		let list = devoirs.map((d) => ({ ...d, _computed: computed(d) }))

		if (filterState !== 'tous') {
			list = list.filter((d) => d._computed.pill === filterState)
		}

		if (q) {
			list = list.filter((d) => {
				const member = memberById.get(d.member_id)?.name || ''
				const group = d.group_id ? groupById.get(d.group_id)?.name || '' : ''
				return [d.titre, d.sujet || '', member, group].some((x) => x.toLowerCase().includes(q))
			})
		}

		const order = sortOrder === 'asc' ? 1 : -1
		list.sort((a, b) => {
			let av = 0
			let bv = 0

			if (sortBy === 'deadline') {
				av = a.deadline ? new Date(a.deadline).getTime() : Number.POSITIVE_INFINITY
				bv = b.deadline ? new Date(b.deadline).getTime() : Number.POSITIVE_INFINITY
			} else if (sortBy === 'created_at') {
				av = new Date(a.created_at).getTime()
				bv = new Date(b.created_at).getTime()
			} else {
				// priorite: faible < moyenne < haute
				const map = { faible: 0, moyenne: 1, haute: 2 }
				av = map[a.priorite] ?? 0
				bv = map[b.priorite] ?? 0
			}

			return av === bv ? 0 : av > bv ? order : -order
		})

		return list
	}, [devoirs, filterState, query, sortBy, sortOrder, memberById, groupById])

	const openEdit = (devoir) => {
		setEditing({ ...devoir })
		setModalOpen(true)
	}

	const closeEdit = () => {
		setModalOpen(false)
		setEditing(null)
	}

	const applyEdit = () => {
		if (!editing) return
		setDevoirs((prev) => prev.map((d) => (d.id === editing.id ? editing : d)))
		closeEdit()
	}

	const sendReminders = () => {
		const now = Date.now()
		const oneDayMs = 24 * 60 * 60 * 1000

		// Rappel 1 jour avant échéance (et seulement si pas terminé)
		const toRemind = devoirs.filter((d) => {
			if (d.etat === 'terminé') return false
			if (!d.deadline) return false
			const ts = new Date(d.deadline).getTime()
			return ts >= now && ts <= now + oneDayMs
		})

		if (toRemind.length === 0) {
			setNotifications((prev) => [
				{
					id: newId(),
					content: 'Aucun devoir a relancer dans les prochaines 24h.',
					is_read: true,
					user_id: 'admin-mock',
					created_at: nowIso(),
				},
				...prev,
			])
			return
		}

		const newNotifications = toRemind.map((d) => {
			const member = memberById.get(d.member_id)
			return {
				id: newId(),
				content: `Rappel: “${d.titre}” arrive ${member ? `pour ${member.name}` : 'bientot'}.`,
				is_read: false,
				user_id: d.member_id,
				created_at: nowIso(),
			}
		})

		setNotifications((prev) => [...newNotifications, ...prev])
		setRemindersSent((n) => n + newNotifications.length)
	}

	return (
		<div className="w-full flex-1 px-4 py-6 sm:px-6 lg:px-8">
			<div className="mx-auto w-full max-w-6xl">
				{/* Header de section */}
				<div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<h2 className="text-xl font-bold tracking-tight">Gestion des devoirs (Admin)</h2>
						<p className="mt-1 text-sm text-white/70">
							Modes: attribution / réaffectation, suivi (terminé, en retard, en cours) et rappels.
						</p>
					</div>

					<div className="flex flex-wrap gap-2">
						<button
							type="button"
							onClick={sendReminders}
							className="inline-flex items-center gap-2 rounded-xl border border-brand-red/50 bg-brand-red/15 px-4 py-2 text-sm font-semibold text-white transition hover:border-brand-red/80 hover:bg-brand-red/25"
						>
							<Icon icon="solar:siren-bold" width={18} />
							Relancer avec rappels
						</button>

						<div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm">
							<span className="text-white/70">Rappels envoyes:</span>{' '}
							<span className="font-bold text-white">{remindersSent}</span>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* COLONNE GAUCHE: filtres */}
				<aside className="rounded-2xl border border-white/10 bg-white/5 p-4">
					<h3 className="mb-3 text-base font-semibold">Filtres</h3>

					<div className="space-y-3">
						<label className="block">
							<span className="mb-1 block text-sm text-white/75">Recherche</span>
							<input
								type="text"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder="Titre, sujet, membre, groupe..."
								className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/90 outline-none transition focus:border-brand-red/60"
							/>
						</label>

						<label className="block">
							<span className="mb-1 block text-sm text-white/75">Etat (IHM)</span>
							<select
								value={filterState}
								onChange={(e) => setFilterState(e.target.value)}
								className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/90 outline-none transition focus:border-brand-red/60"
							>
								<option value="tous">Tous</option>
								<option value="en_retard">En retard</option>
								<option value="en_cours">En cours</option>
								<option value="termine">Terminé</option>
							</select>
						</label>

						<div className="grid grid-cols-2 gap-3">
							<label className="block">
								<span className="mb-1 block text-sm text-white/75">Trier</span>
								<select
									value={sortBy}
									onChange={(e) => setSortBy(e.target.value)}
									className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/90 outline-none transition focus:border-brand-red/60"
								>
									<option value="deadline">Deadline</option>
									<option value="priorite">Priorité</option>
									<option value="created_at">Créé</option>
								</select>
							</label>
							<label className="block">
								<span className="mb-1 block text-sm text-white/75">Ordre</span>
								<select
									value={sortOrder}
									onChange={(e) => setSortOrder(e.target.value)}
									className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/90 outline-none transition focus:border-brand-red/60"
								>
									<option value="asc">Asc</option>
									<option value="desc">Desc</option>
								</select>
							</label>
						</div>
					</div>

					<div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
						<p className="text-xs font-semibold text-white/90">Note</p>
						<p className="mt-1 text-xs text-white/70">
							Les devoirs en “à faire” s affichent en “en cours” pour simplifier la lecture produit.
						</p>
					</div>
				</aside>

				{/* COLONNE CENTRALE: liste */}
				<section className="rounded-2xl border border-white/10 bg-white/5 p-4 lg:col-span-2">
					<div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
						<h3 className="text-base font-semibold">Voir tous les devoirs</h3>
						<div className="text-sm text-white/70">
							{filtered.length} devoir{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}
						</div>
					</div>

					{/* Liste */}
					<div className="space-y-3">
						{filtered.length === 0 ? (
							<div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-center text-sm text-white/70">
								Aucun devoir ne correspond aux filtres.
							</div>
						) : null}

						{filtered.map((d) => {
							const computedState = d._computed
							const member = memberById.get(d.member_id)
							const group = d.group_id ? groupById.get(d.group_id) : null

							const pillClass =
								computedState.pill === 'termine'
									? 'border-green-500/50 bg-green-500/10 text-green-100'
									: computedState.pill === 'en_retard'
										? 'border-brand-red/60 bg-brand-red/15 text-brand-red'
										: 'border-brand-red/30 bg-white/5 text-white'

							return (
								<motion.article
									key={d.id}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.25 }}
									className="rounded-2xl border border-white/10 bg-black/20 p-4"
								>
									<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
										<div className="min-w-0">
											<div className="flex flex-wrap items-center gap-2">
												<h4 className="truncate text-base font-semibold text-white/95">{d.titre}</h4>
												<span
													className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${pillClass}`}
												>
													<Icon icon="solar:bolt-circle-bold" width={14} />
													{computedState.label}
												</span>
												<span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
													Priorite: <b className="ml-1 text-white/90">{d.priorite}</b>
												</span>
											</div>

											<div className="mt-2 text-sm text-white/75">
												Assigné a: <b className="text-white/95">{member?.name || '—'}</b>
												{group ? (
													<>
														{' '}
														• Groupe: <b className="text-white/95">{group.name}</b>
													</>
												) : (
													<> • Mode solo</>
												)}
											</div>

											<div className="mt-1 text-sm text-white/70">
												Deadline: <b className="text-white/90">{formatDateFR(d.deadline)}</b>
											</div>
										</div>

										<div className="flex flex-wrap gap-2">
											<button
												type="button"
												onClick={() => openEdit(d)}
												className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white transition hover:border-brand-red/60 hover:bg-brand-red/10"
											>
												<Icon icon="solar:pen-bold" width={18} />
												Attribuer / Reaffecter
											</button>

											<button
												type="button"
												onClick={() =>
													setDevoirs((prev) =>
														prev.map((x) => (x.id === d.id ? { ...x, etat: 'terminé' } : x))
													)
												}
												className="inline-flex items-center gap-2 rounded-xl bg-brand-red px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90"
											>
												<Icon icon="solar:check-read-bold" width={18} />
												Marquer terminé
											</button>
										</div>
									</div>
								</motion.article>
							)
						})}
					</div>
				</section>
			</div>

			{/* Historique des rappels */}
			<section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
				<div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					<h3 className="text-base font-semibold">Notifications / Rappels</h3>
					<div className="text-sm text-white/70">Dernieres notifications (mock)</div>
				</div>

				<div className="max-h-72 overflow-y-auto pr-1">
					{notifications.length === 0 ? (
						<div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-center text-sm text-white/70">
							Aucune notification pour le moment. Clique sur “Relancer avec rappels”.
						</div>
					) : null}

					<ul className="space-y-2">
						{notifications.slice(0, 10).map((n) => (
							<li
								key={n.id}
								className="flex flex-col gap-1 rounded-xl border border-white/10 bg-black/20 p-3 sm:flex-row sm:items-center sm:justify-between"
							>
								<div className="min-w-0">
									<p className="truncate text-sm font-semibold text-white/90">{n.content}</p>
									<p className="text-xs text-white/60">{new Date(n.created_at).toLocaleString('fr-FR')}</p>
								</div>
								<span
									className={
										n.is_read
											? 'rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70'
											: 'rounded-full border border-brand-red/50 bg-brand-red/15 px-3 py-1 text-xs font-semibold text-brand-red'
									}
								>
									{n.is_read ? 'Lu' : 'Non lu'}
								</span>
							</li>
						))}
					</ul>
				</div>
			</section>

			{/* Modal attribution */}
			<AnimatePresence>
				{modalOpen && editing ? (
					<motion.div
						className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={closeEdit}
					>
						<motion.div
							className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f0f] shadow-2xl"
							initial={{ y: 16, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							exit={{ y: 16, opacity: 0 }}
							transition={{ duration: 0.2 }}
							onClick={(e) => e.stopPropagation()}
						>
							<div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
								<div className="min-w-0">
									<p className="truncate text-sm font-semibold text-white/95">Attribuer / Réaffecter</p>
									<p className="truncate text-xs text-white/60">{editing.titre}</p>
								</div>
								<button
									type="button"
									onClick={closeEdit}
									className="rounded-xl border border-white/15 bg-white/5 p-2 text-white/80 transition hover:border-brand-red/60 hover:text-white"
									aria-label="Fermer"
								>
									<Icon icon="solar:close-circle-bold" width={22} />
								</button>
							</div>

							<div className="grid grid-cols-1 gap-4 p-4 sm:p-6 md:grid-cols-2">
								<label className="block">
									<span className="mb-1 block text-sm text-white/75">Membre</span>
									<select
										value={editing.member_id}
										onChange={(e) => setEditing((prev) => ({ ...prev, member_id: e.target.value }))}
										className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/90 outline-none transition focus:border-brand-red/60"
									>
										{members.map((m) => (
											<option key={m.id} value={m.id}>
												{m.name}
											</option>
										))}
									</select>
								</label>

								<label className="block">
									<span className="mb-1 block text-sm text-white/75">Mode</span>
									<select
										value={editing.group_id ? editing.group_id : 'solo'}
										onChange={(e) => {
											const v = e.target.value
											setEditing((prev) => ({ ...prev, group_id: v === 'solo' ? null : v }))
										}}
										className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/90 outline-none transition focus:border-brand-red/60"
									>
										<option value="solo">Solo (sans groupe)</option>
										{groups.map((g) => (
											<option key={g.id} value={g.id}>
												Groupe: {g.name}
											</option>
										))}
									</select>
								</label>

								<label className="block">
									<span className="mb-1 block text-sm text-white/75">Etat</span>
									<select
										value={editing.etat}
										onChange={(e) => setEditing((prev) => ({ ...prev, etat: e.target.value }))}
										className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/90 outline-none transition focus:border-brand-red/60"
									>
										<option value="à faire">à faire</option>
										<option value="en cours">en cours</option>
										<option value="terminé">terminé</option>
									</select>
								</label>

								<label className="block">
									<span className="mb-1 block text-sm text-white/75">Priorité</span>
									<select
										value={editing.priorite}
										onChange={(e) => setEditing((prev) => ({ ...prev, priorite: e.target.value }))}
										className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/90 outline-none transition focus:border-brand-red/60"
									>
										<option value="faible">faible</option>
										<option value="moyenne">moyenne</option>
										<option value="haute">haute</option>
									</select>
								</label>

								<label className="block md:col-span-2">
									<span className="mb-1 block text-sm text-white/75">Sujet</span>
									<input
										type="text"
										value={editing.sujet || ''}
										onChange={(e) => setEditing((prev) => ({ ...prev, sujet: e.target.value }))}
										placeholder="Ex: serie 3, chapitre ..."
										className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/90 outline-none transition focus:border-brand-red/60"
									/>
								</label>

								<label className="block">
									<span className="mb-1 block text-sm text-white/75">Deadline</span>
									<input
										type="date"
										value={editing.deadline ? editing.deadline.slice(0, 10) : ''}
										onChange={(e) => {
											const v = e.target.value
											setEditing((prev) => ({
												...prev,
												deadline: v ? new Date(`${v}T12:00:00Z`).toISOString() : null,
											}))
										}}
										className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/90 outline-none transition focus:border-brand-red/60"
									/>
								</label>

								<div className="rounded-2xl border border-white/10 bg-black/20 p-4 md:col-span-1">
									<p className="text-xs uppercase tracking-wide text-white/55">Aperçu état</p>
									<p className="mt-2 text-sm font-semibold text-white/95">
										{(() => {
											const tmp = { ...editing }
											const isCompleted = tmp.etat === 'terminé'
											const deadlineTs = tmp.deadline ? new Date(tmp.deadline).getTime() : null
											const isLate = !isCompleted && deadlineTs !== null && deadlineTs < Date.now()
											if (isCompleted) return 'Terminé'
											if (isLate) return 'En retard'
											return 'En cours'
										})()}
									</p>
									<p className="mt-1 text-xs text-white/70">
										Deadline: <b className="text-white/90">{formatDateFR(editing.deadline)}</b>
									</p>
								</div>
							</div>

							<div className="flex flex-col gap-2 border-t border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
								<button
									type="button"
									onClick={closeEdit}
									className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 transition hover:border-brand-red/60"
								>
									Annuler
								</button>
								<button
									type="button"
									onClick={applyEdit}
									className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-red px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
								>
									<Icon icon="solar:check-read-bold" width={18} />
									Enregistrer
								</button>
							</div>
						</motion.div>
					</motion.div>
				) : null}
			</AnimatePresence>
			</div>
		</div>
	)
}

