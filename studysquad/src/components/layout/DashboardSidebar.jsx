import { Link, useLocation } from 'react-router-dom'

export default function DashboardSidebar({ roleLabel, onNavigate }) {
  const location = useLocation()

  const basePath = roleLabel?.toLowerCase().includes('admin') ? '/dashboard/admin' : '/dashboard/student'
  const devoirsPath = roleLabel?.toLowerCase().includes('admin') ? `${basePath}/devoirs` : basePath
  const groupesPath = `${basePath}/groupes`
  const isAdmin = roleLabel?.toLowerCase().includes('admin')
  const normalizePath = (p) => String(p).split('#')[0]
  const isActive = (path) => location.pathname === normalizePath(path)

  const handleNavigate = () => onNavigate?.()

  return (
    <aside className="h-full w-full max-w-xs overflow-y-auto border-r border-white/10 bg-[#121212] p-4 text-white md:min-h-screen">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wide text-white/50">Navigation</p>
        <h2 className="mt-1 text-lg font-semibold">{roleLabel}</h2>
      </div>

      <nav className="space-y-2">
        <Link
          to={basePath}
          onClick={handleNavigate}
          className={
            'block w-full rounded-lg border px-3 py-2 text-left text-sm font-medium ' +
            (isActive(basePath) ? 'border-white/20 bg-white/10 text-white' : 'border-white/10 bg-white/5 text-white/90')
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
                ? 'border-white/20 bg-white/10 text-white'
                : 'border-white/10 bg-white/5 text-white/90')
            }
          >
            Devoirs
          </Link>
        
        {isAdmin && (
          <Link
            to={groupesPath}
            onClick={handleNavigate}
            className={
              'block w-full rounded-lg border px-3 py-2 text-left text-sm font-medium ' +
              (isActive(groupesPath)
                ? 'border-white/20 bg-white/10 text-white'
                : 'border-white/10 bg-white/5 text-white/90')
            }
          >
            Groupes
          </Link>
        )}
        
        <Link
          to={`${basePath}/community`}
          onClick={handleNavigate}
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
