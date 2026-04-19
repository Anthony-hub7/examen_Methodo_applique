import { playSong } from '@/services/soundManager'
import { Icon } from '@iconify/react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'

/* ─── animation variants ─── */
const sidebarVariants = {
  expanded: {
    width: 288,
    transition: { type: 'spring', stiffness: 200, damping: 24 },
  },
  collapsed: {
    width: 80,
    transition: { type: 'spring', stiffness: 200, damping: 24 },
  },
}

const labelVariants = {
  expanded: {
    opacity: 1,
    x: 0,
    display: 'block',
    transition: { duration: 0.22, delay: 0.08 },
  },
  collapsed: {
    opacity: 0,
    x: -12,
    transitionEnd: { display: 'none' },
    transition: { duration: 0.14 },
  },
}

/* ─── nav items builder ─── */
function buildItems(basePath, devoirsPath, groupesPath, communityPath) {
  return [
    {
      label: 'Accueil',
      subtitle: 'Tableau de bord',
      path: basePath,
      icon: 'solar:home-angle-bold-duotone',
    },
    {
      label: 'Devoirs',
      subtitle: 'Suivi des tâches',
      path: devoirsPath,
      icon: 'solar:clipboard-list-bold-duotone',
    },
    {
      label: 'Groupes',
      subtitle: 'Travail en équipe',
      path: groupesPath,
      icon: 'solar:users-group-rounded-bold-duotone',
    },
    {
      label: 'Communauté',
      subtitle: 'Discussions',
      path: communityPath,
      icon: 'solar:chat-round-dots-bold-duotone',
    },
  ]
}

/* ─── sidebar tooltip (collapsed mode) ─── */
function SidebarTooltip({ label, collapsed }) {
  if (!collapsed) return null
  return (
    <span className="sidebar-tooltip">
      {label}
    </span>
  )
}

