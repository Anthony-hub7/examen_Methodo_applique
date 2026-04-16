import DashboardSidebar from './DashboardSidebar'
import Footer from './Footer'

export default function DashboardLayout({ userName, roleLabel, onLogout, children }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex min-h-screen flex-col md:flex-row">
        <DashboardSidebar roleLabel={roleLabel} />

        <div className="flex flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-white/10 bg-[#121212] px-5 py-3">
            <span className="text-sm text-white/90">{userName}</span>
            <button
              onClick={onLogout}
              className="rounded-md bg-brand-red px-3 py-2 text-sm font-semibold text-white"
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
