export default function DashboardSidebar({ roleLabel }) {
  return (
    <aside className="w-full max-w-xs border-r border-white/10 bg-[#121212] p-4 text-white md:min-h-screen">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wide text-white/50">Navigation</p>
        <h2 className="mt-1 text-lg font-semibold">{roleLabel}</h2>
      </div>

      <nav className="space-y-2">
        <button
          type="button"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-sm font-medium text-white/90"
        >
          Devoirs
        </button>
        <button
          type="button"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-sm font-medium text-white/90"
        >
          Groupe
        </button>
      </nav>
    </aside>
  )
}