/* ─── active background glow ─── */
function ActiveGlow() {
  return (
    <>
      {/* animated left pill */}
      <motion.span
        layoutId="sidebar-active-pill"
        className="absolute inset-y-1.5 left-0.5 w-[3px] rounded-full"
        style={{
          background: 'linear-gradient(180deg, #df2531, #ff6b6b)',
          boxShadow: '0 0 12px 2px rgba(223,37,49,0.6)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      />
      {/* background radial glow */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        style={{
          background:
            'radial-gradient(ellipse at 0% 50%, rgba(223,37,49,0.18) 0%, transparent 70%)',
        }}
      />
      {/* shimmer sweep */}
      <motion.div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="absolute -left-1/2 top-0 h-full w-1/2"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
          }}
          animate={{ x: ['0%', '400%'] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 4,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
    </>
  )
}

export default function DashboardSidebar({
  roleLabel,
  navLinks,
  onNavigate,
  collapsed = false,
  onToggleCollapse,
}) {
  const location = useLocation()

  const basePath = navLinks?.basePath || '/dashboard/student'
  const devoirsPath = navLinks?.devoirsPath || basePath
  const groupesPath = navLinks?.groupesPath || `${basePath}/groupes`
  const communityPath = navLinks?.communityPath || `${basePath}/community`
  const items = buildItems(basePath, devoirsPath, groupesPath, communityPath)

  const normalizePath = (path) => String(path).split('#')[0]
  const isActive = (path) => location.pathname === normalizePath(path)
  const handleNavigate = () => {
    playSong()
    onNavigate?.()
  }
  const canCollapse = typeof onToggleCollapse === 'function'
  const state = collapsed ? 'collapsed' : 'expanded'

  return (
    <motion.aside
      variants={sidebarVariants}
      animate={state}
      initial={false}
      className="sidebar-root h-full w-full overflow-hidden border-r border-white/[0.06] text-white md:min-h-screen"
      style={{
        background:
          'linear-gradient(180deg, rgba(10,10,10,0.95) 0%, rgba(6,6,6,0.98) 100%)',
      }}
    >
      <div className="flex h-full flex-col px-3 py-4">
        {/* ─── Logo / Brand ─── */}
        <div
          className={`flex items-center gap-3 rounded-2xl border border-white/[0.07] p-3 ${collapsed ? 'justify-center' : 'justify-between'}`}
          style={{
            background:
              'linear-gradient(135deg, rgba(223,37,49,0.06) 0%, rgba(26,26,26,0.6) 100%)',
          }}
        >
          <div
            className={`flex min-w-0 items-center gap-3 ${collapsed ? 'justify-center' : ''}`}
          >
            {/* Logo container with glow ring */}
            <motion.div
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background:
                  'linear-gradient(135deg, rgba(223,37,49,0.15), rgba(0,0,0,0.5))',
                border: '1px solid rgba(223,37,49,0.25)',
                boxShadow: '0 0 20px rgba(223,37,49,0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
              }}
            >
              <img
                src="/Logo.png"
                alt="StudySquad"
                className="h-8 w-8 object-contain drop-shadow-[0_0_6px_rgba(223,37,49,0.4)]"
              />
            </motion.div>

            <AnimatePresence initial={false}>
              {!collapsed ? (
                <motion.div
                  key="brand-copy"
                  variants={labelVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  className="min-w-0"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-brand-red/80">
                    StudySquad
                  </p>
                  <h2 className="truncate text-sm font-semibold leading-tight text-white">
                    {roleLabel}
                  </h2>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Collapse toggle */}
          {canCollapse && !collapsed ? (
            <motion.button
              type="button"
              onClick={onToggleCollapse}
              className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white md:inline-flex"
              aria-label="Réduire la sidebar"
              title="Réduire la sidebar"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Icon icon="solar:double-alt-arrow-left-bold-duotone" width={16} />
            </motion.button>
          ) : null}
        </div>

        {/* Expand button when collapsed */}
        {canCollapse && collapsed ? (
          <motion.button
            type="button"
            onClick={onToggleCollapse}
            className="mx-auto mt-3 flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white"
            aria-label="Étendre la sidebar"
            title="Étendre la sidebar"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              animate={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <Icon icon="solar:double-alt-arrow-left-bold-duotone" width={16} />
            </motion.div>
          </motion.button>
        ) : null}

        {/* ─── Navigation ─── */}
        <div className="mt-6 px-0.5">
          <AnimatePresence initial={false}>
            {!collapsed ? (
              <motion.p
                key="nav-label"
                variants={labelVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/30"
              >
                Navigation
              </motion.p>
            ) : null}
          </AnimatePresence>

          <nav className="space-y-1">
            {items.map((item) => {
              const active = isActive(item.path)

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavigate}
                  className={[
                    'group relative flex items-center overflow-hidden rounded-2xl transition-all duration-200',
                    collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5',
                    active
                      ? 'border border-brand-red/25 bg-brand-red/[0.08] text-white'
                      : 'border border-transparent text-white/60 hover:border-white/[0.06] hover:bg-white/[0.03] hover:text-white/90',
                  ].join(' ')}
                  title={collapsed ? item.label : undefined}
                  aria-current={active ? 'page' : undefined}
                >
                  {/* Active indicators */}
                  {active ? <ActiveGlow /> : null}

                  {/* Icon */}
                  <motion.span
                    className={[
                      'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200',
                      active
                        ? 'text-brand-red'
                        : 'text-white/50 group-hover:text-white/80',
                    ].join(' ')}
                    style={
                      active
                        ? {
                            background:
                              'linear-gradient(135deg, rgba(223,37,49,0.2), rgba(223,37,49,0.05))',
                            border: '1px solid rgba(223,37,49,0.2)',
                            boxShadow: '0 0 16px rgba(223,37,49,0.15)',
                          }
                        : {
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)',
                          }
                    }
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon icon={item.icon} width={20} />
                  </motion.span>

                  {/* Label */}
                  <AnimatePresence initial={false}>
                    {!collapsed ? (
                      <motion.div
                        key={`${item.label}-label`}
                        variants={labelVariants}
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        className="relative z-10 min-w-0 flex-1"
                      >
                        <div
                          className={`text-sm font-medium ${active ? 'text-white' : ''}`}
                        >
                          {item.label}
                        </div>
                        <div
                          className={`text-[11px] leading-tight ${active ? 'text-brand-red/70' : 'text-white/30'}`}
                        >
                          {item.subtitle}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  {/* Active badge */}
                  {active && !collapsed ? (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="relative z-10 flex h-6 w-6 items-center justify-center rounded-lg"
                      style={{
                        background: 'rgba(223,37,49,0.15)',
                        border: '1px solid rgba(223,37,49,0.25)',
                      }}
                    >
                      <Icon
                        icon="solar:arrow-right-bold"
                        width={12}
                        className="text-brand-red"
                      />
                    </motion.span>
                  ) : null}

                  {/* Tooltip for collapsed */}
                  <SidebarTooltip label={item.label} collapsed={collapsed} />
                </Link>
              )
            })}
          </nav>
        </div>

        {/* ─── Separator ─── */}
        <div className="my-4 px-2">
          <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        </div>

        {/* ─── Footer ─── */}
        <div className="mt-auto">
          <div
            className={`rounded-2xl border border-white/[0.06] p-3 ${collapsed ? 'text-center' : ''}`}
            style={{
              background:
                'linear-gradient(135deg, rgba(26,26,26,0.5) 0%, rgba(10,10,10,0.6) 100%)',
            }}
          >
            <div
              className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}
            >
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-red/15 bg-brand-red/[0.08] text-brand-red">
                <Icon icon="solar:shield-user-bold-duotone" width={20} />
                {/* Pulsing online dot */}
                <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                  <span className="relative inline-flex h-3 w-3 rounded-full border border-brand-dark bg-emerald-400" />
                </span>
              </div>

              <AnimatePresence initial={false}>
                {!collapsed ? (
                  <motion.div
                    key="footer-copy"
                    variants={labelVariants}
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    className="min-w-0"
                  >
                    <p className="text-xs font-semibold text-white/90">
                      Workspace actif
                    </p>
                    <p className="text-[11px] text-white/40">Connecté</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  )
}
