import { playSong } from '@/services/soundManager'
import { Link, useLocation } from 'react-router-dom'

export default function DashboardSidebar({ roleLabel, navLinks, onNavigate }) {
  const location = useLocation()

  const basePath = navLinks?.basePath || '/dashboard/student'
  const devoirsPath = navLinks?.devoirsPath || basePath
  const groupesPath = navLinks?.groupesPath || `${basePath}/groupes`
  const communityPath = navLinks?.communityPath || `${basePath}/community`
  const normalizePath = (p) => String(p).split('#')[0]
  const isActive = (path) => location.pathname === normalizePath(path)

  const handleNavigate = () => {
    playSong()
    onNavigate?.()
  }

  return (
    <aside className="h-full w-full max-w-xs overflow-y-auto border-r border-white/10 bg-brand-dark/80 p-4 text-white backdrop-blur-md md:min-h-screen">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.22em] text-brand-red/70">Navigation</p>
        <h2 className="mt-1 text-lg font-semibold">{roleLabel}</h2>
      </div>

      <nav className="space-y-2">
        <Link
          to={basePath}
          onClick={handleNavigate}
          className={
            'block w-full rounded-lg border px-3 py-2 text-left text-sm font-medium ' +
            (isActive(basePath)
              ? 'border-brand-red/50 bg-brand-red/15 text-white shadow-glow'
              : 'border-white/10 bg-brand-soft/65 text-white/90 hover:border-brand-red/30 hover:bg-brand-soft/85')
          }
        >
          Accueil
        </Link>
        
          <Link
            to={devoirsPath}
            onClick={handleNavigate}
            className={
              'block w-full rounded-lg border px-3 py-2 text-left text-sm font-medium ' +
              (isActive(devoirsPath)
                ? 'border-brand-red/50 bg-brand-red/15 text-white shadow-glow'
                : 'border-white/10 bg-brand-soft/65 text-white/90 hover:border-brand-red/30 hover:bg-brand-soft/85')
            }
          >
            Devoirs
          </Link>
        
        <Link
          to={groupesPath}
          onClick={handleNavigate}
          className={
            'block w-full rounded-lg border px-3 py-2 text-left text-sm font-medium ' +
            (isActive(groupesPath)
              ? 'border-brand-red/50 bg-brand-red/15 text-white shadow-glow'
              : 'border-white/10 bg-brand-soft/65 text-white/90 hover:border-brand-red/30 hover:bg-brand-soft/85')
          }
        >
          Groupes
        </Link>
        
        <Link
          to={communityPath}
          onClick={handleNavigate}
          className={
            'block w-full rounded-lg border px-3 py-2 text-left text-sm font-medium ' +
            (isActive(communityPath)
              ? 'border-brand-red/50 bg-brand-red/15 text-white shadow-glow'
              : 'border-white/10 bg-brand-soft/65 text-white/90 hover:border-brand-red/30 hover:bg-brand-soft/85')
          }
        >
          Communauté
        </Link>
        
      </nav>
    </aside>
  )
}
