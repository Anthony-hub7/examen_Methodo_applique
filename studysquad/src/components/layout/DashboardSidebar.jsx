import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function DashboardSidebar({ roleLabel }) {
  const { user } = useAuth()
  const location = useLocation()

  const basePath = user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/student'
  const isActive = (path) => location.pathname === path

  return (
    <aside className="w-full max-w-xs border-r border-white/10 bg-[#121212] p-4 text-white md:min-h-screen">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wide text-white/50">Navigation</p>
        <h2 className="mt-1 text-lg font-semibold">{roleLabel}</h2>
      </div>

      <nav className="space-y-2">
        <Link
          to={basePath}
          className={
            'block w-full rounded-lg border px-3 py-2 text-left text-sm font-medium ' +
            (isActive(basePath) ? 'border-white/20 bg-white/10 text-white' : 'border-white/10 bg-white/5 text-white/90')
          }
        >
          Accueil
        </Link>
        <Link
          to={`${basePath}/community`}
          className={
            'block w-full rounded-lg border px-3 py-2 text-left text-sm font-medium ' +
            (isActive(`${basePath}/community`)
              ? 'border-white/20 bg-white/10 text-white'
              : 'border-white/10 bg-white/5 text-white/90')
          }
        >
          Communauté
        </Link>
      </nav>
    </aside>
  )
}
