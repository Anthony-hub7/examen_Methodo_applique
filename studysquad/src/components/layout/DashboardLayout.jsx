import { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { AnimatePresence, motion } from 'framer-motion'
import DashboardSidebar from './DashboardSidebar'
import Footer from './Footer'
import { getDashboardLinks, normalizeRole } from '../../routes/paths'
import { supabase } from '../../../src/services/supabaseClient'


export default function DashboardLayout({ userName, roleLabel, userRole, onLogout, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const role = normalizeRole(userRole)
  const navLinks = getDashboardLinks(role)

  const [user, setUser] = useState(null)
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()
  }, [])

  const [roles, setRole] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
    // alert(user);
    useEffect(() => {
  const fetchProfile = async () => {
    if (!user?.id) return

    setLoadingProfile(true)

    const { data, error } = await supabase
      .from('members')
      .select('role, name')
      .eq('id', user.id)
      .single()

    if (!error && data) {
      setProfile(data.name)
      setRole(data.role)
      console.log(data);
    }

    setLoadingProfile(false)
  }

  fetchProfile()
}, [user?.id])

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex min-h-screen flex-col md:flex-row">
        {/* Sidebar desktop */}
        <div className="hidden md:block">
          <DashboardSidebar roleLabel={roleLabel} navLinks={navLinks} />
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
                <DashboardSidebar roleLabel={roleLabel} navLinks={navLinks} onNavigate={() => setSidebarOpen(false)} />
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="flex flex-1 flex-col">
          <header className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#121212] px-4 py-3 sm:px-5">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex items-center justify-center rounded-md border border-white/15 bg-white/5 p-2 text-white md:hidden"
              aria-label="Ouvrir la navigation"
            >
              <Icon icon="solar:hamburger-menu-bold" width={22} />
            </button>

            <span className="min-w-0 flex-1 truncate text-sm text-white/90">{profile} {roles}</span>

            <button
              onClick={onLogout}
              className="rounded-md bg-brand-red px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90"
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
