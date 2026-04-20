import { useState } from 'react'
import { Icon } from '@iconify/react'
import { AnimatePresence, motion } from 'framer-motion'
import DashboardSidebar from './DashboardSidebar'
import Footer from './Footer'

function normalizeRole(role) {
  return role === 'admin' ? 'admin' : 'student'
}

function buildNavLinks(userRole) {
  const role = normalizeRole(userRole)
  const basePath = role === 'admin' ? '/dashboard/admin' : '/dashboard/student'

  return {
    basePath,
    devoirsPath: `${basePath}/devoirs`,
    groupesPath: `${basePath}/groupes`,
    communityPath: `${basePath}/community`,
  }
}

export default function DashboardLayout({ userName, roleLabel, userRole, onLogout, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const navLinks = buildNavLinks(userRole)

  return (
    <div className="relative min-h-screen overflow-hidden bg-brand-black text-white">
      <video
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/background/background2.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.4),rgba(10,10,10,0.82))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(223,37,49,0.2),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(223,37,49,0.12),transparent_24%)]" />

      <div className="relative z-10 flex min-h-screen flex-col md:flex-row">
        {/* Sidebar desktop */}
        <div className="hidden md:block">
          <DashboardSidebar
            roleLabel={roleLabel}
            navLinks={navLinks}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
          />
        </div>

        {/* Mobile overlay */}
        <AnimatePresence>
          {sidebarOpen ? (
            <motion.div
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            >
              <motion.div
                className="absolute left-0 top-0 h-full w-full max-w-xs"
                initial={{ x: -16, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -16, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
              >
                <DashboardSidebar
                  roleLabel={roleLabel}
                  navLinks={navLinks}
                  onNavigate={() => setSidebarOpen(false)}
                />
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="flex flex-1 flex-col">
          <header className="flex items-center justify-between gap-3 border-b border-white/10 bg-brand-dark/80 px-4 py-3 backdrop-blur-md sm:px-5">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex items-center justify-center rounded-md border border-white/15 bg-brand-soft/70 p-2 text-white md:hidden"
              aria-label="Ouvrir la navigation"
            >
              <Icon icon="solar:hamburger-menu-bold" width={22} />
            </button>

            <span className="min-w-0 flex-1 truncate text-sm text-white/90">{userName}</span>

            <button
              onClick={onLogout}
              className=" border border-brand-red/25 bg-brand-red/[0.08] text-white
              rounded-md bg-brand-red px-3 py-2 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
            >
              Se deconnecter
            </button>
          </header>

          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </div>
    </div>
  )
}
